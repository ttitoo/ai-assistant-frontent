import { toQuestionOptions } from '../../../utils/common';
import {
  always,
  append,
  applySpec,
  compose,
  filter,
  flip,
  has,
  identity,
  ifElse,
  includes,
  isNil,
  map,
  mapObjIndexed,
  nthArg,
  path,
  pathOr,
  prop,
  propOr,
  split,
  values,
  __
} from 'ramda';
import { ColumnSample } from '../../../interfaces';
import translations from '../../../utils/translations';
import { Option } from '../../../interfaces';

const translateCategory = compose(
  flip(path)(translations),
  flip(append)(['column_samples', 'categories'])
);

const translationOperator = compose(
  flip(path)(translations),
  flip(append)(['column_samples', 'operators'])
);

const translationApplicationOption = compose(
  flip(path)(translations),
  flip(append)(['column_samples', 'applications'])
);

const toCategoryOptions = ifElse(
  isNil,
  always([]),
  compose(
    values,
    mapObjIndexed(
      applySpec<Option>({
        value: nthArg(1),
        label: compose(translateCategory, nthArg(1))
      })
    )
  )
);

const toOperatorOptions = map(
  applySpec<Option>({
    label: translationOperator,
    value: identity
  })
);

const showQuestionByKeys = (questions: string[]) =>
  filter(compose(flip(includes)(questions), prop('value')));

const showQuestionByColumnSampleQuestions = compose(
  showQuestionByKeys,
  prop('questions')
);

const toAnswerOptions = (sample: ColumnSample) =>
  compose(
    showQuestionByColumnSampleQuestions(sample),
    toQuestionOptions,
    prop('table')
  )(sample);

const toApplicationOptions = compose(
  map(
    applySpec<Option>({
      value: identity,
      label: translationApplicationOption
    })
  ),
  pathOr([], ['applications', 'options'])
);

const columnCombined = compose(split('.'), propOr('', 'column'));

const isTempCondition = has('temp');

const onValueChange = ifElse(
  has('value'),
  compose(prop('value'), nthArg(0)),
  path(['target', 'value'])
);

export {
  translateCategory,
  translationOperator,
  translationApplicationOption,
  toCategoryOptions,
  toOperatorOptions,
  toAnswerOptions,
  toApplicationOptions,
  columnCombined,
  isTempCondition,
  onValueChange
};
