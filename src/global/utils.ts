import * as crypto from 'crypto';

export const generateRamdomId = (...suffix: string[]): string => {
  let result = '';
  suffix.map((str) => {
    result = result + '-' + str;
  });
  return result.substring(1);
};

export const getRandomString = (length: number): string => {
  return crypto.randomBytes(length / 2 || 5).toString('hex');
};

export const getToday = (time?: Date): string => {
  const date = time || getLocalTime();
  const year = date.getFullYear().toString();
  const month = ('0' + (1 + date.getMonth())).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return year.substring(2, 4) + month + day;
};

export const getLocalTime = (): Date => {
  const now = new Date();
  return new Date(
    now.getTime() + now.getTimezoneOffset() * 60 * 1000 + 9 * 60 * 60 * 1000,
  );
};

export const getWeekRange = (offset = 0) => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 일요일은 0, 월요일은 1, ..., 토요일은 6
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 7 * offset);
  startOfWeek.setHours(0, 0, 0, 0); // 해당 주의 시작일 00:00:00

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999); // 해당 주의 마지막일 23:59:59

  return { startOfWeek, endOfWeek };
};
