import { Alert, Tooltip, Table } from 'flowbite-react';
import {
  always,
  any,
  not,
  compose,
  flip,
  ifElse,
  isNil,
  juxt,
  map,
  path,
  prop,
  propOr,
  isEmpty,
  equals,
  anyPass,
  curry,
  __,
  when
} from 'ramda';
import dayjs from 'dayjs';
import { SampleBatch } from '../../interfaces';
import { isBlank, toPercentage } from '../../utils/common';
import CompareIcon from '@mui/icons-material/Compare';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import styled from 'styled-components';
import translations from '../../utils/translations';
import { tapLog } from '../../utils/log';
import classNames from 'classnames';

const StatisticsContainer = styled.ul`
  list-style: none;
  margin-left: 0.5rem;
`;

const isComplete = compose(
  anyPass([equals('complete'), isEmpty]),
  prop('state')
);

const getPercentage = (record: SampleBatch, attr: string): string =>
  compose(
    ifElse(isBlank, always('\\'), toPercentage),
    path(['statistics', attr])
  )(record);

const getDisplayablePercentage: (
  record: SampleBatch,
  attr: string
) => string = (record: SampleBatch, attr: string) =>
  ifElse(
    isComplete,
    () => getPercentage(record, attr),
    always<string>('\\')
  )(record);

export default ({ sampleBatches, showSampleBatch, runSampleBatch }) => {
  // const StatisticsDetail = (record: SampleBatch) => {
  //   const statistics = prop('statistics')(record);
  //   const finished =
  //     statistics.tn + statistics.tp + statistics.fp + statistics.fn;
  //   return (
  //     <StatisticsContainer>
  //       <li key={`${record.uid}-target`}>target: {statistics.target}</li>
  //       <li key={`${record.uid}-finished`}>finished: {finished}</li>
  //       <li key={`${record.uid}-complete`}>
  //         complete: {toPercentage(finished / statistics.target)}
  //       </li>
  //       <li key={`${record.uid}-tp`}>tp: {statistics.tp}</li>
  //       <li key={`${record.uid}-tn`}>tn: {statistics.tn}</li>
  //       <li key={`${record.uid}-fp`}>fp: {statistics.fp}</li>
  //       <li key={`${record.uid}-fn`}>fn: {statistics.fn}</li>
  //       <li key={`${record.uid}-precision`}>
  //         precision: {getPercentage(record, 'precision')}
  //       </li>
  //       <li key={`${record.uid}-recall`}>
  //         recall: {getPercentage(record, 'recall')}
  //       </li>
  //     </StatisticsContainer>
  //   );
  // };
  // const isStatisticsValid = compose(
  //   not,
  //   any(isNil),
  //   juxt([prop('precision'), prop('recall')]),
  //   prop('statistics')
  // );
  const statesTranslations = path(['sample_batch', 'states'], translations);
  const isPending = compose(equals('pending'), prop('state'));
  const toLine = (record: SampleBatch) => (
    <Table.Row
      key={record.uid}
      className="bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
        {record.uid}
      </Table.Cell>
      <Table.Cell>{record.model}</Table.Cell>
      <Table.Cell>{getDisplayablePercentage(record, 'precision')}</Table.Cell>
      <Table.Cell>{getDisplayablePercentage(record, 'recall')}</Table.Cell>
      <Table.Cell>{record.cost}</Table.Cell>
      <Table.Cell>
        {compose(
          flip(prop)(statesTranslations),
          propOr('unknown', 'state')
        )(record)}
      </Table.Cell>
      <Table.Cell>
        {dayjs(record.createdAt * 1000).format('YYYY-MM-DD HH:mm:ss')}
      </Table.Cell>
      <Table.Cell>
        <div className="flex">
          <Tooltip placement="top" content="Run">
            <a
              href="#"
              className={classNames('font-medium', {
                'text-gray-200 disabled': !isPending(record),
                'hover:text-blue-600 dark:hover:text-blue-500':
                  isPending(record)
              })}
              onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                when(isPending, runSampleBatch)(record);
              }}
            >
              <PlayArrowIcon fontSize="medium" />
            </a>
          </Tooltip>
          {isPending(record) || (
            <Tooltip placement="top" content="Diff">
              <a
                href="#"
                className="font-medium ml-2 hover:text-blue-600 dark:hover:text-blue-500"
                onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  showSampleBatch(record);
                }}
              >
                <CompareIcon fontSize="medium" />
              </a>
            </Tooltip>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  );
  const renderTable = (data: SampleBatch[]) => (
    <Table hoverable={true}>
      <Table.Head>
        <Table.HeadCell>Sample</Table.HeadCell>
        <Table.HeadCell>Model</Table.HeadCell>
        <Table.HeadCell>Precision</Table.HeadCell>
        <Table.HeadCell>Recall</Table.HeadCell>
        <Table.HeadCell>Cost</Table.HeadCell>
        <Table.HeadCell>State</Table.HeadCell>
        <Table.HeadCell>Created_at</Table.HeadCell>
        <Table.HeadCell>
          <span className="sr-only">Edit</span>
        </Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y">{map(toLine, data)}</Table.Body>
    </Table>
  );

  const renderEmptyLabel = () => (
    <Alert color="info" className="my-5">
      <span className="font-medium">暂无数据</span>
    </Alert>
  );

  return ifElse(isEmpty, renderEmptyLabel, renderTable)(sampleBatches);
};
