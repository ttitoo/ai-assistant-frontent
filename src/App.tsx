import { Dispatch, Suspense } from 'react';
import { ToastContainer, } from 'react-toastify';
import { Box, Paper, CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  defer,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements
} from 'react-router-dom';
import { routes as appRoutes } from './routes';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import BaseLayout from './components/BaseLayout';
import UserRestrictedLayout from './components/UserRestrictedLayout';
import api from './api/app';
import { useDispatch } from 'react-redux';
import { path } from 'ramda';
import 'react-toastify/dist/ReactToastify.css';
import { ReduxSagaDispatchPayload } from './interfaces';

export function App() {
  // define theme
  const theme = createTheme({
    palette: {
      primary: {
        light: '#63b8ff',
        main: '#0989e3',
        dark: '#005db0',
        contrastText: '#000'
      },
      secondary: {
        main: '#4db6ac',
        light: '#82e9de',
        dark: '#00867d',
        contrastText: '#000'
      }
    }
  });

  const dispatch: Dispatch<ReduxSagaDispatchPayload> = useDispatch();
  const profilePromise = new Promise((resolve, _reject) => {
    if (import.meta.env.VITE_SKIP_AUTH === 'true') {
      resolve({ id: 1, name: 'dev' });
    } else {
      api.profile().then((resp) => {
        let user = {};
        if (resp.ok) {
          user = path(['data', 'user'], resp);
          dispatch({type: 'app/profileSuccess', payload: { user, }});
        } else {
          dispatch({type: 'app/profileFailure' });
        }
        resolve(user);
      });
    }
  });

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<BaseLayout />}>
          <Route path="/login" element={<LandingPage />}></Route>
        </Route>

        <Route>
          <Route
            path="/"
            element={<UserRestrictedLayout />}
            loader={() => defer({ profilePromise: profilePromise })}
          >
            {appRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Route>
        </Route>
        <Route path="*" element={<NotFound />}></Route>
      </>
    )
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* <GlobalStyles /> */}
      <Box height="100vh" display="flex" flexDirection="column">
        <RouterProvider router={router} />
      </Box>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ThemeProvider>
  );
}

export function WrappedApp() {
  return <App />;
}
