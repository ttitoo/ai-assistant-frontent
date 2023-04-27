import { useState } from 'react';
import { Label, TextInput } from 'flowbite-react';
import Select from 'react-select';
import {
  compose,
  curry,
  equals,
  head,
  ifElse,
  prop,
  last,
  __,
  always,
  pathOr,
  filter,
  propEq
} from 'ramda';
import {
  columnCombined,
  onValueChange,
  toCategoryOptions,
  toAnswerOptions,
  toApplicationOptions,
  toOperatorOptions
} from './utils';
import { isBlank } from '../../../utils/common';
import { Option } from '../../../interfaces';

const Form = ({ columnSample, adjustment, condition, updateCondition }) => {
  const columnCombinedArray = columnCombined(condition);
  const [category, setCategory] = useState<string | undefined>(
    head(columnCombinedArray)
  );
  const update = curry(updateCondition);
  const categoryOptions: Option[] = toCategoryOptions(adjustment);
  const questionOptions: Option[] = ifElse(
    isBlank,
    always([]),
    ifElse(
      equals('answers'),
      always(toAnswerOptions(columnSample)),
      always(toApplicationOptions(adjustment))
    )
  )(category);
  const operatorOptions = compose(
    toOperatorOptions,
    pathOr([], [category, 'operators'])
  )(adjustment);
  const getInitialOption = (options: Option[], val: string) =>
    compose(curry(filter)(__, options), curry(propEq)('value'))(val);

  const curriedInitialOption = curry(getInitialOption);

  return (
    <form className="flex flex-col gap-4 text-left">
      <div>
        <div className="mb-2 block">
          <Label htmlFor="category" value="Category" />
        </div>
        <Select
          defaultValue={compose(
            curriedInitialOption(categoryOptions),
            head
          )(columnCombinedArray)}
          onChange={compose(setCategory, onValueChange)}
          options={categoryOptions}
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="question" value="Question" />
        </div>
        <Select
          defaultValue={compose(
            curriedInitialOption(questionOptions),
            last
          )(columnCombinedArray)}
          onChange={compose(
            update('column'),
            (val: string) => `${category}.${val}`,
            onValueChange
          )}
          options={questionOptions}
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="operator" value="Operator" />
        </div>
        <Select
          defaultValue={compose(
            curriedInitialOption(operatorOptions),
            prop('operator')
          )(condition)}
          onChange={compose(update('operator'), onValueChange)}
          options={operatorOptions}
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="value" value="Value" />
        </div>
        <TextInput
          defaultValue={prop('value', condition)}
          onChange={compose(update('value'), onValueChange)}
          type="text"
          required={true}
        />
      </div>
    </form>
  );
};

export default Form;
