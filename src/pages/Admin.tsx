import { useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import ColumnSampleTable, { Mode } from "../components/Columns/ColumnSampleTable";
import Loadable from "../components/Loadable";
import useSagaDispatch from "../hooks/useSagaDispatch"
import { SampleBatch } from "../interfaces";
import { AdminState } from "../store/reducers/admin"
import { log } from "../utils/log";

export default () => {
  const { dispatch, state, } = useSagaDispatch<AdminState>('admin');
  log('state', state);
  const {
    loading,
    sampleBatches
  } = state;

  useEffect(() => {
    dispatch('listBatches');
  }, []);

  const dispatchAction = (action: string, sampleBatch: SampleBatch) => {
    dispatch('dispatchAction', { action, uid: sampleBatch.uid });
  }

  return (
    <div className="min-h-full">
      <div className="p-5 bg-white">
        <Breadcrumb items={[{ title: 'Columns', path: 'columns' }]} />
        <Loadable loading={loading}>
          <ColumnSampleTable
            mode={Mode.Admin}
            sampleBatches={sampleBatches}
            showSampleBatch={console.info}
            dispatchAction={dispatchAction}
          />
        </Loadable>
      </div>
    </div>
  );
}
