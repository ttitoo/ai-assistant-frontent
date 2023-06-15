import { FC } from 'react';
import { Tooltip } from 'flowbite-react';
import { default as Looks1Icon } from '@mui/icons-material/LooksOne';
import { default as Looks2Icon } from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';
import Looks6Icon from '@mui/icons-material/Looks6';
import AddBoxIcon from '@mui/icons-material/AddBox';
import RunCircleIcon from '@mui/icons-material/RunCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
// import classNames from "classnames";
import dayjs from 'dayjs';
import {
  ifElse,
  always,
  append,
  apply,
  compose,
  flip,
  map,
  prop,
  path,
  of,
  __,
  prepend,
  length,
  cond,
  equals,
  when,
  isNil
} from 'ramda';
import { ColumnDetail } from '../../interfaces';
import questions from '../../utils/questions';
import { getQuestionCategoryFromTableName } from '../../utils/common';
import styled from 'styled-components';
import useSagaDispatch from '../../hooks/useSagaDispatch';
import { ColumnsState } from '../../store/reducers/columns';
import { log } from '../../utils/log';

interface TableProps {
  table: string;
  column: string;
  payloads: ColumnDetail[];
  addFrom: (record: ColumnDetail) => void;
  showSampleForm: (e: MouseEvent, uid: string) => void;
  showDetail: (uid: string) => void;
}

const PromptContainer = styled.div`
  max-width: 500px;
`;

const QuestionContainer = styled.ul`
  list-style: disc;
  margin-left: 1rem;
`;

const Table = ({
  table,
  column,
  payloads,
  addFrom,
  showSampleForm,
  showDetail
}): FC<TableProps> => {
  const { dispatch, } = useSagaDispatch<ColumnsState>('columns');

  const setActive = async (uid: string) => {
    // await fetchData(`/columns/${uid}`, 'PUT', {
    //   active: true
    // });
  };

  const showColumnDetail = (e: MouseEvent, columnDetail: ColumnDetail) => {
    e.preventDefault();

    showDetail(columnDetail.uid);
  };

  const setActiveButton = (uid: string) => (
    <a
      href="#"
      className="hidden mr-2 font-medium text-blue-600 dark:text-blue-500 hover:underline"
      onClick={() => setActive(uid)}
    >
      Activate
    </a>
  );

  const toRecordEntry = (record: ColumnDetail) => {
    const attr = compose(flip(path)(record), flip(append)(['data']));
    return (
      <tr
        key={record.uid}
        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <td
          scope="row"
          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
        >
          {record.uid}
        </td>
        <td
          scope="row"
          className="px-6 py-4 font-medium text-gray-900 dark:text-white"
        >
          <Tooltip content={attr('prompt')}>
            <PromptContainer className="truncate">
              {attr('prompt')}
            </PromptContainer>
          </Tooltip>
        </td>
        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
          <Tooltip
            content={
              <QuestionContainer>
                {compose(
                  map((s: string) => (
                    <li key={s}>
                      {path(
                        [getQuestionCategoryFromTableName(table), s],
                        questions
                      )}
                    </li>
                  )),
                  attr
                )('answers')}
              </QuestionContainer>
            }
          >
            {compose(
              cond([
                [equals(1), () => <Looks1Icon fontSize="medium" />],
                [equals(2), () => <Looks2Icon fontSize="medium" />],
                [equals(3), () => <Looks3Icon fontSize="medium" />],
                [equals(4), () => <Looks4Icon fontSize="medium" />],
                [equals(5), () => <Looks5Icon fontSize="medium" />],
                [equals(6), () => <Looks6Icon fontSize="medium" />]
              ]),
              length,
              attr
            )('answers')}
          </Tooltip>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {dayjs(record.createdAt * 1000).format('YYYY-MM-DD HH:mm:ss')}
        </td>
        <td className="flex px-6 py-4 whitespace-nowrap text-right">
          {ifElse(
            prop('active'),
            always(undefined),
            compose(apply(setActiveButton), of)
          )(record)}
          <Tooltip placement="top" content="测试">
            <a
              href="#"
              className="mr-2 font-medium hover:text-blue-600 dark:hover:text-blue-500"
              onClick={compose(
                apply(showSampleForm),
                flip(prepend)([record.uid])
              )}
            >
              <RunCircleIcon fontSize="medium" />
            </a>
          </Tooltip>

          <Tooltip placement="top" content="显示测试详情">
            <a
              href="#"
              className="mr-2 font-medium hover:text-blue-600 dark:hover:text-blue-500"
              onClick={(e: MouseEvent) => showColumnDetail(e, record)}
            >
              <AssignmentIcon fontSize="medium" />
            </a>
          </Tooltip>

          <Tooltip placement="top" content="以此为模板创建新纪录">
            <a
              href="#"
              className="font-medium hover:text-blue-600 dark:hover:text-blue-500"
              onClick={flip(addFrom)(record)}
            >
              <AddBoxIcon fontSize="medium" />
            </a>
          </Tooltip>
        </td>
      </tr>
    );
  };
  const toRecordEntries = compose(map(toRecordEntry), when(isNil, always([])));
  return (
    <table className="w-full table-auto text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3" width={200}>
            UID
          </th>
          <th scope="col" className="px-6 py-3">
            Prompt
          </th>
          <th scope="col" className="px-6 py-3" width={120}>
            Answers
          </th>
          <th scope="col" className="hidden px-6 py-3">
            keywords
          </th>
          <th scope="col" className="px-6 py-3" width={200}>
            Created At
          </th>
          <th scope="col" className="px-6 py-3" width={180}>
            <span className="sr-only">Edit</span>
          </th>
        </tr>
      </thead>
      <tbody>{toRecordEntries(payloads)}</tbody>
    </table>
  );
};

export default Table;
