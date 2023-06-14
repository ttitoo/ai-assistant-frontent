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
  toString,
  identity,
  map,
  has,
  of,
  apply,
  uncurryN
} from 'ramda';
import questions from './questions';
import { Option } from '../interfaces';

const isBlank = anyPass([isNil, isEmpty]);

const getQuestionCategoryFromTableName = compose(head<string>, split('_'));

const preventNullOptions = uncurryN<Option[]>(2, (fn: (vals: any[]) => any) =>
  ifElse(isNil, always([]), compose(apply(fn), of))
);

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

const arrayToOptions = (candidates: any[], labels: object = {}) =>
  compose(
    values,
    map(
      applySpec({
        label: ifElse(
          compose(flip(has)(labels), toString),
          compose(flip(prop)(labels), toString),
          identity
        ),
        value: identity
      })
    )
  )(candidates);

export {
  isBlank,
  getQuestionCategoryFromTableName,
  toQuestionOptions,
  toPercentage,
  arrayToOptions,
  preventNullOptions
};
