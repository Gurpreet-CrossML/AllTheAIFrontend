import { Link, useNavigate } from 'react-router-dom';

// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';
import { useEffect } from 'react';
import { ALLTHEAI } from 'config';
import { DASHBOARD_PAGE } from 'config'; //eslint-disable-line

// ================================|| LOGIN ||================================ //
const Login = () => {
  const navigate = useNavigate(); //eslint-disable-line
  /**
   * Calls after every render
   */
  useEffect(() => {
    document.title = `Login | ${ALLTHEAI}`;
  }, []);

  const authToken = localStorage.getItem('token');
  /**
   * Calls when authToken is present
   */
  useEffect(() => {
    if (authToken !== null) {
      navigate(DASHBOARD_PAGE);
    }
  }, [authToken]);
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Login</Typography>
            <Typography component={Link} to={'/auth/register'} variant="body1" sx={{ textDecoration: 'none' }} color="#753CEF">
              Don&apos;t have an account?
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default Login;
