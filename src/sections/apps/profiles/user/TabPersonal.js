import { Backdrop, Box, Button, CircularProgress, FormHelperText, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import toast from 'utils/ToastNotistack';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { ALLTHEAI } from 'config';
import MainCard from 'components/MainCard';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { displayImageResponse, displayDeleteIcon, updateDisableUpload } from 'store/reducers/image';
import { getPersonalInfo, setPersonalInfo } from '_api/account';
import { error429 } from 'pages/maintenance/ErrorMessage';

function useInputRef() {
  return useOutletContext();
}

const TabPersonal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useInputRef();
  const profilePicture = useSelector((state) => state.slice); // get image via redux
  /* Initialisations */
  const [formFields, setFormFields] = useState({
    first_name: '',
    last_name: '',
    email: '',
    dob: ''
  });
  const [isWaiting, setIsWaiting] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [rateLimit, setRateLimit] = useState(false);

  /**
   * Calls after every render
   */
  useEffect(() => {
    document.title = `Personal Information | ${ALLTHEAI}`;
    getProfileDetails();
    dispatch(updateDisableUpload(true));
    dispatch(displayDeleteIcon(true));
  }, []);

/**
 * @method [getProfileDetails] used to fetch data from the API
 */
const getProfileDetails = async () => {
  try {
    setIsWaiting(true);

    /*Promise to return response for the personal information details */
    const response = await getPersonalInfo();

    setIsWaiting(false);
    setFormFields({
      first_name: response.data.data.first_name,
      last_name: response.data.data.last_name,
      email: response.data.data.email
    });
    setDateOfBirth(response.data.data.dob);

    dispatch(displayImageResponse(response.data.data.profile_pic));
  } catch (error) {
    setIsWaiting(false);
    if (error.response) {
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
        else if(error.response.status == '400'){
          toast(error.response.data.data.profile_pic[0], {variant: 'error'},)
     }
  }
};

/**
 * @method [profileUpdate] used to update the data
 */
const profileUpdate = async (options) => {
  const formData = new FormData();
  formData.append('email', options.email);
  formData.append('first_name', options.first_name);
  formData.append('last_name', options.last_name);
  formData.append('dob', dateOfBirth ? moment(dateOfBirth).format('YYYY-MM-DD') : '');
  if (profilePicture.image !== null) {
    formData.append('profile_pic', profilePicture.image);
  }

  /*Promise for update the profile details */
  await setPersonalInfo(formData).then((response) => {
    localStorage.setItem('user_info', JSON.stringify(response.data.data));
    /**
     * Success Message Response
     */
    toast(response.data.message, {
      variant: 'success',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
        variant: 'success'
      }
    });
    // window.location.reload();
  });
};


  return (
    !rateLimit && (<> 
      <MainCard content={false} title="Personal Information" sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
      <Formik
        initialValues={{
          first_name: formFields.first_name || '',
          last_name: formFields.last_name || '',
          email: formFields.email || ''
        }}
        enableReinitialize={true}
        validate={false}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            if (!dateOfBirth) {
              // Set an error message for the Date of Birth field
              setErrors({ dob: 'Date of Birth is required' });
              return;
            }

            /**
             * @method [profileUpdate] call the  function with form values
             */
            await profileUpdate(values);
          } catch (err) {
            setErrors(err.response.data.data);
            setStatus({ success: false });
            setSubmitting(false);

            if (err.response) {
              if (err.response.status === 401) {
                localStorage.clear();
                navigate('/auth/login'); 
              } else {
                toast(err.response.data.message, {
                  variant: 'error'
                });
              }
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, setFieldValue, setFieldError, values, isSubmitting }) => {
          return (
            <form noValidate onSubmit={handleSubmit}>
                 
                    <Box sx={{ p: 2.5 }}>
                <Grid container spacing={3}>
                  <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isWaiting === true}>
                    <CircularProgress color="inherit" />
                  </Backdrop>
              
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-first-name">
                        First Name<span style={{ color: 'red' }}>*</span>
                      </InputLabel>
                      <TextField
                        fullWidth
                        id="personal-first-name"
                        value={values.first_name}
                        name="first_name"
                        onBlur={handleBlur}
                        onChange={(event) => {
                          setFieldValue('first_name', event.target.value);
                          setFieldError('first_name', '');
                        }}
                        inputRef={inputRef}
                        variant="outlined"
                      />
                      {errors?.first_name?.length > 0 && (
                        <FormHelperText error id="personal-first-name-helper">
                          {errors.first_name[0]}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-last-name">
                        Last Name<span style={{ color: 'red' }}>*</span>
                      </InputLabel>
                      <TextField
                        fullWidth
                        id="personal-last-name"
                        value={values.last_name}
                        name="last_name"
                        onBlur={handleBlur}
                        onChange={(event) => {
                          setFieldValue('last_name', event.target.value);
                          setFieldError('last_name', '');
                        }}
                        inputRef={inputRef}
                        variant="outlined"
                      />
                      {errors?.last_name?.length > 0 && (
                        <FormHelperText error id="personal-last-name-helper">
                          {errors?.last_name[0]}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.55}>
                      <InputLabel htmlFor="personal-email">
                        Email Address<span style={{ color: 'red' }}>*</span>
                      </InputLabel>
                      <TextField
                        type="email"
                        fullWidth
                        value={values.email}
                        disabled
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        id="personal-email"
                        inputRef={inputRef}
                        variant="outlined"
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1.25}>
                      <InputLabel htmlFor="personal-date">
                        Date of Birth<span style={{ color: 'red' }}>*</span>{' '}
                      </InputLabel>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <MobileDatePicker
                            required
                            value={dateOfBirth}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            name="dateOfBirth"
                            inputFormat="yyyy-MM-dd"
                            onChange={(event) => {
                              setDateOfBirth(moment(event));
                              setFieldError('dob', '');
                            }}
                            maxDate={new Date()}
                          />
                        </LocalizationProvider>
                      </Stack>
                      {errors.dob && (
                        <FormHelperText error id="personal-dob-helper">
                          {errors.dob}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
              <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2.5, mb: 4.5, mr: 2.5 }}>
                <Button disabled={isSubmitting === true} type="submit" variant="contained">
                  {isSubmitting === true ? 'Please Wait...' : 'Update Personal Information'}
                </Button>
              </Stack>
            </form>
          );
        }}
      </Formik>
    </MainCard>
      </>)
   
  );
};

export default TabPersonal;
