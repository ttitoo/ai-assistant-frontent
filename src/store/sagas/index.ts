import { all } from 'redux-saga/effects';
import columns from './columns';
import samples from './samples';
import admin from './admin';
import app from './app';

export default function* createSagas() {
  yield all([app(), admin(), columns(), samples()]);
}
