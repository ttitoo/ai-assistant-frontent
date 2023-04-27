import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import {
  always,
  append,
  compose,
  curry,
  flip,
  identity,
  ifElse,
  isNil,
  map,
  prop,
  propEq,
  __,
  reject,
  omit,
  unless,
  when,
  isEmpty,
  any,
  lt,
  anyPass,
  gte,
  addIndex
} from 'ramda';
import { isTempCondition } from './utils';
import { QueryCondition } from './interfaces';
import Summary from './Summary';
import Form from './Form';
import { SummaryActions, EditConditionActions } from './Actions';
import useSagaDispatch from '../../../hooks/useSagaDispatch';
import { SamplesState } from '../../../store/reducers/samples';
import { isBlank } from '../../../utils/common';
import { log } from '../../../utils/log';

export default ({ show, adjustment, columnSample, close }) => {
  const { dispatch, state } = useSagaDispatch<SamplesState>('samples');
  const { adjusting } = state;
  const [conditions, setConditions] = useState<QueryCondition[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<
    QueryCondition | undefined
  >(undefined);
  const [count, setCount] = useState<number>(1);

  const submit = () =>
    dispatch('adjust', {
      uid: columnSample.uid,
      data: {
        action: 'create',
        queries: map(omit(['id']))(conditions),
        count
      }
    });

  const adjust = () => {
    let errors: string[] = [];
    const appendError = (err: string) => (errors = append<string>(err, errors));
    when(isBlank, () => appendError('请设置过滤条件!'))(conditions);

    when(anyPass([isNil, gte(0), lt(columnSample.remaining)]), () =>
      appendError('请设置有效数量!')
    )(count);

    ifElse(
      isEmpty,
      submit,
      compose(
        (children) => toast.error(<div className="text-left">{children}</div>),
        addIndex(map)((err: string, index: number) => (
          <li key={index} className="ml-2">
            {err}
          </li>
        ))
      )
    )(errors);
  };
  const closeAfterAdjusting = unless(identity<boolean>, close);
  useEffect(() => {
    closeAfterAdjusting(adjusting);
  }, [adjusting]);

  const newCondition = (e: MouseEvent) => {
    e.preventDefault();
    const res: QueryCondition = {
      id: new Date().getTime(),
      column: '',
      operator: '',
      value: '',
      temp: true
    };
    compose(setConditions, flip(append<QueryCondition>)(conditions))(res);
    setSelectedCondition(res);
  };

  const removeCondition = (conditions: QueryCondition[], id: number) =>
    compose(setConditions, reject(propEq('id', id)))(conditions);

  const clearCondition = (e: MouseEvent) => {
    e.preventDefault();
    when(
      isTempCondition,
      compose(curry(removeCondition)(conditions), prop('id'))
    )(selectedCondition);
    setSelectedCondition(undefined);
  };
  const editCondition = (e: MouseEvent, condition: QueryCondition) => {
    e.preventDefault();
    setSelectedCondition(condition);
  };
  const confirmCondition = (e: MouseEvent) => {
    e.preventDefault();
    compose(
      setConditions,
      map<QueryCondition[], QueryCondition[]>(
        ifElse(
          propEq<string>('id', selectedCondition.id),
          always<QueryCondition>(omit(['temp'], selectedCondition)),
          identity<QueryCondition>
        )
      )
    )(conditions);
    setSelectedCondition(undefined);
  };
  const updateCondition = (attr: string, val: string) =>
    (selectedCondition[attr] = val);
  const deleteCondition = (e: MouseEvent) => {
    removeCondition(conditions, selectedCondition.id);
    clearCondition(e);
  };

  return (
    <div
      aria-hidden="false"
      data-testid="modal"
      role="dialog"
      className={classNames(
        'fixed top-0 right-0 left-0 z-50 h-modal overflow-y-auto overflow-x-hidden md:inset-0 md:h-full items-center justify-center flex bg-gray-900 bg-opacity-50 dark:bg-opacity-80',
        { hidden: !show }
      )}
    >
      <div className="relative h-full w-full p-4 md:h-auto max-w-2xl">
        <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
          <div className="flex items-start justify-between rounded-t dark:border-gray-600 border-b p-5">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Bulk Create Entries
            </h3>
            <button
              aria-label="Close"
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              type="button"
              onClick={close}
            >
              <svg
                stroke="currentColor"
                fill="none"
                stroke-width="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <div className="p-6">
            {ifElse(
              isNil,
              always(
                <Summary
                  count={count}
                  setCount={compose(setCount, parseInt)}
                  columnSample={columnSample}
                  conditions={conditions}
                  newCondition={newCondition}
                  editCondition={editCondition}
                />
              ),
              always(
                <Form
                  adjustment={adjustment}
                  columnSample={columnSample}
                  condition={selectedCondition}
                  updateCondition={updateCondition}
                />
              )
            )(selectedCondition)}
          </div>
          <div className="flex items-center space-x-2 rounded-b border-gray-200 p-6 dark:border-gray-600 border-t">
            {ifElse(
              isNil,
              always(
                <SummaryActions
                  loading={adjusting}
                  submit={adjust}
                  close={close}
                />
              ),
              always(
                <EditConditionActions
                  confirm={confirmCondition}
                  back={clearCondition}
                  remove={ifElse(
                    isTempCondition,
                    always(undefined),
                    always(deleteCondition)
                  )(selectedCondition)}
                />
              )
            )(selectedCondition)}
          </div>
        </div>
      </div>
    </div>
  );
};
