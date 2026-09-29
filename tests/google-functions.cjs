const { test } = require('node:test');
const assert = require('node:assert/strict');
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
