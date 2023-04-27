import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import Loadable from '../components/Loadable';
import Stats from '../components/Samples/Stats';
import Entries from '../components/Samples/Entries';
import useSagaDispatch from '../hooks/useSagaDispatch';
import { SamplesState } from '../store/reducers/samples';

const AdjustSample = () => {
  const { uid } = useParams();
  const { dispatch, state } = useSagaDispatch<SamplesState>('samples');
  const {
    loading,
    columnSample: sample,
    columnSampleEntries: payloads
  } = state;
  // const loading: boolean = useSelector(pathOr(true, ['samples', 'loading']));
  // const sample: ColumnSample = useSelector(path(['samples', 'columnSample']));
  // const payloads: ColumnSampleEntry[] = useSelector(path(['samples', 'columnSampleEntries']));

  useEffect(() => {
    dispatch('prepareAdjust', { uid });
  }, []);

  return (
    <div className="min-h-full">
      <div className="p-5 bg-white">
        <Breadcrumb
          items={[
            { title: 'Samples', path: '/samples' },
            { title: 'Adjust', path: '#' }
          ]}
        />

        <Loadable loading={loading}>
          <Stats columnSample={sample} />

          <Entries sample={sample} payloads={payloads} />
        </Loadable>
      </div>
    </div>
  );
};

export default AdjustSample;
