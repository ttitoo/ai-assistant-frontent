import { compose, prop, always, mapObjIndexed } from 'ramda';

export const toggle = (state, action) => {
  const { key, value } = action.payload;
  state[key] = value;
};

export const cacheSuccess = (state, action) => compose(always(undefined), mapObjIndexed((val: any, key: string) => state[key] = val), prop('payload'))(action);
