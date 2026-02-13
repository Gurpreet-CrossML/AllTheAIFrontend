// import { lazy } from 'react';
import { useRoutes } from 'react-router-dom';
import Error404 from 'pages/maintenance/404';

// project import

import MainRoutes from './MainRoutes';
import Login from 'pages/auth/login.js';

export default function ThemeRoutes() {
  return useRoutes([
    {
      path: 'auth/login',
      element: <Login layout="login" />
    },
    MainRoutes,
    {
      path: '*',
      element: <Error404 /> // Replace `NotFound` with your 404 page component
    }
  ]);
}
