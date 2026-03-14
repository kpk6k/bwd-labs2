const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export const setAccessToken = (token: string) =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const removeAccessToken = () =>
  localStorage.removeItem(ACCESS_TOKEN_KEY);

export const setUser = (user: any) =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};
export const removeUser = () => localStorage.removeItem(USER_KEY);

export const clearAuth = () => {
  removeAccessToken();
  removeUser();
};
