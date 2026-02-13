import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer, useState } from 'react';

// third-party
import { Auth0Client } from '@auth0/auth0-spa-js';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/reducers/actions';
import authReducer from 'store/reducers/auth';
import axios from 'axios';
// project import
import Loader from 'components/Loaders/LinearLoader';
import { useLocation, useNavigate } from 'react-router';
import toast from 'utils/ToastNotistack';
import { BASE_URL } from 'config';

// constant
let auth0Client;

const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  isLoading: false
};

const Auth0Context = createContext(null);

export const Auth0Provider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();
  const [rateLimit, setRateLimit] = useState(false);//eslint-disable-line

  useEffect(() => {
    const init = async () => {
      try {
        auth0Client = new Auth0Client({
          redirect_uri: window.location.origin,
          client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
          domain: process.env.REACT_APP_AUTH0_DOMAIN
        });

        await auth0Client.checkSession();
        /*Check the token and stop from automatically gets logout */
        let isLoggedIn;
        if (localStorage.getItem('token') !== null) {
          isLoggedIn = true;
        }
        if (isLoggedIn) {
          const user = await auth0Client.getUser();
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user: {
                id: user?.sub,
                email: user?.email
              }
            }
          });
        } else {
          if (localStorage.getItem('token') !== undefined) {
            dispatch({
              type: LOGOUT
            });
          }
        }
      } catch (err) {
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  /**
   * @method [login] use to authenticate the logi
   * @param {Object} options
   */
  const login = async (options) => {
    const params = {
      email: options?.email,
      password: options?.password
    };

    await axios.post(`${BASE_URL}api/auth/login/`, params).then((response) => {
      setSession(response.data.data.user.access_token);
      setTimeout(() => {
        const isLoggedIn = auth0Client.isAuthenticated();
        setSession(response.data.data.user.access_token);
        localStorage.setItem('user_info', JSON.stringify(response.data.data.user));
        localStorage.setItem('billing_address', JSON.stringify(response.data.data.billing_address));
        localStorage.setItem('plan_details', JSON.stringify(response.data.data.plan_details));
        localStorage.setItem('subscription_info', JSON.stringify(response.data.data.subscription_info));

        /**
         * Success Message
         */
        toast(response.data.message, { variant: 'success' });
        if (isLoggedIn) {
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true
            }
          });
          navigate('/dashboard');
        }
      }, 500);
    });
  };

  const setSession = (serviceToken) => {
    if (serviceToken) {
      localStorage.setItem('token', serviceToken);
      axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common.Authorization;
    }
  };

  /**
   * @method [register] use to register a new user
   * @param {Object} options
   */
  const register = async (options) => {
    const params = {};

    if (options?.email?.length > 0) {
      params.email = options.email;
    }

    if (options?.first_name?.length > 0) {
      params.first_name = options.first_name;
    }

    if (options?.last_name?.length > 0) {
      params.last_name = options.last_name;
    }

    if (options?.password?.length > 0) {
      params.password = options.password;
    }

    if (options?.confirm_password?.length > 0) {
      params.confirm_password = options.confirm_password;
    }

    await axios.post(`${BASE_URL}api/auth/register/`, params).then((response) => {
      /**
       * Success Message Response
       */
      toast(response.data.message, { variant: 'success' });
      navigate('/auth/login');
    });
  };

  /**
   * @method [logout] when user clicks on the icon and remove token from the localStorage
   */
  const logout = () => {
    const authToken = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    };
    axios.post(`${BASE_URL}api/auth/logout/`, {}, { headers: headers }).then((response) => {
      if (response.data.status === 'success') {
        toast(response.data.message, { variant: 'success' });
        setSession(null);
        dispatch({
          type: LOGOUT,
          payload: {
            isLoggedIn: false
          }
        });

        localStorage.clear();
        navigate('/auth/login');
      }
    });
  };

  /**
   *
   * @param {forgotPassword} use to send email for the forget password
   */
  const forgotPassword = async (email) => {
    const params = {};

    if (email.length > 0) {
      params.email = email;
    }

    await axios.post(`${BASE_URL}api/auth/forgot_password/`, params).then((response) => {
      try {
        toast(response.data.message, { variant: 'success' });
        navigate('/auth/code-verification', { state: { email: email } });
      } catch (error) {
        toast(error.response.data.message, { variant: 'error' });
      }
    });
  };

  /**
   * @method [verifyForgetPassword] use to verify the password
   * @param {Object} options
   * @param {String} otp
   */
  const verifyForgetPassword = async (options, otp) => {
    const params = {};
    params.email = location?.state?.email;

    if (otp?.length > 0) {
      params.confirmation_code = otp;
    }
    if (options?.changed_password?.length > 0) {
      params.changed_password = options.changed_password;
    }

    if (options?.confirm_password?.length > 0) {
      params.confirm_password = options.confirm_password;
    }
    await axios.post(`${BASE_URL}api/auth/verify_forgot_password/`, params).then((response) => {
      toast(response.data.message, { variant: 'success' });
      navigate('/auth/login');
    });
  };

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <Auth0Context.Provider value={{ ...state, login, setSession, logout, forgotPassword, verifyForgetPassword, register }}>
      {children}
    </Auth0Context.Provider>
  );
};

Auth0Provider.propTypes = {
  children: PropTypes.node
};

export default Auth0Context;
