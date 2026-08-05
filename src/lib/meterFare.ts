/** Meter fare calculation — same rates as fixed pricing */

const RATES = {
  car: { base: 4, baseMiles: 1, midRate: 2.0, midLimit: 30, highRate: 1.4 },
  mpv: { base: 6, baseMiles: 1, midRate: 2.3, midLimit: 30, highRate: 1.5 },
} as const;

const SUNDAY_RATES = {
  car: { minFare: 5, minMiles: 1.4, surchargePercent: 1.5 },
  mpv: { minFare: 7, minMiles: 1.4, surchargePercent: 1.5 },
} as const;

type Vehicle = "car" | "mpv";

function calcNormal(dist: number, r: typeof RATES.car): number {
  if (dist <= r.baseMiles) return r.base;
  if (dist <= r.midLimit) return r.base + (dist - r.baseMiles) * r.midRate;
  const mid = (r.midLimit - r.baseMiles) * r.midRate;
  const high = (dist - r.midLimit) * r.highRate;
  return r.base + mid + high;
}

function isSundayOrHoliday(): boolean {
  const d = new Date();
  if (d.getDay() === 0) return true;
  const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const holidays = new Set(["01-01", "03-29", "04-01", "05-06", "05-27", "08-25", "12-25", "12-26"]);
  return holidays.has(key);
}

export function calculateMeterFare(distanceMiles: number, vehicle: Vehicle = "car"): number {
  if (distanceMiles <= 0) return 0;
  const r = RATES[vehicle];
  let fare: number;
  if (isSundayOrHoliday()) {
    const s = SUNDAY_RATES[vehicle];
    if (distanceMiles <= s.minMiles) {
      fare = s.minFare;
    } else {
      fare = calcNormal(distanceMiles, r) * (1 + s.surchargePercent / 100);
    }
  } else {
    fare = calcNormal(distanceMiles, r);
  }
  return Math.round(fare * 100) / 100;
}

export function metersToMiles(meters: number): number {
  return meters * 0.000621371;
}

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
