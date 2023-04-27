import React, { Dispatch, useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import Form from "../components/Samples/Form";
import Table from "../components/Samples/Table";
import { ColumnSample, } from "../interfaces";
import Breadcrumb from '../components/Breadcrumb';
import Loadable from "../components/Loadable";
import FloatingMenu from "../components/FloatingMenu";
import { path } from "ramda";
import { useSelector } from "react-redux";
import useSagaDispatch from "../hooks/useSagaDispatch";
import { SamplesState } from "../store/reducers/samples";

// const fetcher = (...args) => fetch(...args).then(res => res.json())

const Page = () => {
  const { page } = useParams();
  const { dispatch, state } = useSagaDispatch<SamplesState>('samples');
  const tables = useSelector(path(['app', 'tables']));
  const {
    loading,
    submitting,
    samples: payloads,
  } = state;
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    dispatch('list', { page, });
  }, [page]);

  
  useEffect(() => {
    if (!submitting) {
      visible && setVisible(false);
    }
  }, [submitting]);

  const show = () => setVisible(true);
  const close = () => setVisible(false);
  const create = (e: MouseEvent, data: ColumnSample) => {
    e.preventDefault();
    dispatch('create', { data, })
  };

  return (
    <div className="min-h-full">
      <div className="p-5 bg-white">
        <Breadcrumb items={[{ title: 'Samples', path: 'samples' }]} />
        <Loadable loading={loading}>
          <Table tables={tables} payloads={payloads} evaluate={console.info} />
        </Loadable>
      </div>
      <Form show={visible} loading={submitting} tables={tables} close={close} create={create} />
      <FloatingMenu handleClick={show} />
    </div>
  );
};

export default Page;
