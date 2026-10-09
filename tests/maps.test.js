import { describe, expect, it } from 'vitest';
import { itemMapUrl, mapSearchUrl, parkingMapUrl, routeMapUrl } from '../src/providers/maps.js';

describe('Google Maps external navigation', () => {
  it('uses an exact destination link and keeps parking navigation separate', () => {
    const item = { title:'Sample museum', location:'Sample City', mapsUrl:'https://maps.app.goo.gl/destination' };
    expect(itemMapUrl(item)).toBe('https://maps.app.goo.gl/destination');
    expect(parkingMapUrl({ name:'Sample garage' })).toBe(mapSearchUrl('Sample garage'));
    expect(itemMapUrl({ title:'Sample museum', location:'' })).toBe(mapSearchUrl('Sample museum'));
  });
  it('builds a keyless Maps URL with encoded input', () => {
    expect(mapSearchUrl('City Hall & Park')).toBe('https://www.google.com/maps/search/?api=1&query=City%20Hall%20%26%20Park');
  });
  it('rejects an empty navigation query', () => {
    expect(() => mapSearchUrl('   ')).toThrow(/地點/);
  });
  it('opens encoded driving and walking directions without a key', () => {
    const origin = { title:'A & B' }, destination = { location:'City Hall', title:'Hall' };
    const url = new URL(routeMapUrl(origin, destination, 'walking'));
    expect(url.searchParams.get('origin')).toBe('A & B');
    expect(url.searchParams.get('destination')).toBe('City Hall');
    expect(url.searchParams.get('travelmode')).toBe('walking');
    expect(new URL(routeMapUrl(origin, destination)).searchParams.get('travelmode')).toBe('driving');
    expect(url.searchParams.has('key')).toBe(false);
    expect(() => routeMapUrl(origin, destination, 'invalid')).toThrow();
  });
});
