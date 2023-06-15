import { ReactNode, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';
import {
  addIndex,
  applySpec,
  compose,
  curry,
  head,
  equals,
  map,
  keys,
  prop,
  propOr,
  flip,
  mergeLeft,
  path,
  isNil,
  __,
  isEmpty,
  unless,
  any,
  ifElse,
  join,
  is,
  find,
  propEq
} from 'ramda';
import { useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import Breadcrumb from '../components/Breadcrumb';
import Loadable from '../components/Loadable';
import Table from '../components/Columns/Table';
import Form from '../components/Columns/Form';
import Detail from '../components/Columns/Detail';
import SampleForm from '../components/Columns/SampleForm';
import { ColumnDetail, SampleBatch } from '../interfaces';
// import styles from "./page.module.css";
import FloatingMenu from '../components/FloatingMenu';
import styled from 'styled-components';
import { isBlank } from '../utils/common';
import useSagaDispatch from '../hooks/useSagaDispatch';
import { ColumnsState } from '../store/reducers/columns';
import { log, tapLog } from '../utils/log';

const FitContentContainer = styled.div`
  height: fit-content;
`;

const IconContainer = styled.div`
  svg {
    font-size: 120px;
    color: #424242;
  }
`;

const Columns = () => {
  const {
    table: previouSelectedTable,
    column: previousSelectedColumn,
    uid: previousSelectedColumnUid,
    batch_uid: previousSampleBatchUid
  } = useParams();
  const { dispatch, state } = useSagaDispatch<ColumnsState>('columns');
  const meta = useSelector(path(['app', 'meta']));
  const tables = useSelector(path(['app', 'tables']));
  const {
    loading,
    submitting,
    success,
    sampleBatches,
    columnDetails: records
  } = state;
  const [editing, setEditing] = useState<ColumnDetail | undefined>(undefined);
  const [sampleFormVisible, setSampleFormVisible] = useState<
    string | undefined
  >(undefined);
  const [selectedTable, setSelectedTable] = useState<string | undefined>(
    previouSelectedTable
  );
  const [selectedColumn, setSelectedColumn] = useState<string | undefined>(
    previousSelectedColumn
  );
  const [selectedColumnDetailUid, setSelectedColumnDetailUid] = useState<
    string | undefined
  >(previousSelectedColumnUid);
  const [selectedSampleBatch, setSelectedSampleBatch] = useState<
    SampleBatch | string | undefined
  >(previousSampleBatchUid);

  log('previousSampleBatchUid', previousSampleBatchUid);

  const showDetail = (uid: string) => {
    dispatch('listSampleBatches', {
      uid,
      toggleLoading: false
    });
    history.pushState(
      undefined,
      '',
      `/columns/${selectedTable}/${selectedColumn}/${uid}`
    );
    setSelectedColumnDetailUid(uid);
  };

  const showSampleBatch = (sampleBatch: SampleBatch) => {
    history.pushState(
      undefined,
      '',
      `${selectedColumnDetailUid}/batches/${sampleBatch.uid}/diff`
    );
    setSelectedSampleBatch(sampleBatch);
    dispatch('diff', { uid: sampleBatch.uid });
  };

  const redirect = (forceToColumns: boolean = false) => {
    if (forceToColumns || isNil(selectedColumnDetailUid)) {
      const urlParts = ['/columns'];
      const appendUrl = unless(isNil, (a) => urlParts.push(a));
      appendUrl(selectedTable);
      appendUrl(selectedColumn);
      forceToColumns || appendUrl(selectedColumnDetailUid);
      log('url', join('/', urlParts));
      history.pushState(undefined, '', join('/', urlParts));
    } else {
      showDetail(selectedColumnDetailUid);
    }
  };

  const clearSelectedSampleBatch = () => {
    setSelectedSampleBatch(undefined);
    redirect(true);
  };

  const clearSelectedColumnDetail = () => {
    setSelectedColumnDetailUid(undefined);
    redirect(true);
  };

  useEffect(() => {
    if (isNil(previouSelectedTable)) {
      unless(isEmpty, compose(setSelectedTable, head, keys))(tables);
    }
  }, [tables]);

  useEffect(() => {
    if (!isNil(selectedTable) && !isNil(selectedColumn)) {
      clearSelectedColumnDetail();
      dispatch('list', { table: selectedTable, column: selectedColumn });
    }
    redirect();
  }, [selectedTable, selectedColumn]);

  useEffect(() => {
    if (is(String, selectedSampleBatch)) {
      // console.info('========================', ifElse(isNil, always(0), length)(sampleBatches))
      compose(
        unless(isNil, showSampleBatch),
        find(propEq('uid', selectedSampleBatch))
      )(sampleBatches);
    }
  }, [compose(prop('columnDetailUid'), head)(sampleBatches)]);

  useEffect(() => {
    if (!submitting) {
      isNil(editing) || setEditing(undefined);
      if (success) {
        isNil(sampleFormVisible) || setSampleFormVisible(undefined);
      }
    }
  }, [submitting]);

  const create = async (e: MouseEvent, record: ColumnDetail) => {
    e.preventDefault();
    const data = prop('data')(record);
    dispatch('create', { table: selectedTable, column: selectedColumn, data });
  };

  const changeColumn = (e: MouseEvent) => {
    e.preventDefault();

    clearSelectedColumnDetail();
    compose(setSelectedColumn, path(['target', 'dataset', 'column']))(e);
  };

  const isSelectedColumn = equals(selectedColumn);
  const toColumnEntry = (columnName: string, index: number): ReactNode => (
    <button
      key={columnName}
      aria-current={`${isSelectedColumn(columnName)}`}
      type="button"
      data-column={columnName}
      className={classNames(
        'w-full px-4 py-2 font-medium text-left border-b border-gray-200 cursor-pointer focus:outline-none dark:bg-gray-800 dark:border-gray-600',
        applySpec({
          'text-white': isSelectedColumn,
          'bg-blue-700': isSelectedColumn
        })(columnName),
        {
          'rounded-t-lg': index === 0,
          'rounded-b-lg':
            keys(tables[selectedTable].columns).length - 1 === index
        }
      )}
      onClick={changeColumn}
    >
      {path([selectedTable, 'columns', columnName], tables)}
    </button>
  );

  const add = (e: MouseEvent) => {
    e.preventDefault();
    setEditing({
      uid: new Date().getTime()
    } as ColumnDetail);
  };

  const addFrom = (e: MouseEvent, record: ColumnDetail) => {
    e.preventDefault();
    compose(
      setEditing,
      mergeLeft<ColumnDetail>({
        uid: new Date().getTime(),
        _new: false
      } as ColumnDetail)
    )(record);
  };

  const changeTable = (e: MouseEvent<HTMLAnchorElement>, tableName: string) => {
    e.preventDefault();
    history.pushState(undefined, '', `/columns/${selectedTable}`);
    setSelectedTable(tableName);
    setSelectedColumn(undefined);
  };

  const toTableEntry = (tableName: string): ReactNode => (
    <button
      type="button"
      key={tableName}
      aria-selected={equals(selectedTable, tableName)}
      className={classNames(
        'inline-block p-4 border-b-2 rounded-t-lg',
        equals(selectedTable, tableName)
          ? 'active text-blue-600 border-blue-600 border-b-2'
          : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
      )}
      onClick={flip(changeTable)(tableName)}
    >
      {path([tableName, 'name'], tables)}
    </button>
  );
  const tableList = compose(map(toTableEntry), keys)(tables);
  const tableTabs = (
    <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
      <div className="flex flex-col">
        <div
          aria-label="Tabs with underline"
          role="tablist"
          className="flex text-center flex-wrap -mb-px border-b border-gray-200 dark:border-gray-700"
        >
          {tableList}
        </div>
      </div>
    </div>
  );

  const columnList = compose(
    addIndex(map)(toColumnEntry),
    keys,
    prop('columns'),
    curry(propOr)([])
  )(selectedTable, tables);

  const showSampleForm = (e: MouseEvent, uid: string) => {
    e.preventDefault();
    setSampleFormVisible(uid);
  };

  const closeSampleForm = (e: MouseEvent) => {
    e.preventDefault();
    setSampleFormVisible(undefined);
  };

  return (
    <div className="min-h-full">
      <div className="p-5 bg-white">
        <Breadcrumb items={[{ title: 'Columns', path: 'columns' }]} />
        {tableTabs}
        <div className="flex py-4">
          <FitContentContainer className="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            {columnList}
          </FitContentContainer>
          <div className="flex-1 ml-4 relative overflow-x-hidden">
            <Loadable loading={loading}>
              {ifElse(
                isBlank,
                () =>
                  any(isNil)([selectedTable, selectedColumn]) ? (
                    <div className="m-4 text-center">
                      <IconContainer>
                        <AnnouncementIcon fontSize="inherit" />
                      </IconContainer>
                      <p className="text-xl">请选择左侧特征</p>
                    </div>
                  ) : (
                    <div className="flow-root overflow-auto shadow-md sm:rounded-lg">
                      <Table
                        key="table"
                        table={selectedTable}
                        column={selectedColumn}
                        payloads={records}
                        addFrom={addFrom}
                        showSampleForm={showSampleForm}
                        showDetail={showDetail}
                      />
                      <div
                        className={classNames('my-10', {
                          hidden: !isEmpty(records)
                        })}
                      >
                        暂无数据
                      </div>
                    </div>
                  ),
                () => (
                  <Detail
                    key="detail"
                    loading={loading || is(String, selectedSampleBatch)}
                    table={selectedTable}
                    column={selectedColumn}
                    columnDetailUid={selectedColumnDetailUid}
                    sampleBatch={selectedSampleBatch}
                    showSampleBatch={showSampleBatch}
                    tables={tables}
                    clearSelectedColumnDetail={clearSelectedColumnDetail}
                    clearSelectedSampleBatch={clearSelectedSampleBatch}
                  />
                )
              )(selectedColumnDetailUid)}
            </Loadable>
          </div>
        </div>
      </div>
      {isNil(editing) || (
        <Form
          loading={submitting}
          table={selectedTable}
          column={selectedColumn}
          answerFormats={prop('answerFormats', meta)}
          record={editing}
          create={create}
          close={() => setEditing(undefined)}
        />
      )}
      <SampleForm
        loading={submitting}
        meta={meta}
        columnDetailUid={sampleFormVisible}
        table={selectedTable}
        column={selectedColumn}
        close={closeSampleForm}
      />
      {any(isNil, [selectedTable, selectedColumn]) ||
        !isNil(selectedColumnDetailUid) || (
          <FloatingMenu handleClick={add} icon={AddIcon} />
        )}
    </div>
  );
};

export default Columns;
