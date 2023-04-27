import { ColumnDetail, ColumnSample } from '../interfaces';
import { log } from '../utils/log';
import request, { createAPI } from '../utils/request'

const show = (uid: string) => request.get(`/samples/${uid}`);

const list = (page?: number = 1) => request.get('/samples', { page, });

const create = (data: ColumnSample) => request.post(`/samples`, data);

const adjust = (uid: string, data: ColumnSample) => request.post(`/samples/${uid}`, data);

const listColumnSampleEntries = (uid: string) => request.get(`/samples/${uid}/entries`);

const judge = (uid: string, entryUid: string, judgement: number) => request.post(`/samples/${uid}/entries/${entryUid}`, { judgement, });

export default { show, list, create, adjust, listColumnSampleEntries, judge, };
