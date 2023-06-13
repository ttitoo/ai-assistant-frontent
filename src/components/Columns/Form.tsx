import React, { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  Label,
  Badge
} from 'flowbite-react';
import Select from 'react-select';
import classNames from 'classnames';
import {
  append,
  apply,
  compose,
  filter,
  curryN,
  flip,
  includes,
  without,
  map,
  objOf,
  is,
  prop,
  propEq,
  path,
  pathOr,
  ifElse,
  isNil,
  of,
  pluck,
  lensPath,
  prepend,
  set,
  nthArg,
  juxt,
  when,
  __,
  applySpec,
  mapObjIndexed,
  values,
  always,
  join,
  find,
  identity,
  equals,
  propOr
} from 'ramda';
import { ColumnDetail } from '../../interfaces';
import questions from '../../utils/questions';
import translations from '../../utils/translations';
import { getQuestionCategoryFromTableName } from '../../utils/common';

const defaultValueOptions = [
  {
    label: '是',
    value: '1'
  },
  {
    label: '否',
    value: '0'
  }
];

const Form = ({
  loading,
  table,
  column,
  answerFormats,
  record,
  create,
  close
}) => {
  const [cfg, setCfg] = useState<{ res: ColumnDetail | undefined }>({
    res: undefined
  });
  const setRes = compose(setCfg, objOf('res'));
  const clearRes = () => setRes({});
  useEffect(() => {
    ifElse(isNil, clearRes, setRes)(record);
  }, [prop('uid', record)]);
  const updateAttr = compose(
    setRes,
    apply(set),
    juxt([
      compose(lensPath, prepend('data'), of, nthArg(1)),
      nthArg(2),
      nthArg(0)
    ])
  );
  const updateResAttr = curryN(3, updateAttr)(cfg.res);
  const addKeyword = (e: MouseEvent) => {
    const keywords = pathOr([], ['res', 'data', 'keywords'], cfg);
    compose(
      updateResAttr('keywords'),
      flip(append)(keywords),
      path(['target', 'value'])
    )(e);
    return e;
  };
  const clearInput = (e: MouseEvent) => {
    e.target.value = '';
  };
  const onEnter = when(propEq('key', 'Enter'), compose(clearInput, addKeyword));

  const removeKeyword = compose(
    updateResAttr('keywords'),
    apply(without),
    juxt([compose(of, nthArg(1)), path(['res', 'data', 'keywords'])])
  );

  const toKeywordBadge = (s: string): ReactNode => (
    <Badge color="info" size="sm" key={s}>
      {s}
      <span className="ml-1">
        <a href="#" onClick={() => removeKeyword(cfg, s)}>
          X
        </a>
      </span>
    </Badge>
  );

  const isNewRecord = propOr(true, '_new', record);

  const preventNullOptions = (fn) => ifElse(isNil, always([]), compose(apply(fn), of));

  const options = preventNullOptions(
    compose(
      values,
      mapObjIndexed(
        applySpec({
          value: nthArg(1),
          label: compose(
            join(''),
            juxt([nthArg(0), always('('), nthArg(1), always(')')])
          )
        })
      ),
      flip(prop)(questions),
      getQuestionCategoryFromTableName
    )
  )(table);

  const answerFormatOptions = preventNullOptions(
    compose(
      map(
        applySpec({
          value: identity,
          label: compose(
            flip(path)(translations),
            flip(append)(['answerFormats'])
          )
        })
      )
    )
  )(answerFormats);

  return (
    <Modal show={!isNil(record)} onClose={loading ? undefined : close}>
      <Modal.Header>Create</Modal.Header>
      <Modal.Body>
        <form className="flex flex-col gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="prompt" value="Prompt" />
            </div>
            <Textarea
              placeholder="Prompt"
              required={true}
              defaultValue={isNewRecord ? '' : path(['res', 'data', 'prompt'], cfg)}
              onBlur={compose(
                updateResAttr('prompt'),
                path(['target', 'value'])
              )}
              rows={4}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="answers" value="Required Answers" />
            </div>
            <Select
              isMulti
              value={isNewRecord ? '' : filter(
                compose(
                  flip(includes)(pathOr([], ['res', 'data', 'answers'], cfg)),
                  prop('value')
                )
              )(options)}
              onChange={compose(
                updateResAttr('answers'),
                pluck('value'),
                nthArg(0)
              )}
              options={options}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="default"
                value="Default value for empty content"
              />
            </div>
            <Select
              value={isNewRecord ? '' : find(
                compose(
                  equals(pathOr('0', ['res', 'data', 'default'], cfg)),
                  prop('value')
                )
              )(defaultValueOptions)}
              onChange={compose(
                updateResAttr('default'),
                prop('value'),
                nthArg(0)
              )}
              options={defaultValueOptions}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="answer_format" value="Answer format" />
            </div>
            <Select
              value={isNewRecord ? '' : find(
                compose(
                  equals(pathOr('text', ['res', 'data', 'format'], cfg)),
                  prop('value')
                )
              )(answerFormatOptions)}
              onChange={compose(
                updateResAttr('format'),
                prop('value'),
                nthArg(0)
              )}
              options={answerFormatOptions}
            />
          </div>
          <div className="hidden">
            <div className="mb-2 block">
              <Label htmlFor="keywords" value="Keywords" />
            </div>
            <TextInput type="text" onKeyUp={onEnter} required={true} />
            <div className="flex flex-wrap mt-2 gap-1">
              {compose(
                map(toKeywordBadge),
                pathOr([], ['res', 'data', 'keywords'])
              )(cfg)}
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button disabled={loading} onClick={flip(create)(cfg.res)}>
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
