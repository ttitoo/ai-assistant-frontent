import {
  anyPass,
  isNil,
  isEmpty,
  compose,
  head,
  split,
  multiply,
  invoker,
  flip,
  concat,
  always,
  ifElse,
  prop,
  values,
  mapObjIndexed,
  applySpec,
  nthArg,
  juxt,
  join,
  filter,
  includes,
  unless
} from 'ramda';
import { tapLog } from './log';
import questions from './questions';
import { Option } from '../interfaces';

const isBlank = anyPass([isNil, isEmpty]);

const getQuestionCategoryFromTableName = compose(head, split('_'));

const toQuestionOptions = ifElse(
  isNil,
  always([]),
  compose(
    values,
    mapObjIndexed(
      applySpec<Option>({
        value: nthArg(1),
        label: compose(
          join(''),
          juxt([nthArg(0), always('('), nthArg(1), always(')')])
        )
      })
    ),
    flip(prop)(questions),
    getQuestionCategoryFromTableName
  )
);

const toPercentage = compose(
  flip(concat)('%'),
  invoker(1, 'toFixed')(1),
  multiply(100)
);

export {
  isBlank,
  getQuestionCategoryFromTableName,
  toQuestionOptions,
  toPercentage
};
