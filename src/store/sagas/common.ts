import { ApiResponse } from "apisauce";
import { any, compose, curry, flip, is, mapObjIndexed, not, nthArg, path, pathOr, prop, remove, T, values, __ } from "ramda";
import { call, delay, put, select } from "redux-saga/effects";
import { toast, } from 'react-toastify';
import { isBlank } from "../../utils/common";
import { log, tapLog } from "../../utils/log";

const raiseErrorOnCondition = (resp: ApiResponse) => {
  if (!resp.ok || is(String, resp.data.error)) {
    throw new Error(resp.data.error);
  }

  return resp.data;
}

function* proxied(namespace, fn, action) {
  const shouldToggleLoading = pathOr(true, ['payload', 'toggleLoading'])(action);
  if (shouldToggleLoading) {
    yield put({ type: `${namespace}/toggle`, payload: { key: 'loading', value: true } })
  }
  try {
    yield fn(action);
  } catch (e) {
    yield put({ type: `${namespace}/setError`, message: e.message })
  }
  if (shouldToggleLoading) {
    // to prevent flash
    yield delay(200);
    yield put({ type: `${namespace}/toggle`, payload: { key: 'loading', value: false } })
  }
}

function* cacheProxy(namespace: string, fn, action, cacheSelectorPathFn: (action) => string[] | { [key: string]: string[] }) {
  yield put({ type: `${namespace}/toggle`, payload: { key: 'loading', value: true } })
  const selectors = cacheSelectorPathFn(action);
  let cached = undefined;
  if (is(Array, selectors)) {
    cached = yield select(path(selectors));
  } else {
    cached = {}
    const state = yield select(prop(namespace));
    mapObjIndexed((selector: string[], key: string) => {
      cached[key] = compose(flip(path)(state), tapLog('aaa'), remove(0, 1))(selector);
    }, selectors);
  }
  log('path')(cacheSelectorPathFn(action))
  log('cached')(cached)
  // TODO: check cache ttl
  if (is(Array, selectors) ? compose(not, isBlank)(cached) : compose(not, any(isBlank), values)(cached)) {
    yield delay(300); // to ensure the loading toggle broadcasted
    yield put({ type: `${namespace}/cacheSuccess`, payload: cached, });
  } else {
    yield call(fn, action);
  }
  yield put({ type: `${namespace}/toggle`, payload: { key: 'loading', value: false } })
}

const cacheProxied = (namespace, fn, cacheSelectorPathFn: (action) => string[] | { [key: string]: string[] }) => curry(cacheProxy)(namespace, fn, __, cacheSelectorPathFn);

export { raiseErrorOnCondition, proxied, cacheProxied, };
