// src/utils/timeFormator.ts
export const formatRelativeTime = (date: string | Date): string => {
  const targetDate = new Date(date);

  // Check if the date is valid
  if (isNaN(targetDate.getTime())) {
    console.warn(`Invalid date provided to formatRelativeTime: ${date}`);
    return 'Unknown time';
  }

  const now = new Date();
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always', style: 'long' });

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec${diffInSeconds === 1 ? '' : 's'} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return formatter.format(-diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return formatter.format(-diffInDays, 'day');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return formatter.format(-diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return formatter.format(-diffInYears, 'year');
};