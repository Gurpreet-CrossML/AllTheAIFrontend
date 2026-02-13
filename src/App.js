import { useEffect, useState } from 'react';

// project import
import Routes from 'routes';
import ThemeCustomization from 'themes';

import Loader from 'components/Loaders/LinearLoader';
import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

// auth provider
import { Auth0Provider as AuthProvider } from 'contexts/Auth0Context';
import { useLocation, useNavigate } from 'react-router';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const App = () => {
  const [loading, setLoading] = useState(true); //eslint-disable-line  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Simulate some asynchronous check for the token
    // Replace the setTimeout with your actual token check logic
    setTimeout(() => {
      setLoading(false); // Set loading to false after the token check is complete
    }, 1000); // 1000ms delay to simulate the token check

    // If the token is present, redirect to '/dashboard/default' only if the current path is not a dashboard route
    // If the token is not present, redirect to '/auth/login' only if the current path is not an authentication route
    const access_token = localStorage.getItem('token');// Replace 'your_token' with the actual token or use your token retrieval logic
    const isAuthRoute = location.pathname.startsWith('/auth');
    if (!access_token && !isAuthRoute ) {
      navigate('/auth/login', { replace: true });
    } 
  }, [location.pathname, navigate]);

  if (loading) return <Loader />;
  return (
    <ThemeCustomization>
      <RTLLayout>
        <Locales>
          <ScrollTop>
            <AuthProvider>
              <>
                <Notistack>
                  <Routes />
                  <Snackbar />
                </Notistack>
              </>
            </AuthProvider>
          </ScrollTop>
        </Locales>
      </RTLLayout>
    </ThemeCustomization>
  );
};

export default App;
