import { Link, useNavigate } from 'react-router-dom';

// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project import
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import FirebaseRegister from 'sections/auth/auth-forms/AuthRegister';
import { useEffect } from 'react';
import { ALLTHEAI } from 'config';
import { DASHBOARD_PAGE } from 'config';

// ================================|| REGISTER ||================================ //

const Register = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    /**
     * Set the Page Titlt
     */
    const authToken = localStorage.getItem('token');
    if (authToken !== null) {
      navigate(DASHBOARD_PAGE);
    }
    document.title = `Register | ${ALLTHEAI}`;
  }, []);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Sign up</Typography>
            <Typography component={Link} to={!isLoggedIn && '/auth/login'} variant="body1" sx={{ textDecoration: 'none' }} color="#753CEF">
              Already have an account?
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <FirebaseRegister />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default Register;
