import { ValidationError } from '../domain/trip.js';

let loadedKey = '';
let loading;

export function parseMapsBrowserKey(value) {
  const key = String(value || '').trim();
  if (!key) return '';
  if (!/^AIza[\w-]{35}$/.test(key)) throw new ValidationError('Google Maps Browser Key 格式不正確；請貼上 Google Cloud 的 API key，不要貼服務帳戶或 Server Key。');
  return key;
}

// ponytail: Maps JS permits one key per page; changing projects requires a reload.
export async function loadPlaces(key) {
  const parsed = parseMapsBrowserKey(key);
  if (!parsed) throw new ValidationError('請先輸入 Google Maps Browser Key。');
  if (loadedKey && loadedKey !== parsed) throw new ValidationError('已載入另一把 Google Maps Key；請重新整理頁面後再驗證新 Key。');
  if (loading) return loading;
  loadedKey = parsed;
  loading = new Promise((resolve, reject) => {
    const callback = '__travelOsMapsReady';
    const script = document.createElement('script');
    const timer = setTimeout(() => fail('Google Maps 載入逾時；請檢查網路、帳單、網站與 API 限制。'), 15000);
    function fail(message) {
      clearTimeout(timer);
      delete window[callback];
      script.remove();
      loadedKey = ''; loading = null;
      reject(new ValidationError(message));
    }
    window[callback] = async () => {
      clearTimeout(timer);
      delete window[callback];
      try { resolve(await window.google.maps.importLibrary('places')); }
      catch { fail('Places 載入失敗；請確認 Maps JavaScript API 與 Places API (New) 已啟用。'); }
    };
    script.onerror = () => fail('Google Maps 載入失敗；請檢查 Browser Key、網路及網站限制。');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(parsed)}&loading=async&v=weekly&callback=${callback}`;
    script.async = true;
    document.head.append(script);
  });
  return loading;
}

export function mapsPlaceUrl(place) {
  const query = String(place.formattedAddress || place.displayName || '').trim();
  if (!query) throw new ValidationError('Google 地點缺少名稱或地址。');
  const url = new URL('https://www.google.com/maps/search/');
  url.searchParams.set('api', '1');
  url.searchParams.set('query', query);
  if (place.id) url.searchParams.set('query_place_id', String(place.id));
  return url.href;
}
