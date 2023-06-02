import columns from './columns';
import samples from './samples';
import admin from './admin';
import app from './app';

export default {
  columns: columns.reducer,
  samples: samples.reducer,
  admin: admin.reducer,
  app: app.reducer,
};
