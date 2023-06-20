import { Alert, Tooltip, Table, Dropdown, } from 'flowbite-react';
import {
  always,
  compose,
  flip,
  ifElse,
  map,
  path,
  prop,
  propOr,
  isEmpty,
  equals,
  anyPass,
  curry,
  __,
  when,
  concat,
  invoker,
  multiply,
  juxt,
  sum,
  identity,
  divide,
  apply,
  values,
  unless,
  isNil,
  not,
} from 'ramda';
import dayjs from 'dayjs';
import { SampleBatch } from '../../interfaces';
import { isBlank, toPercentage } from '../../utils/common';
import CompareIcon from '@mui/icons-material/Compare';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import OfflineBoltRoundedIcon from '@mui/icons-material/OfflineBoltRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import SyncIcon from '@mui/icons-material/Sync';
import GavelIcon from '@mui/icons-material/Gavel';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import styled from 'styled-components';
import translations from '../../utils/translations';
import { tapLog } from '../../utils/log';
import classNames from 'classnames';

export enum Mode {
  Admin = 1,
  Normal = 2
}

const StatisticsContainer = styled.ul`
  list-style: none;
  margin-left: 0.5rem;
`;

const ActionContainer = styled.div`
  display: flex;

  > div {
    margin-left: .2rem;

    &:first-child {
      margin-left: 0rem;
    }
  }
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

export default ({
  mode,
  sampleBatches,
  showSampleBatch,
  dispatchAction,
  requestFullCapacity
}) => {
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
  const dispatch = curry(dispatchAction);
  const statesTranslations = path(['sample_batch', 'states'], translations);
  const isState = (state: string) => compose(equals(state), prop('state'));
  const isPending = isState('pending');
  const isFinished = isState('complete');
  const isRunning = isState('running');
  const isToBeConfirmed = isState('to_be_confirmed');
  const isAdmin = equals(mode, Mode.Admin);
  const hasFailure = compose(not, isNil, path(['historiesStatistics', 'failure']));
  const adminActions = (record: SampleBatch) => (
    <Dropdown
      inline
      label="Actions"
    >
      <Dropdown.Item
        className={classNames({"text-neutral-400 pointer-events-none": !isToBeConfirmed(record)})}
        onClick={() => when(isToBeConfirmed, dispatch('confirm'))(record)}
      >
        Confirm
      </Dropdown.Item>
      <Dropdown.Item
        className={classNames({"text-neutral-400 pointer-events-none": !isPending(record)})}
        onClick={() => when(isPending, dispatch('run'))(record)}
      >
        Authorize
      </Dropdown.Item>
      <Dropdown.Item
        className={classNames({"text-neutral-400 pointer-events-none": !isRunning(record)})}
        onClick={() => when(isRunning, dispatch('check'))(record)}
      >
        Refresh State
      </Dropdown.Item>
      <Dropdown.Item
        className={classNames({"text-neutral-400 pointer-events-none": !hasFailure(record)})}
        onClick={() => when(hasFailure, dispatch('rerun'))(record)}
      >
        Rerun Failures
      </Dropdown.Item>
      <Dropdown.Item
        className={classNames({"text-neutral-400 pointer-events-none": !isFinished(record)})}
        onClick={() => when(isFinished, dispatch('apply'))(record)}
      > 
        Apply
      </Dropdown.Item>
    </Dropdown>
  );
  const userActions = (record: SampleBatch) => (
    <Dropdown
      inline
      label="Actions"
    >
      <Dropdown.Item
        className={classNames({"text-neutral-400 pointer-events-none": true || !isPending(record)})}
        onClick={() => when(isPending, dispatch('confirm'))(record)}
      >
        Run
      </Dropdown.Item>
      <Dropdown.Item
        className={classNames({"text-neutral-400 pointer-events-none": !isFinished(record)})}
        onClick={() => when(isPending, showSampleBatch)(record)}
      >
        Diff
      </Dropdown.Item>
      <Dropdown.Item
        className={classNames({"text-neutral-400 pointer-events-none": !isRunning(record)})}
        onClick={() => when(isRunning, dispatch('refreshSampleBatch'))(record)}
      >
        Force refresh state
      </Dropdown.Item>
      <Dropdown.Item
        className={classNames({"text-neutral-400 pointer-events-none": !hasFailure(record)})}
        onClick={() => when(hasFailure, dispatch('rerun'))(record)}
      >
        Rerun Failures
      </Dropdown.Item>
    </Dropdown>
  );
  // const userActions = (record: SampleBatch) => (
  //   <>
  //     {false && (
  //       <Tooltip placement="top" content="Run">
  //         <a
  //           href="#"
  //           className={classNames('font-medium', {
  //             'text-gray-200 disabled': !isPending(record),
  //             'hover:text-blue-600 dark:hover:text-blue-500': isPending(record)
  //           })}
  //           onClick={(e: MouseEvent<HTMLAnchorElement>) => {
  //             e.preventDefault();
  //             when(isPending, dispatch('run'))(record);
  //           }}
  //         >
  //           <PlayArrowIcon fontSize="medium" />
  //         </a>
  //       </Tooltip>
  //     )}
  //     <Tooltip placement="top" content="Diff">
  //       <a
  //         href="#"
  //         className={classNames('font-medium', {
  //           'text-gray-200 disabled': !isFinished(record),
  //           'hover:text-blue-600 dark:hover:text-blue-500': isFinished(record)
  //         })}
  //         onClick={(e: MouseEvent<HTMLAnchorElement>) => {
  //           e.preventDefault();
  //           when(isFinished, showSampleBatch)(record);
  //         }}
  //       >
  //         <CompareIcon fontSize="medium" />
  //       </a>
  //     </Tooltip>
  //     <Tooltip placement="top" content="Force refresh state">
  //       <a
  //         href="#"
  //         className={classNames('font-medium ml-2', {
  //           'text-gray-200 disabled': !isRunning(record),
  //           'hover:text-blue-600 dark:hover:text-blue-500': isRunning(record)
  //         })}
  //         onClick={(e: MouseEvent<HTMLAnchorElement>) => {
  //           e.preventDefault();
  //           when(isRunning, dispatch('refreshSampleBatch'))(record);
  //         }}
  //       >
  //         <SettingsBackupRestoreIcon fontSize="medium" />
  //       </a>
  //     </Tooltip>
  //     {false && (
  //       <Tooltip placement="top" content="全量">
  //         <a
  //           href="#"
  //           className={classNames('font-medium ml-2', {
  //             'text-gray-200 disabled': !isFinished(record),
  //             'hover:text-blue-600 dark:hover:text-blue-500': isFinished(record)
  //           })}
  //           onClick={(e: MouseEvent<HTMLAnchorElement>) => {
  //             e.preventDefault();
  //             when(isFinished, dispatch('requestFullCapacity'))(record);
  //           }}
  //         >
  //           <OfflineBoltRoundedIcon fontSize="medium" />
  //         </a>
  //       </Tooltip>
  //     )}
  //   </>
  // );
  const getTotal = compose(sum, values);
  const getQuantity = (attr: string) =>
    compose(
      ifElse(isBlank, always(0), identity),
      prop(attr)
    );
  const calculatePercentage = (record: SampleBatch, attr: string) =>
    compose(
      flip(concat)('%'),
      invoker(1, 'toFixed')(1),
      tapLog('b'),
      apply(divide),
      tapLog('a'),
      juxt([
        compose(
          multiply(100),
          getQuantity(attr),
        ),
        getTotal,
      ]),
      prop('historiesStatistics'),
    )(record);
  const toLine = (record: SampleBatch) => (
    <Table.Row
      key={record.uid}
      className="bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
        {record.uid}
      </Table.Cell>
      <Table.Cell>{record.model}</Table.Cell>
      {unless(
        identity,
        () => (
          <>
            <Table.Cell>
              {getDisplayablePercentage(record, 'precision')}
            </Table.Cell>
            <Table.Cell>
              {getDisplayablePercentage(record, 'recall')}
            </Table.Cell>
          </>
        )
      )(isAdmin)}
      <Table.Cell>{record.cost}</Table.Cell>
      <Table.Cell>
        {compose(
          flip(prop)(statesTranslations),
          propOr('unknown', 'state')
        )(record)}
      </Table.Cell>
      {when(
        identity,
        () => (
          <>
            <Table.Cell>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-lime-500">
                <div style={{ width: calculatePercentage(record, 'failure') }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
                <div style={{ width: calculatePercentage(record, 'retrying') }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"></div>
              </div>
            </Table.Cell>
          </>
        ),
      )(isAdmin)}
      <Table.Cell>
        {dayjs(record.createdAt * 1000).format('YYYY-MM-DD HH:mm:ss')}
      </Table.Cell>
      <Table.Cell>
        <ActionContainer>
          {ifElse(always(isAdmin), adminActions, userActions)(record)}
        </ActionContainer>
      </Table.Cell>
    </Table.Row>
  );
  const renderTable = (data: SampleBatch[]) => (
    <Table hoverable={true}>
      <Table.Head>
        <Table.HeadCell>Sample</Table.HeadCell>
        <Table.HeadCell>Model</Table.HeadCell>
        {unless(
          identity,
          () => (
            <>
              <Table.HeadCell>Precision</Table.HeadCell>
              <Table.HeadCell>Recall</Table.HeadCell>
            </>
          )
        )(isAdmin)}
        <Table.HeadCell>Cost</Table.HeadCell>
        <Table.HeadCell>State</Table.HeadCell>
        {when(
          identity,
          () => (
            <>
              <Table.HeadCell>Progress</Table.HeadCell>
            </>
          )
        )(isAdmin)}
        <Table.HeadCell>Created_at</Table.HeadCell>
        <Table.HeadCell>
          <span className="sr-only">Edit</span>
        </Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y">{map(compose(toLine, tapLog('record')), data)}</Table.Body>
    </Table>
  );

  const renderEmptyLabel = () => (
    <Alert color="info" className="my-5">
      <span className="font-medium">暂无数据</span>
    </Alert>
  );

  return ifElse(isEmpty, renderEmptyLabel, renderTable)(sampleBatches);
};
