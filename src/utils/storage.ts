import { isBlank } from './common';

interface SignableResource {
  username?: string
  accessToken?: string
}

const put = (key: string, value: any): void => window.localStorage.setItem(key, value);

const get = (key: string): any => window.localStorage.getItem(key);

const remove = (key: string): void => window.localStorage.removeItem(key);

const clear = (): void => window.localStorage.clear();

const getAccessToken = (): string | undefined => {
  return get('access_token');
}

const persistAccessToken = (res: SignableResource): void => {
  const { username, accessToken } = res;
  if (!isBlank(username)) {
    put('authenticate_as', username);
  }

  if (!isBlank(accessToken)) {
    put('access_token', accessToken);
  }
}

const clearAccessToken = (clearLoginAs?: boolean): void => {
  remove('access_token');
  if (clearLoginAs) {
    remove('authenticate_as');
  }
}

export {
  put,
  get,
  remove,
  clear,
  getAccessToken,
  persistAccessToken,
  clearAccessToken,
};

