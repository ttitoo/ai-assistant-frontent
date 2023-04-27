import { MutableRefObject, useRef, useState, useEffect, } from "react";
import { Modal, Button, TextInput, Label } from "flowbite-react";
import Select from "react-select";
import { ColumnSample } from "../../interfaces";
import { log, tapLog } from "../../utils/log";
import { isBlank } from "../../utils/common";
import {
  compose,
  curry,
  apply,
  set,
  juxt,
  lensProp,
  path,
  prop,
  propOr,
  nthArg,
  curryN,
  flip,
  ifElse,
  applySpec,
  map,
  mapObjIndexed,
  identity,
  keys,
  isNil,
  always,
  __,
  values,
  invoker,
  head,
  unless,
  mergeRight,
  objOf,
} from "ramda";
import StateManagedSelect from "react-select";

const tableOptions = [{ value: "founder_features", label: "founder_features" }];

const columnOptions = [
  { value: "phd", label: "phd" },
  { value: "professor", label: "professor" },
  { value: "top_college", label: "top_college" },
];

const Form = ({ show, loading, tables, close, create }) => {
  const columnRef = useRef<MutableRefObject | undefined>(undefined)
  const countRef = useRef<MutableRefObject | undefined>(undefined)
  const [sample, setSample] = useState<ColumnSample>({});
  const updateAttr = compose(
    setSample,
    apply(set),
    juxt([compose(lensProp, nthArg(1)), nthArg(2), nthArg(0)])
  );
  const updateSampleAttr = curryN(3, updateAttr)(sample);
  useEffect(() => {
    compose(
      unless(
        isBlank,
        () => columnRef.current.setValue(undefined),
      ),
      prop('table')
    )(sample)
  }, [sample.table])

  const toTableOptions = compose(
    values,
    mapObjIndexed(
      applySpec({
        label: compose(prop("name"), nthArg(0)),
        value: nthArg(1),
      })
    )
  ) ;

  const toColumnOptions = ifElse(
    isNil,
    always([]),
    compose(
      values,
      mapObjIndexed(
        applySpec({
          label: nthArg(0),
          value: nthArg(1),
        })
      ),
      propOr([], 'columns'),
      curry(propOr)({}, __, tables),
      tapLog('TABLE'),
    )
  )

  const doCreate = (e: MouseEvent) => {
    const getCount = compose(
      objOf('count'),
      parseInt,
      path(['current', 'value']) 
    );
    compose(
      curry(create)(e),
      mergeRight(sample),
      getCount
    )(countRef);
  }

  return (
    <Modal show={show} popup={true} onClose={loading ? undefined : close}>
      <Modal.Header>Create Sample</Modal.Header>
      <Modal.Body>
        <form className="flex flex-col gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="table" value="Table" />
            </div>
            <Select
              onChange={compose(updateSampleAttr("table"), prop("value"))}
              options={toTableOptions(tables)}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="column" value="Column" />
            </div>
            <Select
              ref={columnRef}
              onChange={compose(updateSampleAttr("column"), prop("value"))}
              options={compose(toColumnOptions, tapLog('===='), prop("table"))(sample)}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="count" value="Count" />
            </div>
            <TextInput
              type="number"
              ref={countRef}
              required={true}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button disabled={loading} onClick={doCreate}>
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
          Create
        </Button>
        <Button disabled={loading} color="gray" onClick={close}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Form;
