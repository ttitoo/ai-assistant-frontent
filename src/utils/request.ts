import { AxiosRequestConfig } from 'axios';
import { ApiErrorResponse, ApiResponse, create } from 'apisauce';
import { path } from 'ramda';
import { transformToSubmittableCase, transformToLocalCase } from './case';
import { getAccessToken } from './storage';
import { log } from './log';

export interface Api {
  get: <T>(url: string, params?: object) => Promise<ApiResponse<T>>;
  post: <T>(url: string, data: object) => Promise<ApiResponse<T>>;
  put: <T>(url: string, data: object) => Promise<ApiResponse<T>>;
  delete: <T>(url: string, data: object) => Promise<ApiResponse<T>>;
  fetch: <T>(
    url: string,
    method: string,
    postData: object
  ) => Promise<ApiResponse<T>>;
}

const statusMessages: Map = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
};

const getStatusDescription = (status: number): string | undefined =>
  statusMessages[status];

const addCaseHooks = (api: any): Api => {
  api.addRequestTransform((request: AxiosRequestConfig) => {
    request.params = transformToSubmittableCase(request.params);
    request.data = transformToSubmittableCase(request.data);
  });
  api.addResponseTransform((response: ApiErrorResponse<any>) => {
    if (!path(['config', 'env', 'noCaseTransform'])(response)) {
      if (response.ok) {
        response.data = transformToLocalCase(response.data || []);
      }
    }
  });

  return api;
};

const apiPrefix: string = import.meta.env.VITE_API_PREFIX;

const createAPI = (baseURL: string) => {
  // log('access_token')(getAccessToken());
  const options = {
    baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
      'Access-Control-Allow-Headers':
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, access-control-allow-origin',
      "Authorization": getAccessToken(),
    },
    timeout: 30 * 1000
  };

  return addCaseHooks(create(options));
};

export default createAPI(apiPrefix);

export { createAPI, getStatusDescription };
