import { ReactNode, Fragment } from 'react';
import {
  getQuestionCategoryFromTableName,
} from '../../../utils/common';
import { TextInput } from 'flowbite-react';
import {
  addIndex,
  append,
  compose,
  curry,
  equals,
  flip,
  head,
  ifElse,
  map,
  path,
  prop,
  propOr,
  last,
  __,
  length,
} from 'ramda';
import {
  translateCategory,
  translationOperator,
  translationApplicationOption,
  columnCombined,
  onValueChange
} from './utils';
import { QueryCondition } from './interfaces';
import questions from '../../../utils/questions';

const Summary = ({
  count,
  setCount,
  columnSample,
  conditions,
  newCondition,
  editCondition
}) => {
  const isCategoryApplication = compose(equals('applications'), head);
  const questionCategory = compose(
    getQuestionCategoryFromTableName,
    propOr('', 'table')
  )(columnSample);

  const toConditionSection = (
    condition: QueryCondition,
    total: number,
    index: number
  ) => {
    const columnCombinedArray = columnCombined(condition);
    return (
      <Fragment key={condition.id}>
        <div
          className="p-5 duration-300 transform bg-white border rounded shadow-sm cursor-pointer hover:-translate-y-2"
          onClick={flip(editCondition)(condition)}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg font-bold leading-5">
              {compose(translateCategory, head)(columnCombinedArray) as ReactNode}
            </p>
            <p className="flex items-center justify-center w-6 h-6 font-bold rounded text-deep-purple-accent-400 bg-indigo-50">
              {index + 1}
            </p>
          </div>
          <p className="text-left text-sm text-gray-900">
            "
            <span className="">
              {ifElse(
                isCategoryApplication,
                compose(translationApplicationOption, last),
                compose(
                  flip(path)(questions),
                  flip(append)([questionCategory]),
                  last
                )
              )(columnCombinedArray)}
            </span>
            "
            <span className="ml-1 font-bold">
              {compose(translationOperator, prop('operator'))(condition)}
            </span>
            <span className="ml-1 italic">{prop('value', condition)}</span>
          </p>
        </div>
        {index === total - 1 || (
          <div className="inline-flex items-center justify-center w-full">
            <hr className="w-64 h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
            <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">
              or
            </span>
          </div>
        )}
      </Fragment>
    );
  };

  const ConditionSection = curry(toConditionSection)(
    __,
    length(conditions),
    __
  );
  return (
    <div className="p-4 mx-auto">
      <div className="relative mb-5">
        <TextInput
          onChange={compose(setCount, onValueChange)}
          defaultValue={count}
          type="number"
          placeholder="Count"
          required={true}
          max={prop('remaining', columnSample)}
          min={1}
        />
      </div>

      <div className="relative grid gap-4 row-gap-5">
        <>
          {addIndex(map)(ConditionSection)(conditions)}
          <div className="bg-white border rounded shadow-sm cursor-pointer">
            <p className="text-center text-lg font-bold leading-5">
              <a className="block p-3" href="#" onClick={newCondition}>
                Add
              </a>
            </p>
          </div>
        </>
      </div>
    </div>
  );
};

export default Summary;
