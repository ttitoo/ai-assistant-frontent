import { FC } from "react";

interface IRoute {
  key: string
  title: string
  path: string
  enabled: boolean
  component: FC<{}>
}

interface ReduxSagaDispatchPayload {
  type: string
  payload?: any
}

interface Option {
  label: string
  value: string
}

interface User {
  id: number
  roles: {
    [key: string]: boolean
  }
}

interface Meta {
  gpt: string[]
  samples: {
    operators: string[]
  }
}

interface Tables {
   [table: string]: string[] 
}

interface ColumnDetail {
  uid: string | number
  column: string
  createdAt: number
  active: boolean
  data: {
    prompt?: string
    answers?: string
    keywords?: string
  }
  updatedAt: number
}

interface ColumnSample {
  uid: string | number
  column: string
  createdAt: number
  table: string
  count: number
  remaining?: number
  questions?: string[]
}

interface ColumnSampleEntry {
  uid: string
  columnSampleUid: string
  pkId: number
  judgement: number
  createdAt: number
  updatedAt: number
  prediction: number
  answers: {
    [key: string]: string
  }
  answer: string
}

interface SampleBatch {
  uid: string
  model: string
  columnSampleUid: string
  columnDetailUid: string
  state: string
  token: number
  cost: number
  statistics: {
    target: number
    complete: number
    tp: number
    tn: number
    fp: number
    fn: number
    precision: number
    recall: number
  }
  history_statistics: {
    failure: number
    retrying: number
    finished: number
  }
  createdAt: number
  updatedAt: number
}

export {
  IRoute,
  Option,
  User,
  Meta,
  Tables,
  ColumnDetail,
  ColumnSample,
  ColumnSampleEntry,
  SampleBatch,
  ReduxSagaDispatchPayload,
};
