import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import reducers from './reducers';
import sagas from './sagas';
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import { compose, forEach, values } from 'ramda';

const sagaMiddleware = createSagaMiddleware();

// const persistConfig = {
//   key: 'root',
//   storage,
// };

const middlewares = [sagaMiddleware];
import.meta.env.PROD || middlewares.push(logger);

export const store = (
  configureStore({
    reducer: combineReducers(reducers),
    // reducer: persistReducer(persistConfig, combineReducers(reducers)),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(...middlewares),
  })
);

sagaMiddleware.run(sagas)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
