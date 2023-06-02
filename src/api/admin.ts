import request from '../utils/request'

const listBatches = () => request.get(`/batches`);

const dispatchAction = (action: string, uid: string) => request.post(`/batches/${uid}/${action}`);

export default { listBatches, dispatchAction, };
