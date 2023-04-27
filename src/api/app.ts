import { log } from '../utils/log';
import request, { createAPI } from '../utils/request'

const authHost: string = 'https://apply.miracleplus.com';
const authRequest = createAPI(authHost);

const profile = () => authRequest.get('/api/profile', { app_type: 'ai-assistant' });

const login = (data: any) => authRequest.post('/api/auth', data);

const meta = () => request.get('/meta');

const tables = () => request.get('/tables', {}, { env: { noCaseTransform: true } })

export default { profile, login, tables, meta, };
