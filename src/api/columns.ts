import { ColumnDetail } from '../interfaces';
import request from '../utils/request'

const list = (table: string, column: string) => request.get(`/tables/${table}/columns/${column}`);

const create = (table: string, column: string, data: ColumnDetail) => request.post(`/tables/${table}/columns/${column}`, data)

const listColumnSamples = (table: string, column: string) => request.get(`/samples?table=${table}&column=${column}`);

const listSampleBatches = (uid: string) => request.get(`/columns/${uid}/sample_batches`);

const diff = (uid: string) => request.get(`/sample_batches/${uid}/diff`);

const showSampleBatch = (uid: string) => request.get(`/sample_batches/${uid}`)

const refreshSampleBatch = (uid: string) => request.get(`/sample_batches/${uid}/refresh`)

const runSample = (columnDetailUid: string, columnSampleUid: string, model: string, splitPerTokens: number, maxSizePerDiv: number) => request.post('/sample_batches', { columnDetailUid, columnSampleUid, model, splitPerTokens, maxSizePerDiv, });

const run = (columnSampleUid: string) => request.post(`/sample_batches/${columnSampleUid}/run`);

const requestFullCapacity = (uid: string, model: string, splitPerTokens: number, maxSizePerDiv: number) => request.post(`/batches`, { uid, model, splitPerTokens, maxSizePerDiv, })

export default { list, create, listColumnSamples, listSampleBatches, showSampleBatch, refreshSampleBatch, diff, runSample, run, requestFullCapacity };
