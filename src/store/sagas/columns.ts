import { call, put, select, takeLatest } from 'redux-saga/effects'
import { apply, compose, curry, curryN, identity, juxt, map, mergeRight, objOf, path, prop, __ } from 'ramda';
import api from '../../api/columns';
import { raiseErrorOnCondition, proxied, cacheProxied } from './common';
import { toast, } from 'react-toastify';
import { snakeCase } from 'change-case';

const dataToJson = compose(
  apply(mergeRight),
  juxt([identity, compose(objOf('data'), JSON.parse, prop('data'))])
);

function* list(action) {
  const { table, column } = action.payload;
  const res = yield call(api.list, table, column);
  raiseErrorOnCondition(res)
  const payloads = compose(map(dataToJson), prop('data'))(res);
  yield put({ type: 'columns/listSuccess', payload: { table, column, payloads, } });
}

function* create(action) {
  yield put({ type: 'columns/toggle', payload: { key: 'submitting', value: true } });
  const { table, column, data } = action.payload;
  const res = yield call(api.create, table, column, data);
  const payload = compose(dataToJson, raiseErrorOnCondition)(res);
  const tables = yield select(path(['app', 'tables']));
  toast.success(`"${path([snakeCase(payload.table), 'columns', compose(snakeCase, prop('column'))(payload)], tables)}"记录创建成功!`)
  yield put({ type: 'columns/createSuccess', payload: { table, column, payload, } });
  yield put({ type: 'columns/toggle', payload: { key: 'submitting', value: false } });
}

function* runSample(action) {
  yield put({ type: 'columns/toggle', payload: { key: 'success', value: false } });
  yield put({ type: 'columns/toggle', payload: { key: 'submitting', value: true } });
  const { columnDetailUid, columnSampleUid, model, } = action.payload;
  const res = yield call(api.runSample, columnDetailUid, columnSampleUid, model);
  try {
    raiseErrorOnCondition(res)
    yield put({ type: 'columns/toggle', payload: { key: 'success', value: true } });
    toast.success("已添加任务到队列!")
  } catch (ex) {
    toast.error(ex.message);
  } finally {
    yield put({ type: 'columns/toggle', payload: { key: 'submitting', value: false } });
  }
}

function* run(action) {
  yield put({ type: 'columns/toggle', payload: { key: 'submitting', value: true } });
  const { uid, } = action.payload;
  yield call(api.run, uid);
  toast.success("Started!")
  yield put({ type: 'columns/toggle', payload: { key: 'submitting', value: false } });
}

function* listSampleBatches(action) {
  const { uid, } = action.payload;
  const payloads = raiseErrorOnCondition(yield call(api.listSampleBatches, uid));
  yield put({ type: 'columns/listSampleBatchesSuccess', payload: { uid, payloads, } });
}

function* listColumnSamples(action) {
  const { table, column, } = action.payload;
  const payloads = raiseErrorOnCondition(yield call(api.listColumnSamples, table, column));
  yield put({ type: 'columns/listColumnSamplesSuccess', payload: { table, column, payloads, } });
}

function* diff(action) {
  yield put({ type: 'columns/toggle', payload: { key: 'diffing', value: true } });
  const { uid, } = action.payload;
  const payloads = raiseErrorOnCondition(yield call(api.diff, uid));
  yield put({ type: 'columns/diffSuccess', payload: { payloads, } });
  yield put({ type: 'columns/toggle', payload: { key: 'diffing', value: false } });
}

const columnProxied = curryN(3, proxied)('columns');
const columnCacheProxied = curryN(3, cacheProxied)('columns');

function* columnsSaga() {
  // yield takeLatest('columns/list', columnCacheProxied(list, (action) => (['columns', 'cache', 'columnDetails', `${action.payload.table}-${action.payload.column}`])));
  yield takeLatest('columns/list', columnCacheProxied(list, (action) => ({
    columnDetails: ['columns', 'cache', 'columnDetails', `${action.payload.table}-${action.payload.column}`]
  })));
  yield takeLatest('columns/create', create)
  // yield takeLatest('columns/listColumnSamples', columnCacheProxied(listColumnSamples, (action) => (['columns', 'cache', 'columnSamples', `${action.payload.table}-${action.payload.column}`])));
  yield takeLatest('columns/listColumnSamples', columnCacheProxied(listColumnSamples, (action) => ({
    columnSamples: ['columns', 'cache', 'columnSamples', `${action.payload.table}-${action.payload.column}`]
  })));
  yield takeLatest('columns/listSampleBatches', columnProxied(listSampleBatches)) 
  yield takeLatest('columns/diff', diff) 
  yield takeLatest('columns/runSample', runSample) 
  yield takeLatest('columns/run', run) 
}

export default columnsSaga;
