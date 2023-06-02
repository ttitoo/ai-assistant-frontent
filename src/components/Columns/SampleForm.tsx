import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Modal, Button, Label } from 'flowbite-react';
import Select from 'react-select';
import { ColumnSample, Meta, Option, SampleBatch } from '../../interfaces';
import {
  compose,
  set,
  lensProp,
  isNil,
  prop,
  nthArg,
  applySpec,
  map,
  find,
  curry,
  pathOr,
  length,
  propEq,
  __,
  flip,
  propOr,
  mapObjIndexed,
  values,
  pluck,
  join
} from 'ramda';
import useSagaDispatch from '../../hooks/useSagaDispatch';
import { ColumnsState } from '../../store/reducers/columns';
import { arrayToOptions } from '../../utils/common';

interface FormProps {
  meta: Meta;
  columnDetailUid: string | undefined;
  table: string;
  column: string;
  close: (e: MouseEvent) => void;
}

interface Options {
  [key: string]: Option[];
}

const SampleForm = ({
  loading,
  meta,
  columnDetailUid,
  table,
  column,
  close
}) => {
  const { dispatch, state } = useSagaDispatch<ColumnsState>('columns');
  const { columnSamples: samples } = state;
  const [selectedSample, setSelectedSample] = useState<
    ColumnSample | undefined
  >(undefined);
  const [model, setModel] = useState<string>();
  const [splitPerTokens, setSplitPerTokens] = useState<number>(-1);
  const [options, setOptions] = useState<Options>({});
  const updateOptions = curry((key: string, val: Option[]) =>
    setOptions(set(lensProp(key), val, options))
  );
  useEffect(() => {
    compose(
      updateOptions('samples'),
      map(
        applySpec({
          label: (e) => `${prop('uid', e)} (${prop('count', e)})`,
          value: prop('uid')
        })
      )
    )(samples);
  }, [compose(join('-'), pluck('uid'))(samples)]);
  useEffect(() => {
    compose(
      updateOptions('models'),
      values,
      mapObjIndexed(
        applySpec({
          label: nthArg(1),
          value: nthArg(0)
        })
      ),
      pathOr({}, ['gpt', 'models'])
    )(meta);
  }, [compose(length, propOr([], 'gpt'))(meta)]);
  useEffect(() => {
    if (!isNil(table) && !isNil(column)) {
      dispatch('listColumnSamples', { table, column, toggleLoading: false });
    }
  }, [table, column]);

  const updateSelectedSample = compose<
    [MouseEvent],
    string,
    boolean,
    ColumnSample,
    Dispatch<SetStateAction<ColumnSample>>
  >(
    setSelectedSample,
    flip(find)(samples),
    propEq('uid'),
    prop<string>('value')
  );

  const run = () => {
    dispatch('runSample', {
      columnDetailUid,
      columnSampleUid: selectedSample.uid,
      model,
      splitPerTokens
    });
  };
  return (
    <Modal
      show={!isNil(columnDetailUid)}
      popup={true}
      onClose={loading ? undefined : close}
    >
      <Modal.Header>Run Sample</Modal.Header>
      <Modal.Body>
        <form className="flex flex-col gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="sample" value="Sample" />
            </div>
            <Select
              onChange={updateSelectedSample}
              options={propOr([], 'samples', options)}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="model" value="Model" />
            </div>
            <Select
              onChange={compose(setModel, prop('value'))}
              options={propOr([], 'models', options)}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="model" value="Token" />
            </div>
            <Select
              onChange={compose(setSplitPerTokens, prop('value'))}
              options={arrayToOptions([-1, 50, 100, 250, 500, 1000, 2000], {
                '-1': 'One By One'
              })}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button disabled={loading} onClick={run}>
          {loading && (
            <>
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-4 h-4 mr-3 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
            </>
          )}
          Run
        </Button>
        <Button disabled={loading} color="gray" onClick={close}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SampleForm;
