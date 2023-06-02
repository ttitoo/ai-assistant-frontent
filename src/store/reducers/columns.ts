import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { always, prepend, map, when, propEq } from 'ramda';
import { toggle, cacheSuccess } from './common';
import { ColumnDetail, ColumnSample, ColumnSampleEntry, SampleBatch } from '../../interfaces';

const updateCache = (state, key: string, id: string) => {
  state.cache[key][id] = state[key];
}

export interface ColumnsState {
  loading: boolean
  diffing?: boolean
  submitting?: boolean
  success?: boolean
  table: string | undefined
  column: string | undefined
  columnDetails: []
  columnDetailUid: string | undefined
  columnSamples: []
  sampleBatches: []
  selected: {
    columnDetail: string | undefined
    sampleBatch: string | undefined
  }
  columnSampleEntries: ColumnSampleEntry[]
  cache: {
    columnDetails: { [key: string]: ColumnDetail[] }
    columnSamples: { [key: string]: ColumnSample[] }
    sampleBatches: { [key: string]: SampleBatch[] }
  },
}

export default createSlice({
  name: 'columns',
  initialState: {
    loading: false,
    table: undefined,
    column: undefined,
    columnDetails: [],
    columnDetailUid: undefined,
    columnSamples: [],
    sampleBatches: [],
    selected: {
      columnDetail: undefined,
      sampleBatch: undefined,
    },
    columnSampleEntries: undefined,
    cache: {
      columnDetails: {},
      columnSamples: {},
      sampleBatches: {},
    },
  },
  reducers: {
    toggle,
    cacheSuccess,
    setSelected: (state, action) => {
      const { key, value } = action.payload;
      state.selected[key] = value;
    },
    clearSelected: (state) => {
      state.sampleBatches = undefined;
      state.selected = {
        columnDetail: undefined,
        sampleBatch: undefined,
      }
    },
    createSuccess: (state, action) => {
      const { table, column, payload } = action.payload;
      state.columnDetails = prepend(payload, state.columnDetails)
      updateCache(state, 'columnDetails', `${table}-${column}`)
    },
    listSuccess: (state, action: PayloadAction<{table: string, column: string, payloads: any[]}>) => {
      const { table, column, payloads, } = action.payload;
      state.table = table;
      state.column = column;
      state.columnDetails = payloads;
      updateCache(state, 'columnDetails', `${table}-${column}`);
    },
    listColumnSamplesSuccess: (state, action) => {
      const { table, column, payloads, } = action.payload;
      state.columnSamples = payloads;
      state.cache.columnSamples[`${table}-${column}`] = payloads;
    },
    listSampleBatchesSuccess: (state, action) => {
      const { uid, payloads, } = action.payload;
      state.selected.columnDetail = action.payload.uid;
      state.sampleBatches = payloads;
      state.cache.sampleBatches[uid] = payloads;
    },
    showSampleBatchSuccess: (state, action) => {
      const { payload, } = action.payload;
      state.sampleBatches = map(when(propEq('uid', payload.uid), always(payload)), state.sampleBatches);
    },
    setSelectedSampleBatch: (state) => {
      state.selected.sampleBatch = action.payload.sampleBatch;
    },
    diffSuccess: (state, action) => {
      const { payloads } = action.payload;
      state.columnSampleEntries = payloads;
    },
  },
});
