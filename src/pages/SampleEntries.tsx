import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { Alert } from 'flowbite-react';
import {
  unless,
  invoker,
  always,
  isNil,
  path,
  ifElse,
  __,
  prop,
  juxt,
  join,
  compose
} from 'ramda';
import InfoIcon from '@mui/icons-material/Info';
import { useSelector } from 'react-redux';
import Breadcrumb from '../components/Breadcrumb';
import Loadable from '../components/Loadable';
import Entries, { next, } from '../components/Samples/Entries';
import AdjustModal from '../components/Samples/AdjustModal';
import styled from 'styled-components';
import FooterStats from '../components/Samples/FooterStats';
import useSagaDispatch from '../hooks/useSagaDispatch';
import { SamplesState } from '../store/reducers/samples';
import { log } from '../utils/log';

const EntriesContainer = styled.div`
  padding-bottom: 115px;
`;

const Page = () => {
  const { uid } = useParams();
  const { dispatch, state } = useSagaDispatch<SamplesState>('samples');
  const adjustment = useSelector(path(['app', 'meta', 'columnSamples', 'adjustment']));
  const {
    loading,
    columnSampleEntries: payloads,
    columnSample: sample,
    statistics,
  } = state;
  // const loading = useSelector(path(['samples', 'loading']));
  // const payloads = useSelector(path(['samples', 'columnSampleEntries']));
  // const sample = useSelector(path(['samples', 'columnSample']));
  // const statistics = useSelector(path(['samples', 'statistics']))
  const [error] = useState<string | undefined>(undefined);
  const [adjusting, setAdjusting] = useState<boolean>(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (isNil(uid)) {
      return navigate('/samples');
    } else {
      dispatch('listColumnSampleEntries', { uid, toggleLoading: true });
      setTimeout(next('previousElementSibling'), 4000);
    }

    return () => {
      dispatch('clear');
    }
  }, []);

  const identity = ifElse(
    isNil,
    always(''),
    compose(join('#'), juxt([prop('table'), prop('column')]))
  )(sample);
  return (
    <div className="min-h-full">
      <div id="judgements-container" className="p-5 bg-white">
        <Breadcrumb
          items={[
            { title: 'Samples', path: '/samples' },
            { title: `${uid} ${identity}` }
          ]}
        />
        <Loadable loading={loading}>
          {ifElse(
            isNil,
            () => (
              <EntriesContainer>
                <Entries
                  sample={sample}
                  payloads={payloads}
                />
              </EntriesContainer>
            ),
            () => (
              <Alert
                color="failure"
                additionalContent={
                  <React.Fragment>
                    <div className="text-left mt-2 mb-4 text-sm text-red-700 dark:text-red-800">
                      {error}
                    </div>
                    <div className="flex">
                      <Link
                        type="button"
                        className="mr-2 inline-flex items-center rounded-lg bg-red-700 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-800 dark:hover:bg-red-900"
                        to="/columns"
                      >
                        前往设置
                      </Link>
                      <Link
                        type="button"
                        className="rounded-lg border border-red-700 bg-transparent px-3 py-1.5 text-center text-xs font-medium text-red-700 hover:bg-red-800 hover:text-white focus:ring-4 focus:ring-red-300 dark:border-red-800 dark:text-red-800 dark:hover:text-white"
                        to="/samples"
                      >
                        返回
                      </Link>
                    </div>
                  </React.Fragment>
                }
                icon={InfoIcon}
              >
                <h3 className="text-lg font-medium text-red-700 dark:text-red-800">
                  错误!
                </h3>
              </Alert>
            )
          )(error)}
          {loading || <FooterStats columnSample={sample} startAdjust={() => setAdjusting(true)} statistics={statistics} />}
        </Loadable>
      </div>
      <AdjustModal
        show={adjusting}
        adjustment={adjustment}
        columnSample={sample}
        close={() => setAdjusting(false)}
      />
    </div>
  );
};

export default Page;
