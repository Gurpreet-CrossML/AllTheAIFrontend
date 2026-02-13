import PropTypes from 'prop-types';

// material-ui
import { Box, Grid } from '@mui/material';

// import Logo from 'components/logo';
import AuthCard from './AuthCard';

// assets
import AuthBackground from 'assets/images/auth/AuthBackground';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const AuthWrapper = ({ children }) => (
  <Box sx={{ minHeight: '100vh' }}>
    <AuthBackground />
    <Grid
      container
      direction="column"
      justifyContent="flex-end"
      sx={{
        minHeight: '75vh'
      }}
    >
      <Grid item xs={12} sx={{ ml: 3, mt: 3 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <img
            src="/assets/images/logoiconalltheai.png"
            alt="logo icon"
            width={32}
            height={32}
          />
          <Box
            component="span"
            sx={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}
          >
            content
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #7B3FE4, #B983FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              IQ
            </Box>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Grid
          item
          xs={12}
          container
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: { xs: 'calc(100vh - 210px)', sm: 'calc(100vh - 134px)', md: 'calc(100vh - 112px)' } }}
        >
          <Grid item>
            <AuthCard>{children}</AuthCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Box>
);

AuthWrapper.propTypes = {
  children: PropTypes.node
};

export default AuthWrapper;
