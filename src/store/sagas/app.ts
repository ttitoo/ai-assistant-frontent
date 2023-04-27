import { compose, map, prop, flip } from 'ramda';
import { toast } from 'react-toastify';
import { all, call, put, takeLatest } from 'redux-saga/effects'
import api from '../../api/app';
import { log, tapLog } from '../../utils/log';
import { raiseErrorOnCondition } from './common';

function* profile(action) {
  try {
    const res = yield call(api.profile)
    raiseErrorOnCondition(res)
    yield put({ type: 'app/profileSuccess', payload: { user: res.data } });
  } catch (e) {
    yield put({ type: 'app/profileFailure', message: e.message })
  }
}

function* login(action) {
  yield put({ type: 'app/toggle', payload: { key: 'submitting', value: true } });
  try {
    const res = yield call(api.login, action.payload)
    raiseErrorOnCondition(res)
    toast.success('登录成功!');
    yield put({ type: 'app/loginSuccess', payload: { user: res.data } });
  } catch (e) {
    toast.error(`登录失败: ${e.message}`);
    yield put({ type: 'app/loginFailure', message: e.message })
  }
  yield put({ type: 'app/toggle', payload: { key: 'submitting', value: false, } });
}

function* initial() {
  yield put({ type: 'app/toggleInitialing' });
  try {
    const res = map(raiseErrorOnCondition)(
      yield all([
        call(api.meta),
        call(api.tables),
      ])
    );
    // raiseErrorOnCondition(res)
    yield put({ type: 'app/initialSuccess', payload: {
      meta: res[0],
      tables: res[1],
    } });
  } catch (e) {
    yield put({ type: 'app/initialFailure', message: e.message })
  }
}

function* usersSaga() {
  yield takeLatest('app/profile', profile)
  yield takeLatest('app/login', login)
  yield takeLatest('app/initial', initial)
  // yield takeLatest(actions.login, loginSucess)
}

export default usersSaga;
