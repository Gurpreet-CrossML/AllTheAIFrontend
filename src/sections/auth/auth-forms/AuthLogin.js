import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material-ui
import {
  Button, //eslint-disable-line
  FormHelperText,
  Grid,
  Link,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';
// third party
import { Formik } from 'formik';
// project import
import useAuth from 'hooks/useAuth';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import toast from 'utils/ToastNotistack';
import { error429 } from 'pages/maintenance/ErrorMessage';

const AuthLogin = () => {
  let { login } = useAuth();
  const [capsWarning, setCapsWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  /*handle to show the password on click of the eye button  */
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const onKeyDown = (keyEvent) => {
    if (keyEvent.getModifierState('CapsLock')) {
      setCapsWarning(true);
    } else {
      setCapsWarning(false);
    }
  };
  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validate={false}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values, { setErrors, setSubmitting }) => {
          try {
            await login(values);
            setSubmitting(false);
          } catch (error) {
            setSubmitting(false);
            toast(error.response.data.message, { variant: 'error' });
            if (error?.response?.data?.data) {
              setErrors(error.response.data.data);
            } else if (error.response.status === 429) {
              toast(error429, {
                variant: 'error'
              });
            }
          }
        }}
      >
        {({ errors, handleBlur, handleSubmit, isSubmitting, touched, values, setFieldError, setFieldValue }) => {
          return (
            <>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="email-login">Email Address</InputLabel>
                      <OutlinedInput
                        id="email-login"
                        type="email"
                        value={values?.email}
                        name="email"
                        onBlur={handleBlur}
                        onChange={(event) => {
                          setFieldValue('email', event?.target?.value);
                          setFieldError('email', '');
                        }}
                        autoComplete="off"
                        placeholder="Enter email address"
                        fullWidth
                        error={Boolean(errors?.email)}
                      />
                      {errors?.email?.length > 0 && (
                        <FormHelperText error id="standard-weight-helper-text-email-login">
                          {errors?.email[0]}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="password-login">Password</InputLabel>
                      <OutlinedInput
                        fullWidth
                        color={capsWarning ? 'warning' : 'primary'}
                        error={Boolean(touched?.password && errors?.password)}
                        id="-password-login"
                        type={showPassword ? 'text' : 'password'}
                        value={values?.password}
                        name="password"
                        autoComplete="off"
                        onBlur={(event) => {
                          setCapsWarning(false);
                          handleBlur(event);
                        }}
                        onKeyDown={onKeyDown}
                        onChange={(event) => {
                          setFieldValue('password', event?.target?.value);
                          setFieldError('password', '');
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
                      {capsWarning && (
                        <Typography variant="caption" sx={{ color: 'warning.main' }} id="warning-helper-text-password-login">
                          Caps lock on!
                        </Typography>
                      )}
                      {touched?.password && errors?.password?.length > 0 && (
                        <FormHelperText error id="standard-weight-helper-text-password-login">
                          {errors?.password[0]}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sx={{ mt: -1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Link variant="h6" component={RouterLink} to="/auth/forgot-password" color="#753CEF">
                        Forgot Password?
                      </Link>
                    </Stack>
                  </Grid>
                  {errors?.submit && (
                    <Grid item xs={12}>
                      <FormHelperText error>{errors?.submit}</FormHelperText>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <AnimateButton>
                      <Button disableElevation disabled={isSubmitting === true} type="submit" fullWidth size="large" variant="contained">
                        {isSubmitting === true ? 'Please Wait...' : 'Login'}
                      </Button>
                    </AnimateButton>
                  </Grid>
                </Grid>
              </form>
            </>
          );
        }}
      </Formik>
    </>
  );
};
export default AuthLogin;
