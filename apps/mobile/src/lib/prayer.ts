import { Coordinates, CalculationMethod, PrayerTimes, Madhab, Qibla } from 'adhan';
import type { CalculationParameters } from 'adhan';
import type { PrayerMethodId, PrayerMadhabId } from '../store/settingsStore';

export function getCalculationParams(
  method: PrayerMethodId,
  madhab: PrayerMadhabId
): CalculationParameters {
  let p: CalculationParameters;
  switch (method) {
    case 'mwl':
      p = CalculationMethod.MuslimWorldLeague();
      break;
    case 'isna':
      p = CalculationMethod.NorthAmerica();
      break;
    case 'egypt':
      p = CalculationMethod.Egyptian();
      break;
    case 'umm_al_qura':
      p = CalculationMethod.UmmAlQura();
      break;
    case 'tehran':
      p = CalculationMethod.Tehran();
      break;
    case 'karachi':
      p = CalculationMethod.Karachi();
      break;
    case 'moon_sighting':
      p = CalculationMethod.MoonsightingCommittee();
      break;
    default:
      p = CalculationMethod.MuslimWorldLeague();
  }
  p.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return p;
}

export function getPrayerTimesForDate(
  lat: number,
  lon: number,
  method: PrayerMethodId,
  madhab: PrayerMadhabId,
  date: Date
): PrayerTimes {
  const coords = new Coordinates(lat, lon);
  const params = getCalculationParams(method, madhab);
  return new PrayerTimes(coords, date, params);
}

export function qiblaBearingDegrees(lat: number, lon: number): number {
  return Qibla(new Coordinates(lat, lon));
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

const SALAH_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function timeForSalah(times: PrayerTimes, name: PrayerName): Date {
  switch (name) {
    case 'fajr':
      return times.fajr;
    case 'sunrise':
      return times.sunrise;
    case 'dhuhr':
      return times.dhuhr;
    case 'asr':
      return times.asr;
    case 'maghrib':
      return times.maghrib;
    case 'isha':
      return times.isha;
    default:
      return times.dhuhr;
  }
}

/** Next five obligatory prayers (skips sunrise); wraps after isha to tomorrow fajr. */
export function nextSalahAfter(
  times: PrayerTimes,
  now: Date
): { name: PrayerName; at: Date } {
  for (const name of SALAH_ORDER) {
    const at = timeForSalah(times, name);
    if (at.getTime() > now.getTime()) {
      return { name, at };
    }
  }
  const tomorrow = new Date(times.date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const coords = times.coordinates;
  const nextDay = new PrayerTimes(coords, tomorrow, times.calculationParameters);
  return { name: 'fajr', at: nextDay.fajr };
}
