import { prop } from 'ramda';
import { Dispatch } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSagaDispatchPayload } from '../interfaces';
import { ColumnsState } from '../store/reducers/columns';
import { SamplesState } from '../store/reducers/samples';

interface SagaDispatch<T> {
  dispatch: (action: string, payload?: any) => void
  state: T
}

function useSagaDispatch<ReducerState>(namespace: string): SagaDispatch<ReducerState> {
  const dispatcher: Dispatch<ReduxSagaDispatchPayload> = useDispatch();
  const dispatch = (action: string, payload: any = {}) =>
    dispatcher({
      type: `${namespace}/${action}`,
      payload
    });
  const state = useSelector(prop(namespace));

  return { dispatch, state, };
};

export default useSagaDispatch;
