import { HDate, Location, Zmanim, GeoLocation as HebcalGeoLocation } from '@hebcal/core';

interface ShabbatTimes {
  candleLighting: Date;
  havdalah: Date;
}

interface ShabbatStatus {
  isShabbat: boolean;
  currentTime: Date;
  nextShabbatStart: Date | null;
  shabbatEnd: Date | null;
  minutesUntilStart: number | null;
  minutesUntilEnd: number | null;
}

const TEL_AVIV_LOCATION = new Location(
  32.0853,
  34.7818,
  false,
  'Asia/Jerusalem',
  'Tel Aviv',
  'IL'
);

const CANDLE_LIGHTING_MINUTES = 18;
const HAVDALAH_MINUTES = 42;

export function getShabbatTimes(
  date: Date = new Date(),
  location: Location = TEL_AVIV_LOCATION
): ShabbatTimes {
  const hdate = new HDate(date);
  
  const friday = getNextFriday(hdate);
  const saturday = new HDate(friday.abs() + 1);
  
  const geoLoc = new HebcalGeoLocation(
    location.getLocationName() ?? 'Location',
    location.getLatitude(),
    location.getLongitude(),
    0,
    location.getTzid()
  );
  const fridayZmanim = new Zmanim(geoLoc, friday.greg(), false);
  const saturdayZmanim = new Zmanim(geoLoc, saturday.greg(), false);
  
  const sunset = fridayZmanim.sunset();
  const candleLighting = new Date(sunset.getTime() - CANDLE_LIGHTING_MINUTES * 60 * 1000);
  
  const saturdaySunset = saturdayZmanim.sunset();
  const havdalah = new Date(saturdaySunset.getTime() + HAVDALAH_MINUTES * 60 * 1000);
  
  return {
    candleLighting,
    havdalah,
  };
}

function getNextFriday(hdate: HDate): HDate {
  const dayOfWeek = hdate.getDay();
  
  if (dayOfWeek === 5) {
    return hdate;
  }
  
  if (dayOfWeek === 6) {
    return new HDate(hdate.abs() + 6);
  }
  
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  return new HDate(hdate.abs() + daysUntilFriday);
}

export function isCurrentlyShabbat(
  date: Date = new Date(),
  location: Location = TEL_AVIV_LOCATION
): boolean {
  const times = getShabbatTimes(date, location);
  const now = date.getTime();
  
  if (now >= times.candleLighting.getTime() && now <= times.havdalah.getTime()) {
    return true;
  }
  
  const lastWeekDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekTimes = getShabbatTimes(lastWeekDate, location);
  
  if (now >= lastWeekTimes.candleLighting.getTime() && now <= lastWeekTimes.havdalah.getTime()) {
    return true;
  }
  
  return false;
}

export function getShabbatStatus(
  date: Date = new Date(),
  location: Location = TEL_AVIV_LOCATION
): ShabbatStatus {
  const now = date.getTime();
  const times = getShabbatTimes(date, location);
  
  const isShabbat = isCurrentlyShabbat(date, location);
  
  if (isShabbat) {
    const minutesUntilEnd = Math.floor(
      (times.havdalah.getTime() - now) / 60000
    );
    
    return {
      isShabbat: true,
      currentTime: date,
      nextShabbatStart: null,
      shabbatEnd: times.havdalah,
      minutesUntilStart: null,
      minutesUntilEnd: Math.max(0, minutesUntilEnd),
    };
  }
  
  const minutesUntilStart = Math.floor(
    (times.candleLighting.getTime() - now) / 60000
  );
  
  return {
    isShabbat: false,
    currentTime: date,
    nextShabbatStart: times.candleLighting,
    shabbatEnd: null,
    minutesUntilStart: Math.max(0, minutesUntilStart),
    minutesUntilEnd: null,
  };
}

export function formatTimeUntil(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  return `${days}d ${remainingHours}h`;
}

export function formatShabbatTime(date: Date): string {
  return date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export { TEL_AVIV_LOCATION };
export type { ShabbatTimes, ShabbatStatus };
