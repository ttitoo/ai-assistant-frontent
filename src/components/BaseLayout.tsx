import { Suspense, useOutlet } from 'react';
import { Outlet } from "react-router-dom";

export default () => (
  <Suspense fallback="...">
    <Outlet />
  </Suspense>
);
