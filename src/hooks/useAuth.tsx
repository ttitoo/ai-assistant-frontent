import { compose, isNil, not, prop } from 'ramda';
import { createContext, useContext, useMemo, useEffect, } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState } from '../store/reducers/app';
import useSagaDispatch from './useSagaDispatch';
const AuthContext = createContext();

export const AuthProvider = ({ user, children }) => {
  const { dispatch, state } = useSagaDispatch<AppState>('app');
  const {
    user: signInUser,
    loading,
  } = state;
  const navigate = useNavigate();

  const authorized = compose(not, isNil, prop('id'))(signInUser || user);
  
  useEffect(() => {
    if (!loading && !authorized) {
      navigate('/login');
    } else {
      dispatch('initial');
    }
  }, [loading]);

  const value = useMemo(() => ({ user }), [user]);
  return (
    <AuthContext.Provider value={value}>
      {authorized ? children : undefined}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
