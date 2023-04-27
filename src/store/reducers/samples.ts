import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  apply,
  divide,
  compose,
  filter,
  juxt,
  pathOr,
  length,
  multiply,
  when,
  map,
  propEq,
  mergeLeft,
  flip,
  includes,
  prop,
  prepend,
  ifElse,
  equals,
  identity,
  includes,
  unless,
  reject,
  isNil,
  omit,
  mergeRight,
  groupBy,
  applySpec,
  objOf,
  propOr,
  not,
  nth,
  always,
  values,
  flatten,
  call
} from 'ramda';
import { log, tapLog } from '../../utils/log';
import { merge } from 'immutable';
import { toggle } from './common';
import { ColumnSample, ColumnSampleEntry } from '../../interfaces';

export interface SamplesState {
  loading: boolean;
  submitting?: boolean;
  adjusting?: boolean;
  columnSample: ColumnSample | undefined;
  samples: ColumnSample[];
  cache: {
    columnSamples: { [key: string]: ColumnSample[] };
    columnSampleEntries: { [key: string]: ColumnSampleEntry[] };
  };
  columnSampleEntries: ColumnSampleEntry[];
  statistics: any;
}

const judged = compose(flip(includes)([0, 1]), prop('judgement'));

// 计算百分比，加入分母为0的判断
const percentage = call(
  ifElse(
    compose(equals(0), nth(1)),
    always(0), // 如果分母为0，则直接返回0，否则进行除法运算
    compose(multiply(100), apply(divide))
  )
);

const calculateProgress = compose(
  objOf('progress'),
  percentage,
  juxt([compose(parseFloat, length, filter(judged)), length])
);

const lengthOfJudged = (val: number) => compose(length, propOr([], val));

const baseStatistics = compose(
  applySpec({
    positive: lengthOfJudged(1),
    negative: lengthOfJudged(0),
    positivep: compose(
      percentage,
      juxt([lengthOfJudged(1), compose(length, flatten, values)])
    )
  }),
  groupBy(prop('judgement'))
);

const calculateStatistics = compose(
  apply(merge),
  juxt([baseStatistics, calculateProgress])
);

export default createSlice({
  name: 'samples',
  initialState: {
    loading: false,
    columnSample: undefined,
    samples: [],
    cache: {
      columnSamples: {},
      columnSampleEntries: {}
    },
    columnSampleEntries: [],
    statistics: {}
  },
  reducers: {
    toggle,
    clear: (state) => {
      state.columnSample = undefined;
      state.columnSampleEntries = undefined;
      state.statistics = {};
    },
    showSuccess: (state, action) => {
      state.columnSample = action.payload.payload;
    },
    createSuccess: (state, action) => {
      const { payload } = action.payload;
      state.samples = prepend(payload, state.samples);
    },
    listSuccess: (state, action) => {
      state.samples = action.payload.payloads;
      state.page = pathOr(1, ['payload', 'page'], action);
    },
    listColumnSampleEntriesSuccess: (state, action) => {
      const { columnSample, columnSampleEntries } = action.payload;
      state.columnSample = columnSample;
      state.columnSampleEntries = columnSampleEntries;
      state.statistics = calculateStatistics(columnSampleEntries);
      state.cache.columnSamples[columnSample.uid] = columnSample;
      state.cache.columnSampleEntries[columnSample.uid] = columnSampleEntries;
    },
    judgeSuccess: (state, action) => {
      const { payload } = action.payload;
      state.columnSampleEntries = map(
        when(
          propEq('uid', payload.uid),
          mergeLeft({ judgement: payload.judgement })
        )
      )(state.columnSampleEntries);
      state.cache.columnSampleEntries[state.columnSample.uid] =
        state.columnSampleEntries;
      state.statistics = calculateStatistics(state.columnSampleEntries);
    },
    adjustSuccess: (state, action) => {
      const { columnSample, data, columnSampleEntries } = action.payload;
      state.columnSample = compose(
        mergeRight(state.columnSample),
        omit('questions')
      )(columnSample);

      // if destory, remove local record by uid
      if (data.action === 'destroy') {
        state.columnSampleEntries = reject(
          compose(flip(includes)(data.uids), prop('uid'))
        )(state.columnSampleEntries);
      }

      // if create, the fetch entries again in saga and update local data here
      if (!isNil(columnSampleEntries)) {
        state.columnSampleEntries = columnSampleEntries;
      }

      state.cache.columnSampleEntries[columnSample.uid] =
        state.columnSampleEntries;
      state.statistics = calculateStatistics(state.columnSampleEntries);
    },
    cacheSuccess: (state, action: PayloadAction<{ payloads: any[] }>) => {
      const { columnSample, columnSampleEntries } = action.payload;

      state.columnSample = columnSample;
      state.columnSampleEntries = columnSampleEntries;
      state.statistics = calculateStatistics(columnSampleEntries);
    }
  }
});
