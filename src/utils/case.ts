import {
  any,
  allPass,
  compose,
  is,
  keys,
  gte,
  flip,
  forEach,
  lte,
  invoker,
  split,
  map,
} from "ramda";
import { snakeCase, camelCase } from "change-case";
import { Map } from "../types";

const hasChinese = compose(
  any<string>(
    compose(
      allPass([flip(gte)(0x4e00), flip(lte)(0x9fa5)]),
      invoker(1, "charCodeAt")(0)
    )
  ),
  split('')
);

const transformToSubmittableCase = (data: object): object => {
  let result: any;
  if (is(Array, data)) {
    result = map<object, object[]>(transformToSubmittableCase)(data);
  } else if (is(Object, data)) {
    const obj: Map = {};
    forEach((key: string) => {
      if (key !== "_destroy") {
        obj[hasChinese(key) ? key : snakeCase(key)] = is(Object, data[key])
          ? transformToSubmittableCase(data[key])
          : data[key];
      } else {
        obj[key] = data[key];
      }
    })(keys(data));
    result = obj;
  } else {
    result = data;
  }

  return result;
};

const transformToLocalCase = (data: object): object => {
  let result: any;
  if (is(Array, data)) {
    result = map<object, object[]>(transformToLocalCase)(data);
  } else if (is(Object, data)) {
    const obj: Map = {};
    forEach((key: string) => {
      obj[hasChinese(key) ? key : camelCase(key)] = is(Object, data[key])
        ? transformToLocalCase(data[key])
        : data[key];
    })(keys(data));
    result = obj;
  } else {
    result = data;
  }

  return result;
};

export { hasChinese, transformToSubmittableCase, transformToLocalCase };
