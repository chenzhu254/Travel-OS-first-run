import { ValidationError } from '../domain/trip.js';

export function mapSearchUrl(query) {
  const value = String(query || '').trim();
  if (!value) throw new ValidationError('需要地點名稱或地址。');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}

export function itemMapUrl(item) {
  return item.mapsUrl || mapSearchUrl(item.location || item.title);
}

export function parkingMapUrl(spot) {
  if (!spot?.name) return '';
  return spot.mapsUrl || mapSearchUrl(spot.name);
}

export function routeMapUrl(origin, destination, mode = 'driving') {
  if (!['driving', 'walking'].includes(mode)) throw new ValidationError('不支援的路線模式。');
  const from = String(origin.location || origin.title || '').trim();
  const to = String(destination.location || destination.title || '').trim();
  if (!from || !to) throw new ValidationError('路線需要起點與目的地。');
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=${mode}`;
}
