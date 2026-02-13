//  manage component state and side effects
import { useState, useEffect } from 'react';
// React Router
import { useNavigate } from 'react-router';
import { LOGOUT } from 'store/reducers/actions';

// material-ui
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { isNumber, isLowercaseChar, isUppercaseChar, isSpecialChar, minLength } from 'utils/password-validation';

// third party
import { Formik } from 'formik';

// assets
import { CheckOutlined, EyeOutlined, EyeInvisibleOutlined, LineOutlined } from '@ant-design/icons';
import toast from 'utils/ToastNotistack';
import { displayDeleteIcon, updateDisableUpload } from 'store/reducers/image';
import { useDispatch } from 'react-redux';
import useAuth from 'hooks/useAuth';
import { changePassword, userLogout } from '_api/account';
import { error429 } from 'pages/maintenance/ErrorMessage';

const TabPassword = () => {
  const navigate = useNavigate(); // eslint-disable-line
  const dispatch = useDispatch();
  const { setSession } = useAuth();

  /**
   * State variables
   */
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const[rateLimit, setRateLimit]= useState(false); //eslint-disable-line

  useEffect(() => {
    document.title = 'Change Password | AllTheAi';
    const authToken = localStorage.getItem('token');

    if (authToken == null) {
      navigate('/auth/login');
    }
    dispatch(displayDeleteIcon(false));
    dispatch(updateDisableUpload(false));
  }, []);

/**
 * @method [getPasswordChange] used to fetch data from api
 */
const getPasswordChange = async (values, setErrors) => {
  try {
    const requestData = {
      previous_password: values.previous_password,
      proposed_password: values.proposed_password,
      confirm_password: values.confirm_password
    };

    const response = await changePassword(requestData);

    if (response.data.status === 'success') {
      toast(response.data.message, { variant: 'success' });
    }
    logout();
  } catch (error) {
    if (error.response) {
      setErrors(error.response.data.data)
      if (error.response.status === 401) {
        localStorage.clear();
        navigate('/auth/login'); 
      }
      else if (error.response.status === 429) { 
        setRateLimit(true);
        toast(error429, {
          variant: 'error'
        });
      }
      else {
        toast(error.response.data.message, {
          variant: 'error'
        });
      }
    }
  }
};

  /**
   * @method [logout] when user clicks on the icon and remove token from the localStorage
   */
  const logout = () => {
 userLogout().then((response) => {
      if (response.data.status === 'success') {
        setSession(null);
        dispatch({
          type: LOGOUT,
          payload: {
            isLoggedIn: false
          }
        });
        localStorage.clear();
      }
      navigate('/auth/login');
    })
  }



  /**
   * @method [handleClickShowOldPassword]  Toggle visibility of old password
   */
  const handleClickShowOldPassword = () => {
    setShowOldPassword(!showOldPassword);
  };
  /**
   * @method [handleClickShowNewPassword]  Toggle visibility of new password
   */
  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };
  /**
   * @method [handleMouseDownPassword] Prevent mouse down event on password field
   */
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
 
    <MainCard title="Change Password">
      <Formik
        // Set the initial values for the form fields
        initialValues={{
          previous_password: '',
          proposed_password: '',
          confirm_password: '',
          submit: null
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validate={false}
        /**
         * @method [onSubmit] handle the form submission
         */
        onSubmit={async (values, { setErrors, setSubmitting }) => {
          try {
            await getPasswordChange(values, setErrors);
          } catch (error) {
            toast(err.response.data.message, { variant: 'error' });
            setErrors(err.response.data);
            setSubmitting(false);
            if (error.response) {
              if (error.response.status === 401) {
                localStorage.clear();
                navigate('/auth/login'); 
              } else {
                toast(error.response.data.message, {
                  variant: 'error'
                });
              }
            }
          }
        }}
      >
        {({ handleBlur, handleSubmit, isSubmitting, values, setFieldValue, setFieldError, errors }) => {
          //eslint-disable-line
          return (
            /**
             * @method [form] Render the form with the formik props passed as arguments to the render function
             */
            <form noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item container spacing={3} xs={12} sm={6}>
                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="password-old">
                        Old Password<span style={{ color: 'red' }}>*</span>
                      </InputLabel>
                      <OutlinedInput
                        id="password-old"
                        type={showOldPassword ? 'text' : 'password'}
                        value={values.previous_password}
                        name="previous_password"
                        onBlur={handleBlur}
                        onChange={(event) => {
                          setFieldValue('previous_password', event.target.value);
                          setFieldError('previous_password', '');
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            {/* Add a button to toggle password visibility */}
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowOldPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              size="large"
                              color="secondary"
                            >
                              {showOldPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      {errors?.previous_password && (
                        <FormHelperText error id="password-old-helper">
                          {errors?.previous_password[0]}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="password-password">
                        New Password<span style={{ color: 'red' }}>*</span>
                      </InputLabel>
                      <OutlinedInput
                        id="password-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={values.proposed_password}
                        name="proposed_password"
                        onBlur={handleBlur}
                        onChange={(event) => {
                          setFieldValue('proposed_password', event.target.value);
                          setFieldError('proposed_password', '');
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowNewPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              size="large"
                              color="secondary"
                            >
                              {showNewPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </IconButton>
                          </InputAdornment>
                        }
                        inputProps={{}}
                      />
                      {errors?.proposed_password && (
                        <FormHelperText error id="password-password-helper">
                          {errors?.proposed_password[0]}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="password-confirm">
                        Confirm Password<span style={{ color: 'red' }}>*</span>
                      </InputLabel>
                      <OutlinedInput
                        id="password-confirm"
                        type={showNewPassword ? 'text' : 'password'}
                        value={values.confirm_password}
                        name="confirm_password"
                        onBlur={handleBlur}
                        onChange={(event) => {
                          setFieldValue('confirm_password', event.target.value);
                          setFieldError('confirm_password', '');
                        }}
                        inputProps={{}}
                      />
                      {errors?.confirm_password && (
                        <FormHelperText error id="password-confirm-helper">
                          {errors?.confirm_password[0]}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: { xs: 0, sm: 2, md: 4, lg: 5 } }}>
                    <Typography variant="h5">New password must contain:</Typography>
                    <List sx={{ p: 0, mt: 1 }}>
                      <ListItem divider>
                        <ListItemIcon sx={{ color: minLength(values.proposed_password) ? 'success.main' : 'inherit' }}>
                          {minLength(values.proposed_password) ? <CheckOutlined /> : <LineOutlined />}
                        </ListItemIcon>
                        <ListItemText primary="At least 8 characters" />
                      </ListItem>
                      <ListItem divider>
                        <ListItemIcon sx={{ color: isLowercaseChar(values.proposed_password) ? 'success.main' : 'inherit' }}>
                          {isLowercaseChar(values.proposed_password) ? <CheckOutlined /> : <LineOutlined />}
                        </ListItemIcon>
                        <ListItemText primary="At least 1 lower letter (a-z)" />
                      </ListItem>
                      <ListItem divider>
                        <ListItemIcon sx={{ color: isUppercaseChar(values.proposed_password) ? 'success.main' : 'inherit' }}>
                          {isUppercaseChar(values.proposed_password) ? <CheckOutlined /> : <LineOutlined />}
                        </ListItemIcon>
                        <ListItemText primary="At least 1 uppercase letter (A-Z)" />
                      </ListItem>
                      <ListItem divider>
                        <ListItemIcon sx={{ color: isNumber(values.proposed_password) ? 'success.main' : 'inherit' }}>
                          {isNumber(values.proposed_password) ? <CheckOutlined /> : <LineOutlined />}
                        </ListItemIcon>
                        <ListItemText primary="At least 1 number (0-9)" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ color: isSpecialChar(values.proposed_password) ? 'success.main' : 'inherit' }}>
                          {isSpecialChar(values.proposed_password) ? <CheckOutlined /> : <LineOutlined />}
                        </ListItemIcon>
                        <ListItemText primary="At least 1 special characters" />
                      </ListItem>
                    </List>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
                    <Button disabled={isSubmitting} type="submit" variant="contained">
                      Update Password
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          );
        }}
      </Formik>
    </MainCard>
     
  );
};

export default TabPassword;
