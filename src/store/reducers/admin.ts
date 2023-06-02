import { createSlice } from '@reduxjs/toolkit'
import { toggle } from './common';
import { SampleBatch } from '../../interfaces';
import { log } from '../../utils/log';

export interface AdminState {
  loading: boolean
  sampleBatches: SampleBatch[],
}

export default createSlice({
  name: 'admin',
  initialState: {
    loading: true,
    sampleBatches: [],
  },
  reducers: {
    toggle,
    listBatchesSuccess: (state, action) => {
      const { payloads } = action.payload;
      state.sampleBatches = payloads; 
    },
    dispatchActionSuccess: (state, action) => {
      const { action: actionName, sampleBatch } = action.payload;
      log('sampleBatch', actionName, sampleBatch);
    }
  },
});
