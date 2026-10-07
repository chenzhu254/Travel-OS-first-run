const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const functionsRequire = require('node:module').createRequire(require.resolve('../functions'));
const { calculateRoute, geocodeAddress, getWeather } = require('../functions');

const loggedIn = { uid:'test-user' };
const denied = (code) => (error) => error.code === code;

test('paid callable endpoints require Firebase authentication', async () => {
  await assert.rejects(calculateRoute.run({ auth:null, data:{} }), denied('unauthenticated'));
  await assert.rejects(geocodeAddress.run({ auth:null, data:{} }), denied('unauthenticated'));
  await assert.rejects(getWeather.run({ auth:null, data:{} }), denied('unauthenticated'));
});

test('rejects invalid coordinates, address and date before any Google request', async () => {
  await assert.rejects(calculateRoute.run({ auth:loggedIn, data:{ origin:{ latitude:91, longitude:0 }, destination:{ latitude:0, longitude:0 }, travelMode:'DRIVE' } }), denied('invalid-argument'));
  await assert.rejects(geocodeAddress.run({ auth:loggedIn, data:{ address:'' } }), denied('invalid-argument'));
  await assert.rejects(getWeather.run({ auth:loggedIn, data:{ location:{ latitude:0, longitude:0 }, date:'tomorrow' } }), denied('invalid-argument'));
});

// Only the database, secret and HTTP boundary are simulated; no cloud resources or paid APIs are used.
function simulatedBackend() {
  const counters = new Map(), calls = [], endpoints = {};
  let response = { status:200, body:{} };
  const mocks = {
    'firebase-admin/app':{ initializeApp() {} },
    'firebase-admin/database':{ getDatabase:() => ({ ref:(path) => ({ transaction:async (update) => {
      const value = update(counters.get(path));
      counters.set(path, value);
      return { snapshot:{ val:() => value } };
    } }) }) },
    'firebase-functions/params':{ defineSecret:() => ({ value:() => 'test-only-key' }) },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../functions'), 'utf8'), {
    require:(id) => mocks[id] || functionsRequire(id), exports:endpoints, URL, AbortSignal,
    fetch:async (url, options) => {
      calls.push({ url:String(url), options });
      if (response instanceof Error) throw response;
      return { status:response.status, ok:response.status < 400, json:async () => response.body };
    },
  });
  return { endpoints, calls, counters, respond:(value) => { response = value; } };
}

test('rejects coercible empty coordinates and impossible dates without spending quota', async () => {
  const { endpoints, calls, counters } = simulatedBackend();
  for (const latitude of [null, '', ' ', false, [], '0']) {
    await assert.rejects(endpoints.calculateRoute.run({ auth:loggedIn, data:{ origin:{ latitude, longitude:0 }, destination:{ latitude:0, longitude:0 }, travelMode:'DRIVE' } }), denied('invalid-argument'));
  }
  for (const date of ['2026-02-30', '2026-13-01', '2026-00-01']) {
    await assert.rejects(endpoints.getWeather.run({ auth:loggedIn, data:{ location:{ latitude:0, longitude:0 }, date } }), denied('invalid-argument'));
  }
  assert.equal(calls.length, 0);
  assert.equal(counters.size, 0);
});

test('uses the documented Google request fields and parses successful responses', async () => {
  const { endpoints, calls, respond } = simulatedBackend();
  respond({ status:200, body:{ status:'OK', results:[{ geometry:{ location:{ lat:0, lng:0 } }, formatted_address:'Example address', place_id:'example-place' }] } });
  const point = await endpoints.geocodeAddress.run({ auth:loggedIn, data:{ address:'Example address' } });
  assert.equal(point.latitude, 0);
  assert.equal(new URL(calls[0].url).searchParams.get('address'), 'Example address');
  respond({ status:200, body:{ routes:[{ duration:'121.5s', distanceMeters:1240 }] } });
  const route = await endpoints.calculateRoute.run({ auth:loggedIn, data:{ origin:point, destination:{ latitude:1, longitude:1 }, travelMode:'WALK' } });
  assert.equal(route.durationMinutes, 3);
  assert.equal(route.distanceKm, 1.2);
  assert.equal(JSON.parse(calls[1].options.body).travelMode, 'WALK');
  assert.equal(calls[1].options.headers['X-Goog-FieldMask'], 'routes.duration,routes.distanceMeters');
  respond({ status:200, body:{ forecastDays:[{ displayDate:{ year:2028, month:2, day:29 }, maxTemperature:{ degrees:21 }, daytimeForecast:{ weatherCondition:{ description:{ text:'Clear' } }, precipitation:{ probability:{ percent:10 } } } }] } });
  const weather = await endpoints.getWeather.run({ auth:loggedIn, data:{ location:point, date:'2028-02-29' } });
  assert.equal(weather.available, true);
  assert.equal(weather.temperature, 21);
  assert.equal(weather.precipitationProbability, 10);
  assert.equal(new URL(calls[2].url).searchParams.get('days'), '10');
});

test('handles Google denial, exhausted quota, no results and network failure honestly', async () => {
  const { endpoints, calls, counters, respond } = simulatedBackend();
  const request = { auth:loggedIn, data:{ address:'Example address' } };
  for (const [response, code] of [
    [{ status:403, body:{} }, 'failed-precondition'],
    [{ status:429, body:{} }, 'resource-exhausted'],
    [{ status:200, body:{ status:'ZERO_RESULTS' } }, 'not-found'],
    [{ status:200, body:{ status:'OVER_QUERY_LIMIT' } }, 'resource-exhausted'],
    [new Error('offline'), 'unavailable'],
  ]) {
    respond(response);
    await assert.rejects(endpoints.geocodeAddress.run(request), denied(code));
  }
  respond({ status:200, body:{ forecastDays:[] } });
  assert.equal((await endpoints.getWeather.run({ auth:loggedIn, data:{ location:{ latitude:0, longitude:0 }, date:'2028-02-29' } })).available, false);
  const day = new Date().toISOString().slice(0, 10);
  counters.set('apiRate/test-user/geocode', { day, count:100 });
  const previousCalls = calls.length;
  await assert.rejects(endpoints.geocodeAddress.run(request), denied('resource-exhausted'));
  assert.equal(calls.length, previousCalls);
  counters.set('apiRateGlobal/geocode', { day, count:500 });
  await assert.rejects(endpoints.geocodeAddress.run(request), denied('resource-exhausted'));
  assert.equal(calls.length, previousCalls);
});

test('does not turn incomplete Google responses into made-up travel estimates', async () => {
  const { endpoints, respond } = simulatedBackend();
  const request = { auth:loggedIn, data:{ origin:{ latitude:0, longitude:0 }, destination:{ latitude:1, longitude:1 }, travelMode:'DRIVE' } };
  for (const route of [{ distanceMeters:100 }, { duration:'12s', distanceMeters:null }, { duration:'-1s', distanceMeters:100 }]) {
    respond({ status:200, body:{ routes:[route] } });
    await assert.rejects(endpoints.calculateRoute.run(request), (error) => denied('not-found')(error) && error.details?.reason === 'NO_RESULTS');
  }
  const forecast = { displayDate:{ year:2028, month:2, day:29 }, maxTemperature:{ degrees:null } };
  respond({ status:200, body:{ forecastDays:[forecast] } });
  const weatherRequest = { auth:loggedIn, data:{ location:{ latitude:0, longitude:0 }, date:'2028-02-29' } };
  await assert.rejects(endpoints.getWeather.run(weatherRequest), denied('data-loss'));
  forecast.maxTemperature.degrees = -5;
  const weather = await endpoints.getWeather.run(weatherRequest);
  assert.equal(weather.temperature, -5);
  assert.equal(weather.precipitationProbability, null);
});
