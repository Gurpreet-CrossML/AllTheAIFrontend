// material-ui
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import {
  FormHelperText,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import AnimateButton from 'components/@extended/AnimateButton';
import { DASHBOARD_PAGE } from 'config';
import { ALLTHEAI } from 'config';
import { Formik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import OtpInput from 'react18-input-otp';
import AuthWrapper from 'sections/auth/AuthWrapper';
import toast from 'utils/ToastNotistack';

// ===|| FORGOT PASSWORD ||=== //

const CodeVerification = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const borderColor = theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[300];
  const { verifyForgetPassword } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState();
  const location = useLocation();

  useEffect(() => {
    if (location.state === null && location.state?.email === undefined) {
      navigate('/auth/forgot-password');
    }
  }, [location, navigate]);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken !== null) {
      navigate(DASHBOARD_PAGE);
    }
    document.title = `Verify Code | ${ALLTHEAI}`;
  }, [navigate]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Reset Password</Typography>
            <Typography component={Link} to={'/auth/login'} variant="body1" sx={{ textDecoration: 'none' }} color="#753CEF">
              Back to Login
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Formik
            initialValues={{
              changed_password: '',
              confirm_password: '',
              submit: null
            }}
            validateOnChange={false}
            validateOnBlur={false}
            validate={false}
            onSubmit={async (values, { setErrors }) => {
              try {
                await verifyForgetPassword(values, otp);
              } catch (err) {
                if (err?.response?.data?.message) {
                  toast(err?.response?.data?.message, { variant: 'error' });
                }
                if (err.response.data.data) {
                  setErrors(err.response.data.data);
                }
              }
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, values, setFieldError, setFieldValue }) => {
              return (
                <form noValidate onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <OtpInput
                        value={otp}
                        onChange={(otp) => {
                          setOtp(otp);
                          setFieldError('confirmation_code', '');
                        }}
                        numInputs={6}
                        containerStyle={{ justifyContent: 'space-between' }}
                        inputStyle={{
                          width: '100%',
                          margin: '8px',
                          padding: '10px',
                          border: `1px solid ${borderColor}`,
                          borderRadius: 4,
                          ':hover': {
                            borderColor: theme.palette.primary.main
                          }
                        }}
                        focusStyle={{
                          outline: 'none',
                          boxShadow: theme.customShadows.primary,
                          border: `1px solid ${theme.palette.primary.main}`
                        }}
                      />
                      {errors?.confirmation_code?.length > 0 && <FormHelperText error>{errors?.confirmation_code[0]}</FormHelperText>}
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="password-reset">Password</InputLabel>
                        <OutlinedInput
                          fullWidth
                          id="password-reset"
                          type={showPassword ? 'text' : 'password'}
                          value={values.changed_password}
                          name="changed_password"
                          autoComplete="off"
                          onBlur={handleBlur}
                          onChange={(e) => {
                            handleChange(e);
                            setFieldError('changed_password', '');
                          }}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                color="secondary"
                              >
                                {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                              </IconButton>
                            </InputAdornment>
                          }
                          placeholder="Enter password"
                        />
                        {errors?.changed_password?.length > 0 && (
                          <FormHelperText error id="helper-text-password-reset">
                            {errors.changed_password}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="confirm-password-reset">Confirm Password</InputLabel>
                        <OutlinedInput
                          fullWidth
                          id="confirm-password-reset"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="off"
                          value={values.confirm_password}
                          name="confirm_password"
                          onBlur={handleBlur}
                          onChange={(event) => {
                            setFieldValue('confirm_password', event?.target?.value);
                            setFieldError('confirm_password', '');
                          }}
                          placeholder="Enter confirm password"
                        />
                        {errors?.confirm_password?.length > 0 && (
                          <FormHelperText error id="helper-text-confirm-password-reset">
                            {errors.confirm_password}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>

                    {errors?.submit && (
                      <Grid item xs={12}>
                        <FormHelperText error>{errors?.submit}</FormHelperText>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <AnimateButton>
                        <Button
                          disableElevation
                          disabled={isSubmitting}
                          fullWidth
                          size="large"
                          type="submit"
                          variant="contained"
                          color="primary"
                        >
                          Reset Password
                        </Button>
                      </AnimateButton>
                    </Grid>
                  </Grid>
                </form>
              );
            }}
          </Formik>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default CodeVerification;
