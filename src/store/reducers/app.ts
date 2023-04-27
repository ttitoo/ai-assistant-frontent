import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Map } from 'immutable';
import request from '../../utils/request'
import { persistAccessToken } from '../../utils/storage';
import { mergeDeepRight } from 'ramda';
import { log } from '../../utils/log';
import { Meta, Tables, User } from '../../interfaces';

export interface AppState {
  initialing: boolean
  loading: boolean
  submitting?: boolean
  user: User | undefined,
  meta: Meta | undefined,
  tables: Tables | undefined,
}

export const slice = createSlice({
  name: 'app',
  initialState: {
    initialing: true,
    loading: true,
    user: undefined,
    meta: undefined,
    tables: undefined,
  },
  reducers: {
    toggleInitialing: (state) => {
      state.initialing = true;
    },
    toggle: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    initialSuccess: (state, action) => {
      const { meta, tables } = action.payload;
      state.meta = meta;
      state.tables = tables;
      state.initialing = false;
    },
    loginSuccess: (state, action) => {
      const user = action.payload.user;
      state.user = user;
      persistAccessToken({ username: user.email, accessToken: user.accessToken });
      request.headers.Authorization = user.accessToken;
      state.loading = false;
    },
    profileSuccess: (state, action) => {
      state.user = action.payload.user;
      state.loading = false;
    },
    profileFailure: (state, action) => {
      state.user = {};
      state.loading = false;
    },
  },
})

export default slice;
