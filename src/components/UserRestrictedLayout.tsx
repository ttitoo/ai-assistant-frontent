import { Suspense } from 'react';
import Navbar from './Navbar';
import { useLoaderData, Outlet, Await } from 'react-router-dom';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import { AuthProvider } from '../hooks/useAuth';
import { path } from 'ramda';
import { useSelector } from 'react-redux';
import Loadable from './Loadable';

const UserRestrictedLayout = () => {
  const initialing = useSelector(path(['app', 'initialing']));

  const { profilePromise } = useLoaderData();

  return (
    <Suspense fallback={<LinearProgress />}>
      <Await
        resolve={profilePromise}
        errorElement={<Alert severity="error">Something went wrong!</Alert>}
        children={(user) => (
          <AuthProvider user={user}>
            <Navbar user={user} />
            
            <Loadable loading={initialing}>
              <Outlet />
            </Loadable>
          </AuthProvider>
        )}
      />
    </Suspense>
  );
};

export default UserRestrictedLayout;
