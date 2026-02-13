import { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';

const DashboardAnalytics = Loadable(lazy(() => import('pages/dashboard/analytics')));
const Error404 = Loadable(lazy(() => import('pages/maintenance/404')));

// render - widget
const UserProfile = Loadable(lazy(() => import('pages/apps/profiles/user')));
const UserTabPersonal = Loadable(lazy(() => import('sections/apps/profiles/user/TabPersonal')));
const UserTabPayment = Loadable(lazy(() => import('sections/apps/profiles/user/TabPayment')));
const UserTabPassword = Loadable(lazy(() => import('sections/apps/profiles/user/TabPassword')));
const TransactionHistory = Loadable(lazy(() => import('sections/apps/transactions/TransactionTable')));

//render-application
const AppCalendar = Loadable(lazy(() => import('pages/apps/calendar')));

// pages routing
const AuthLogin = Loadable(lazy(() => import('pages/auth/login')));
const AuthRegister = Loadable(lazy(() => import('pages/auth/register')));
const AuthForgotPassword = Loadable(lazy(() => import('pages/auth/forgot-password')));
const AuthResetPassword = Loadable(lazy(() => import('pages/auth/reset-password')));
const BillingInformation = Loadable(lazy(() => import('pages/pricing')));
const CodeVerification = Loadable(lazy(() => import('pages/auth/code-verification')));
const Dashboard = Loadable(lazy(() => import('pages/dashboard')));

const ContentGeneration = Loadable(lazy(() => import('pages/apps/contents/content-generation')));
const ContentHistory = Loadable(lazy(() => import('pages/apps/contents/content-history')));
const ContentEvents = Loadable(lazy(() => import('pages/apps/contents/content-events-history')));
const ImageGeneration = Loadable(lazy(() => import('pages/apps/images/ImageGeneration')));
const ImageHistory = Loadable(lazy(() => import('pages/apps/images/ImageHistory')));
const ImageTemplate = Loadable(lazy(() => import('pages/apps/images/ImageTemplate')));
const Personna = Loadable(lazy(() => import('pages/apps/personnas/index')));
const AddPersonna = Loadable(lazy(() => import('pages/apps/personnas/addPersona')));
const SocialMedia = Loadable(lazy(() => import('pages/apps/social-media/SocialMedia')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: '/',
          element: <Dashboard />
        },

        {
          path: 'dashboard',
          element: <Dashboard />
        },
        {
          path: 'templates',
          element: <DashboardAnalytics />
        },
        {
          path: 'content-generation/template/:id',
          element: <ContentGeneration />
        },
        {
          path: 'content-history',
          element: <ContentHistory />
        },
        {
          path: 'content-events/:id',
          element: <ContentEvents />
        },
        {
          path: 'persona-profiles',
          element: <Personna />
        },
        {
          path: 'add-persona',
          element: <AddPersonna />
        },
        {
          path: 'edit-persona/:id',
          element: <AddPersonna />
        },
        {
          path: 'generate-image/template/:id',
          element: <ImageGeneration />
        },
        {
          path: 'image_detail/:id',
          element: <ImageGeneration />
        },
        {
          path: 'image-template',
          element: <ImageTemplate />
        },
        {
          path: 'images-history',
          element: <ImageHistory />
        },
        {
          path: 'social-media',
          element: <SocialMedia />
        },
        {
          path: 'scheduler',
          element: <AppCalendar />
        },
        {
          path: 'subscribe-plan',
          element: <BillingInformation />
        },
        {
          path: 'transaction-history',
          element: <TransactionHistory />
        },

        {
          path: 'profile',
          element: <UserProfile />,
          children: [
            {
              path: 'personal-information',
              element: <UserTabPersonal />
            },
            {
              path: 'billing-information',
              element: <UserTabPayment />
            },
            {
              path: 'change-password',
              element: <UserTabPassword />
            }
          ]
        }
      ]
    },
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: <AuthLogin />
        },
        {
          path: 'register',
          element: <AuthRegister />
        },
        {
          path: 'forgot-password',
          element: <AuthForgotPassword />
        },
        {
          path: 'reset-password',
          element: <AuthResetPassword />
        },
        {
          path: 'code-verification',
          element: <CodeVerification />
        }
      ]
    },
    {
      path: '*',
      element: <Error404 /> // Replace `NotFound` with your 404 page component
    }
  ]
};

export default MainRoutes;
