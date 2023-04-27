import { ColumnDetail } from '../interfaces';
import { log } from '../utils/log';
import request, { createAPI } from '../utils/request'

const list = (table: string, column: string) => request.get(`/tables/${table}/columns/${column}`);

const create = (table: string, column: string, data: ColumnDetail) => request.post(`/tables/${table}/columns/${column}`, data)

const listColumnSamples = (table: string, column: string) => request.get(`/samples?table=${table}&column=${column}`);

const listSampleBatches = (uid: string) => request.get(`/columns/${uid}/sample_batches`);

const diff = (uid: string) => request.get(`/sample_batches/${uid}/diff`);

const runSample = (columnDetailUid: string, columnSampleUid: string, model: string) => request.post('/sample_batches', { columnDetailUid, columnSampleUid, model });

const run = (columnSampleUid: string) => request.post(`/sample_batches/${columnSampleUid}/run`);

export default { list, create, listColumnSamples, listSampleBatches, diff, runSample, run };
