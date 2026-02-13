import { useState } from 'react';

// material-ui
import { Button, FormHelperText, Grid, InputAdornment, InputLabel, OutlinedInput, Stack } from '@mui/material';

// third party
import { Formik } from 'formik';
import toast from 'utils/ToastNotistack';

// project import
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import useAuth from 'hooks/useAuth';

/**
 * @method [AuthRegister] functional component
 */
const AuthRegister = () => {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  /**
   * @method handleClickShowPassword to show the password
   */
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Formik
        //Set inital form values
        initialValues={{
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          confirm_password: '',
          submit: null
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validate={false}
        onSubmit={async (values, { setErrors }) => {
          try {
            await register(values);
          } catch (err) {
            toast(err.response.data.message, { variant: 'error' });
            if (err.response.data.data) {
              setErrors(err.response.data.data);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleSubmit, touched, values, isSubmitting, setFieldError, setFieldValue }) => {
          return (
            <form noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="firstname-signup">
                      First Name<span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <OutlinedInput
                      id="firstname-login"
                      value={values.first_name}
                      name="first_name"
                      onBlur={handleBlur}
                      onChange={(event) => {
                        setFieldValue('first_name', event.target.value);
                        setFieldError('first_name', '');
                      }}
                      fullWidth
                      error={Boolean(errors.first_name)}
                    />
                    {errors.first_name && (
                      <FormHelperText error id="helper-text-firstname-signup">
                        {errors.first_name[0]}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="lastname-signup">
                      Last Name<span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(errors.last_name)}
                      id="lastname-signup"
                      type="last_name"
                      value={values.last_name}
                      name="last_name"
                      onBlur={handleBlur}
                      onChange={(event) => {
                        setFieldValue('last_name', event.target.value);
                        setFieldError('last_name', '');
                      }}
                    />
                    {errors.last_name && (
                      <FormHelperText error id="helper-text-lastname-signup">
                        {errors.last_name[0]}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="email-signup">
                      Email Address<span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.email && errors.email)}
                      id="email-login"
                      type="email"
                      value={values.email}
                      name="email"
                      autoComplete="off"
                      onBlur={handleBlur}
                      onChange={(event) => {
                        setFieldValue('email', event.target.value);
                        setFieldError('email', '');
                      }}
                    />
                    {touched.email && errors.email && (
                      <FormHelperText error id="helper-text-email-signup">
                        {errors.email}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="password-signup">
                      Password<span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.password && errors.password)}
                      id="password-signup"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      name="password"
                      onBlur={handleBlur}
                      onChange={(event) => {
                        setFieldValue('password', event.target.value);
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
                    />
                    {touched.password && errors.password && (
                      <FormHelperText error id="helper-text-password-signup">
                        {errors.password}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="confirm-password-signup">
                      Confirm Password<span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(errors.confirm_password)}
                      id="confirm-password-signup"
                      type={showPassword ? 'text' : 'password'}
                      value={values.confirm_password}
                      name="confirm_password"
                      onBlur={handleBlur}
                      onChange={(event) => {
                        setFieldValue('confirm_password', event.target.value);
                        setFieldError('confirm_password', '');
                      }}
                      inputProps={{}}
                    />
                    {errors.confirm_password && (
                      <FormHelperText error id="helper-text-confirm-password-signup">
                        {errors.confirm_password}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>
                {errors.submit && (
                  <Grid item xs={12}>
                    <FormHelperText error>{errors.submit}</FormHelperText>
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
                      {isSubmitting === true ? 'Please Wait...' : 'Create Account'}
                    </Button>
                  </AnimateButton>
                </Grid>
              </Grid>
            </form>
          );
        }}
      </Formik>
    </>
  );
};

export default AuthRegister;
