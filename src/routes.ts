// src/routes.ts

// pages
// import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Columns from "./pages/Columns";
import Samples from "./pages/Samples";
import SampleEntries from "./pages/SampleEntries"

import { IRoute } from './interfaces'

export const routes: Array<IRoute> = [
  {
      key: 'home',
      title: 'Home',
      path: '/',
      enabled: true,
      component: Columns
  },
  {
      key: 'admin',
      title: 'Admin',
      path: '/admin',
      enabled: true,
      component: Admin
  },
  {
      key: 'columns',
      title: 'Columns',
      path: '/columns',
      enabled: true,
      component: Columns
  },
  {
      key: 'tables',
      title: 'Columns',
      path: '/columns/:table',
      enabled: true,
      component: Columns
  },
  {
      key: 'table_columns',
      title: 'Columns',
      path: '/columns/:table/:column',
      enabled: true,
      component: Columns
  },
  {
      key: 'column_details',
      title: 'Columns',
      path: '/columns/:table/:column/:uid',
      enabled: true,
      component: Columns
  },
  {
      key: 'sample_batch_diff',
      title: 'Columns',
      path: '/columns/:table/:column/:uid/batches/:batch_uid/diff',
      enabled: true,
      component: Columns
  },
  {
    key: 'samples',
    title: 'Samples',
    path: '/samples',
    enabled: true,
    component: Samples
  },
  {
    key: 'sample_entries',
    title: 'Sample Detail',
    path: '/samples/:uid',
    enabled: true,
    component: SampleEntries
  },
];
