// src/routes.ts

// pages
import Home from "./pages/Home";
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
      key: 'columns',
      title: 'Columns',
      path: '/columns',
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
