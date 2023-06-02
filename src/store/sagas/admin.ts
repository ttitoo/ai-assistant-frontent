import {
  call,
  put,
  takeLatest
} from 'redux-saga/effects';
import {
  curryN,
  __
} from 'ramda';
import api from '../../api/admin';
import { raiseErrorOnCondition, proxied, } from './common';

const prefix: string = 'admin';

function* listBatches(action) {
  const { page } = action.payload;
  const payloads = raiseErrorOnCondition(yield call(api.listBatches, page));
  yield put({ type: `${prefix}/listBatchesSuccess`, payload: { payloads, page } });
}

function* dispatchAction(action) {
  const { action: actionName, uid } = action.payload;
  const sampleBatch = raiseErrorOnCondition(yield call(api.dispatchAction, actionName, uid));
  yield put({ type: `${prefix}/dispatchActionSuccess`, payload: { action: actionName, sampleBatch, } });
}

const adminProxied = curryN(3, proxied)(prefix);
// const adminCacheProxied = curryN(3, cacheProxied)(prefix);

function* adminSaga() {
  yield takeLatest(`${prefix}/listBatches`, adminProxied(listBatches));
  yield takeLatest(`${prefix}/dispatchAction`, adminProxied(dispatchAction));
}

export default adminSaga;
