import {
  all,
  call,
  put,
  select,
  delay,
  takeEvery,
  takeLatest
} from 'redux-saga/effects';
import {
  always,
  apply,
  compose,
  curry,
  curryN,
  equals,
  gt,
  identity,
  ifElse,
  isNil,
  juxt,
  map,
  mergeRight,
  not,
  objOf,
  path,
  pathOr,
  prop,
  unless,
  __
} from 'ramda';
import api from '../../api/samples';
import { raiseErrorOnCondition, proxied, cacheProxied } from './common';
import { log } from '../../utils/log';
import { toast } from 'react-toastify';
import { snakeCase } from 'change-case';
import { isBlank } from '../../utils/common';

const prefix: string = 'samples';

function* list(action) {
  const { page } = action.payload;
  const payloads = raiseErrorOnCondition(yield call(api.list, page));
  yield put({ type: `${prefix}/listSuccess`, payload: { payloads, page } });
}

function* show(action) {
  const { uid } = action.payload;
  const payload = raiseErrorOnCondition(yield call(api.show, uid));
  yield put({ type: `${prefix}/showSuccess`, payload: { payload } });
}

function* prepareAdjust(action) {
  const res = yield all([
    call(show, action),
    call(listColumnSampleEntries, action)
  ]);
  yield put({ type: `${prefix}/prepareAdjustSuccess`, payload: res });
}

function* adjust(action) {
  yield put({
    type: `${prefix}/toggle`,
    payload: { key: 'adjusting', value: true }
  });
  const { uid, data } = action.payload;
  const res = yield call(api.adjust, uid, data);
  const columnSample = raiseErrorOnCondition(res);
  const payload = { columnSample, data, columnSampleEntries: undefined };
  if (data.action === 'create') {
    if (gt(columnSample.changed, 0)) {
      payload.columnSampleEntries = raiseErrorOnCondition(
        yield call(api.listColumnSampleEntries, uid)
      );
      toast.success(`已成功创建${columnSample.changed}条数据!`);
    } else {
      toast.warn('未能找到符合条件的记录!');
    }
  } else {
    toast.success(`已成功删除${columnSample.changed}条数据!`);
  }
  yield put({ type: `${prefix}/adjustSuccess`, payload });
  yield put({
    type: `${prefix}/toggle`,
    payload: { key: 'adjusting', value: false }
  });
}

function* create(action) {
  yield put({
    type: `${prefix}/toggle`,
    payload: { key: 'submitting', value: true }
  });
  const { data } = action.payload;
  const res = yield call(api.create, data);
  const payload = raiseErrorOnCondition(res);
  toast.success(`数据集创建成功!`);
  yield put({ type: `${prefix}/createSuccess`, payload: { payload } });
  yield put({
    type: `${prefix}/toggle`,
    payload: { key: 'submitting', value: false }
  });
}

function* listColumnSampleEntries(action) {
  const { uid } = action.payload;
  const res = map(raiseErrorOnCondition)(
    yield all([call(api.show, uid), call(api.listColumnSampleEntries, uid)])
  );
  yield put({
    type: `${prefix}/listColumnSampleEntriesSuccess`,
    payload: { columnSample: res[0], columnSampleEntries: res[1] }
  });
}

function* judge(action) {
  const { uid, entryUid, judgement } = action.payload;
  const payload = raiseErrorOnCondition(
    yield call(api.judge, uid, entryUid, judgement)
  );
  yield put({ type: `${prefix}/judgeSuccess`, payload: { payload } });
}

const sampleProxied = curryN(3, proxied)(prefix);
const sampleCacheProxied = curryN(3, cacheProxied)(prefix);

function* columnsSaga() {
  yield takeLatest(
    `${prefix}/list`,
    sampleCacheProxied(list, (action) => [
      prefix,
      'cache',
      'columnSamples',
      `${action.payload.table}-${action.payload.column}`
    ])
  );
  yield takeLatest(`${prefix}/create`, sampleProxied(create));
  yield takeLatest(`${prefix}/show`, sampleProxied(show));
  yield takeLatest(`${prefix}/prepareAdjust`, sampleProxied(prepareAdjust));
  yield takeLatest(`${prefix}/adjust`, adjust);
  // yield takeLatest(
  //   `${prefix}/listColumnSampleEntries`,
  //   sampleCacheProxied(listColumnSampleEntries, (action) => ({
  //     columnSampleEntries: [
  //       prefix,
  //       'cache',
  //       'columnSampleEntries',
  //       action.payload.uid
  //     ],
  //     columnSample: [prefix, 'cache', 'columnSamples', action.payload.uid]
  //   }))
  // );
  yield takeLatest(
    `${prefix}/listColumnSampleEntries`,
    sampleProxied(listColumnSampleEntries)
  );
  yield takeLatest(`${prefix}/judge`, judge);
}

export default columnsSaga;
