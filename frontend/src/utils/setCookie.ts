// utils/setCookie.ts
import Cookies from 'js-cookie';

export const setAppCookie = (
  key: string,
  value: string | object,
  options?: Cookies.CookieAttributes
) => {
  const isProd = import.meta.env.VITE_DEV === 'production';

  const defaultOptions: Cookies.CookieAttributes = {
    expires: 7,
    secure: true,
    sameSite: 'Lax',
    ...(isProd && { domain: '.muhammedameen.site' }),
    ...options
  };

  Cookies.set(
    key,
    typeof value === 'string' ? value : JSON.stringify(value),
    defaultOptions
  );
};
