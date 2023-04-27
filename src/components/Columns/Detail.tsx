import { useEffect, useState } from 'react';
import { Card, Tabs, Badge, Tooltip } from 'flowbite-react';
import {
  always,
  compose,
  equals,
  groupBy,
  ifElse,
  isNil,
  map,
  mapObjIndexed,
  path,
  prop,
  unless,
  values,
  length,
  when,
  find,
  propEq,
  pathOr,
  apply,
  flip,
  append,
  objOf,
  curry,
  __
} from 'ramda';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import FeedbackIcon from '@mui/icons-material/Feedback';
import {
  ColumnDetail,
  ColumnSampleEntry,
  SampleBatch,
  Tables
} from '../../interfaces';
import questions from '../../utils/questions';
import {
  getQuestionCategoryFromTableName,
  isBlank,
  toPercentage
} from '../../utils/common';
import ColumnSampleTable from './ColumnSampleTable';
import FloatingMenu from '../../components/FloatingMenu';
import Loadable from '../Loadable';
import { snakeCase } from 'change-case';
import useSagaDispatch from '../../hooks/useSagaDispatch';
import { ColumnsState } from '../../store/reducers/columns';
import { tapLog } from '../../utils/log';

interface DetailProps {
  record: ColumnDetail;
  table: string;
  column: string;
  tables: Tables;
}

export default ({ loading, table, column, tables, close }) => {
  const { dispatch, state } = useSagaDispatch<ColumnsState>('columns');
  const { diffing, sampleBatches, columnSampleEntries, selected, cache } =
    state;
  const { columnDetail: uid } = selected;
  const find_by_uid = (val: string) => find(propEq('uid', val));
  const record = compose(
    find_by_uid(uid),
    pathOr([], ['columnDetails', `${table}-${column}`])
  )(cache);
  const [selectedSampleBatch, setSelectedSampleBatch] = useState<
    SampleBatch | undefined
  >(undefined);

  const clearSelectedColumnDetail = () => {
    dispatch('setSelected', { key: 'columnDetail', value: undefined });
  };

  const invokeAction = (action: string) =>
    compose(
      apply(dispatch),
      curry(append)(__, [action]),
      objOf<string>('uid'),
      prop<string>('uid')
    );

  useEffect(() => {
    unless(isNil, invokeAction('diff'))(selectedSampleBatch);
  }, [isNil(selectedSampleBatch)]);

  if (loading) {
    // prevent content when loading
    return <div />;
  }

  const renderTable = () => (
    <ColumnSampleTable
      sampleBatches={sampleBatches}
      showSampleBatch={setSelectedSampleBatch}
      runSampleBatch={invokeAction('run')}
    />
  );

  const getPercentage = (record: SampleBatch, attr: string) =>
    compose(
      ifElse(isBlank, always('\\'), toPercentage),
      path(['statistics', attr])
    )(record);

  const questionCategory = getQuestionCategoryFromTableName(table);
  const renderAnswerSection = (answer: string, question: string) => (
    <div key={question} className="mt-4">
      <p className="font-semibold text-gray-500 dark:text-gray-400">
        {compose(path([questionCategory, snakeCase(question)]))(questions)}:
      </p>
      <p className="text-gray-500 dark:text-gray-400">
        {when(isBlank, always('<无内容>'))(answer)}
      </p>
    </div>
  );

  const renderIncorrectEntry = (entry: ColumnSampleEntry) => (
    <div
      key={`${entry.uid}-incorrect`}
      className="p-5 duration-300 transform bg-white border rounded shadow-sm hover:-translate-y-2"
    >
      <div className="float-right">
        <Tooltip content={entry.answer}>
          <FeedbackIcon fontSize="small" />
        </Tooltip>
      </div>
      <h6 className="mb-2 text-left font-semibold leading-5">{entry.pkId}</h6>
      <div className="text-left text-sm text-gray-900">
        {compose(
          values,
          mapObjIndexed(renderAnswerSection),
          prop('answers')
        )(entry)}
      </div>
    </div>
  );

  const toEntriesGroup = (entries: ColumnSampleEntry[], index: string) => (
    <Tabs.Item
      key={index}
      title={
        <span className="flex">
          <span>{index}</span>
          <Badge color="failure" className="ml-1">
            {length(entries)}
          </Badge>
        </span>
      }
    >
      <div className="grid gap-5 mb-8 md:grid-cols-2 lg:grid-cols-3">
        {map(renderIncorrectEntry, entries)}
      </div>
    </Tabs.Item>
  );

  const toTabContent = (entries: { [index: string]: ColumnSampleEntry[] }) => (
    <Tabs.Group style="fullWidth">
      {compose(values, mapObjIndexed(toEntriesGroup))(entries)}
    </Tabs.Group>
  );

  const calculateIndex = ifElse(
    compose(equals(-1), prop('judgement')),
    always('无标签'),
    (entry: ColumnSampleEntry) =>
      `${
        entry.judgement === 1 && entry.judgement === entry.prediction
          ? 'T'
          : 'F'
      }${entry.prediction === 1 ? 'P' : 'N'}`
  );

  const renderSampleBatch = (sampleBatch: SampleBatch) => (
    <>
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        <div className="grid grid-cols-2 row-gap-8 md:grid-cols-3">
          <div className="text-center md:border-r">
            <h6 className="text-4xl font-bold lg:text-5xl xl:text-6xl">
              {toPercentage(sampleBatch.statistics.complete / sampleBatch.statistics.target)}
            </h6>
            <p className="text-sm font-medium tracking-widest text-gray-800 uppercase lg:text-base">
              完成率
            </p>
          </div>
          <div className="text-center md:border-r">
            <h6 className="text-4xl font-bold lg:text-5xl xl:text-6xl">
              {getPercentage(sampleBatch, 'precision')}
            </h6>
            准确率
            <p className="text-sm font-medium tracking-widest text-gray-800 uppercase lg:text-base"></p>
          </div>
          <div className="text-center">
            <h6 className="text-4xl font-bold lg:text-5xl xl:text-6xl">
              {getPercentage(sampleBatch, 'recall')}
            </h6>
            <p className="text-sm font-medium tracking-widest text-gray-800 uppercase lg:text-base">
              召回率
            </p>
          </div>
        </div>
      </div>

      <Loadable loading={diffing}>
        {compose(
          toTabContent,
          groupBy(calculateIndex),
          when(isNil, always([]))
        )(columnSampleEntries)}
      </Loadable>
    </>
  );

  return (
    <>
      <Card className="text-left">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {path(['data', 'prompt'], record)}
        </h5>
        <div className="font-normal text-gray-700 dark:text-gray-400">
          <ul>
            {compose(
              map((question: string) => (
                <li key={`${record.uid}-question`}>
                  {path(
                    [getQuestionCategoryFromTableName(table), question],
                    questions
                  )}
                </li>
              )),
              pathOr([], ['data', 'answers'])
            )(record)}
          </ul>
        </div>
      </Card>

      <div className="mt-10">
        {ifElse(isNil, renderTable, renderSampleBatch)(selectedSampleBatch)}
      </div>

      <FloatingMenu
        handleClick={
          isNil(selectedSampleBatch)
            ? clearSelectedColumnDetail
            : () => setSelectedSampleBatch(undefined)
        }
        icon={
          isNil(selectedSampleBatch)
            ? KeyboardArrowLeftIcon
            : KeyboardDoubleArrowLeftIcon
        }
      />
    </>
  );
};
