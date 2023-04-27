import classNames from 'classnames';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Accordion, Tooltip } from 'flowbite-react';
import {
  compose,
  mapObjIndexed,
  propOr,
  values,
  map,
  unless,
  invoker,
  flip,
  when,
  always,
  tap,
  prop,
  includes,
  isNil,
  path,
  ifElse,
  curry,
  __,
} from 'ramda';
import { snakeCase } from 'change-case';
import { ColumnSampleEntry } from '../../interfaces';
import { isBlank, getQuestionCategoryFromTableName } from '../../utils/common';
import styled from 'styled-components';
import questions from '../../utils/questions';
import useSagaDispatch from '../../hooks/useSagaDispatch';
import { ColumnsState } from '../../store/reducers/columns';

const Synced = styled.div`
  display: contents;
  color: #8bc34a;
`;

const Title = styled(Accordion.Title)`
  > h2 {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
`;

const Actions = styled.div`
  margin: 1rem 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Action = styled.a`
  display: flex;
  cursor: pointer;
  font-size: 4rem;
  margin-right: 1rem;

  &:last-child {
    margin-right: 0;
  }

  &.disactive {
    color: #b0bec5;
  }

  &.deletable {
    color: #ef6c00;
  }
`;

const PositiveAction = styled(Action)`
  color: #00c853;
`;

const NegativeAction = styled(Action)`
  color: #d50000;
`;

// const ProgressContainer = styled.div`
//   position: fixed;
//   bottom: 4rem;
//   width: -webkit-fill-available;
//   z-index: 999;
// `;

const nextAvailable = (e: MouseEvent | undefined) => {
  let node = document.querySelector(
    'div[data-testid=flowbite-accordion-content][data-judged=false]'
  );
  if (isNil(node) && !isNil(e)) {
    node = e.target.closest('[data-testid=flowbite-accordion-content]');
    // console.log('-----------', node);
  }

  return node;
};

const next = (direction: string = 'nextElementSibling') =>
  compose(
    unless(
      isNil,
      compose(
        unless(
          isNil,
          compose(invoker(0, 'click'), tap(invoker(0, 'scrollIntoView')))
        ),
        prop(direction)
      )
    ),
    nextAvailable
  );

export { next, };

const Entries = ({ sample, payloads, }) => {
  const { dispatch, } = useSagaDispatch<ColumnsState>('samples');

  const questionCategory = compose(
    unless(isBlank, getQuestionCategoryFromTableName),
    propOr('', 'table')
  )(sample);

  const judged = compose(flip(includes)([0, 1]), prop('judgement'));

  const doDispatch = (e: MouseEvent, action: string, payload: any) => {
    e.preventDefault();

    dispatch(action, payload);
  }

  const remove = (e: MouseEvent, entryUid: string) => doDispatch(e, 'adjust', { uid: sample.uid, data: { action: 'destroy', uids: [entryUid] } })

  const judge = (e: MouseEvent, entryUid: string, judgement: number) => doDispatch(e, 'judge', { uid: sample.uid, entryUid, judgement });

  const positive = curry(judge)(__, __, 1);
  const negative = curry(judge)(__, __, 0);

  const judgeAndNext = (
    fn: (e: MouseEvent, entryUid: string) => void,
    entry: ColumnSampleEntry
  ) => compose(curry(fn)(__, entry.uid), tap(next('previousElementSibling')));

  const toAnswer = (answer: string, question: string) => (
    <div className="mt-3 text-left" key={`${question}-${new Date().getTime()}`}>
      <p className="font-semibold text-gray-500 dark:text-gray-400">
        {compose(path([questionCategory, snakeCase(question)]))(questions) as string}:
      </p>
      <p className="text-gray-500 dark:text-gray-400">
        {when(isBlank, always('<无内容>'))(answer) as string}
      </p>
    </div>
  );

  const isSynced = ifElse(
    judged,
    () => (
      <Synced>
        <CloudDoneIcon fontSize="small" color="inherit" />
      </Synced>
    ),
    always(undefined)
  );

  const actions = (entry: ColumnSampleEntry) => (
    <>
      <PositiveAction
        className={classNames({ disactive: entry.judgement === 0 })}
        onClick={judgeAndNext(positive, entry)}
      >
        <Tooltip placement="top" content="Positive">
          <CheckCircleIcon fontSize="inherit" color="inherit" />
        </Tooltip>
      </PositiveAction>
      <NegativeAction
        className={classNames({ disactive: entry.judgement === 1 })}
        onClick={judgeAndNext(negative, entry)}
      >
        <Tooltip placement="top" content="Negative">
          <CancelIcon fontSize="inherit" color="inherit" />
        </Tooltip>
      </NegativeAction>
      <NegativeAction className="deletable" onClick={flip(remove)(entry.uid)}>
        <Tooltip placement="top" content="Remove">
          <RemoveCircleOutlineIcon fontSize="inherit" color="inherit" />
        </Tooltip>
      </NegativeAction>
    </>
  );

  const toEntry = (entry: ColumnSampleEntry) => (
    <Accordion.Panel key={entry.uid}>
      <Title>
        <div>{entry.pkId}</div>
        {isSynced(entry)}
      </Title>
      <Accordion.Content data-pkid={entry.pkId} data-judged={judged(entry)}>
        {compose(values, mapObjIndexed(toAnswer), propOr({}, 'answers'))(entry)}

        <Actions>{actions(entry)}</Actions>
      </Accordion.Content>
    </Accordion.Panel>
  );

  return <Accordion>{unless(isBlank, map(toEntry))(payloads)}</Accordion>;
};

export default Entries;
