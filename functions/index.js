"use strict";

const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

initializeApp();
const serverKey = defineSecret('GOOGLE_MAPS_SERVER_KEY');
const base = { region:'us-central1', timeoutSeconds:20, memory:'256MiB', maxInstances:3 };
const paid = { ...base, secrets:[serverKey] };

function auth(request) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', '請先登入自己的 Firebase。');
  return request.auth.uid;
}
function text(value, label, max = 300) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new HttpsError('invalid-argument', `${label}格式不正確。`);
  return value.trim();
}
function point(value) {
  const latitude = Number(value?.latitude), longitude = Number(value?.longitude);
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180) throw new HttpsError('invalid-argument', '座標格式不正確。');
  return { latitude, longitude };
}
async function limit(uid, name, max) {
  const day = new Date().toISOString().slice(0, 10);
  async function count(ref, ceiling) {
    const result = await ref.transaction((current) => ({ day, count:current?.day === day ? Math.min(Number(current.count || 0) + 1, ceiling + 1) : 1 }), undefined, false);
    return result.snapshot.val().count;
  }
  if (await count(getDatabase().ref(`apiRateGlobal/${name}`), 500) > 500) throw new HttpsError('resource-exhausted', '今日全站 Google API 使用次數已達上限；明日再試。');
  if (await count(getDatabase().ref(`apiRate/${uid}/${name}`), max) > max) throw new HttpsError('resource-exhausted', '今日此功能的使用次數已達上限；明日再試。');
}
async function google(url, options = {}) {
  let response, body;
  try {
    response = await fetch(url, { ...options, signal:AbortSignal.timeout(12000) });
    body = await response.json();
  } catch { throw new HttpsError('unavailable', 'Google API 暫時無法連線。'); }
  if (response.status === 429) throw new HttpsError('resource-exhausted', 'Google API 配額不足。');
  if (!response.ok) throw new HttpsError('failed-precondition', 'Google API 拒絕請求；請確認 API 已啟用、帳單及 Server Key 限制。');
  return body;
}

exports.getCapabilities = onCall(paid, async (request) => {
  auth(request);
  return { routes:true, geocoding:true, weather:true, serverKeyReady:Boolean(serverKey.value()), region:'us-central1' };
});

exports.geocodeAddress = onCall(paid, async (request) => {
  const uid = auth(request), address = text(request.data?.address, '地址');
  await limit(uid, 'geocode', 100);
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('key', serverKey.value());
  const data = await google(url);
  if (data.status === 'ZERO_RESULTS') throw new HttpsError('not-found', '找不到此地址。');
  if (data.status !== 'OK') throw new HttpsError('failed-precondition', 'Geocoding API 無法處理此地址；請檢查設定與配額。');
  const found = data.results?.[0];
  return { ...point({ latitude:found?.geometry?.location?.lat, longitude:found?.geometry?.location?.lng }), googleAddress:String(found.formatted_address || address).slice(0, 300), googlePlaceId:String(found.place_id || '').slice(0, 200) };
});

exports.calculateRoute = onCall(paid, async (request) => {
  const uid = auth(request), origin = point(request.data?.origin), destination = point(request.data?.destination);
  const travelMode = request.data?.travelMode;
  if (!['DRIVE','WALK'].includes(travelMode)) throw new HttpsError('invalid-argument', '路線模式只接受 DRIVE 或 WALK。');
  await limit(uid, 'route', 100);
  const route = (await google('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'X-Goog-Api-Key':serverKey.value(), 'X-Goog-FieldMask':'routes.duration,routes.distanceMeters' },
    body:JSON.stringify({ origin:{ location:{ latLng:origin } }, destination:{ location:{ latLng:destination } }, travelMode, languageCode:'zh-TW', units:'METRIC' }),
  })).routes?.[0];
  const seconds = Number(String(route?.duration || '').replace(/s$/, ''));
  const meters = Number(route?.distanceMeters);
  if (!route || !Number.isFinite(seconds) || !Number.isFinite(meters)) throw new HttpsError('not-found', '找不到有效路線。');
  return { durationMinutes:Math.max(1, Math.ceil(seconds / 60)), distanceKm:Number((meters / 1000).toFixed(1)) };
});

exports.getWeather = onCall(paid, async (request) => {
  const uid = auth(request), location = point(request.data?.location), date = text(request.data?.date, '日期', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpsError('invalid-argument', '日期格式不正確。');
  await limit(uid, 'weather', 30);
  const url = new URL('https://weather.googleapis.com/v1/forecast/days:lookup');
  for (const [name, value] of Object.entries({ key:serverKey.value(), 'location.latitude':location.latitude, 'location.longitude':location.longitude, days:10, pageSize:10, languageCode:'zh-TW', unitsSystem:'METRIC' })) url.searchParams.set(name, String(value));
  const data = await google(url);
  const forecast = data.forecastDays?.find(({ displayDate:v }) => v && `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}` === date);
  if (!forecast) return { available:false, reason:'OUT_OF_RANGE' };
  const temperature = Number(forecast.maxTemperature?.degrees);
  if (!Number.isFinite(temperature)) throw new HttpsError('data-loss', '天氣資料不完整。');
  return { available:true, date, temperature, description:String(forecast.daytimeForecast?.weatherCondition?.description?.text || '天氣預報').slice(0, 120), precipitationProbability:Number(forecast.daytimeForecast?.precipitation?.probability?.percent || 0) };
});
