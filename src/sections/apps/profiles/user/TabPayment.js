// material-ui
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Autocomplete,
  Backdrop,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';

// third party
import { Formik } from 'formik';

//used to manage component state and side effects
import { useEffect, useState } from 'react';

//used to structure and style the content of a page
import MainCard from 'components/MainCard';

//mui
import { useOutletContext } from 'react-router';
import toast from 'utils/ToastNotistack';

//API
import { ALLTHEAI } from 'config';
import { useDispatch } from 'react-redux';
import { displayDeleteIcon, updateDisableUpload } from 'store/reducers/image';
import { addBillingAddressDetails, getBillingAddressDetails, updateBillingAddressDetails, cancelSubscription } from '_api/billing';
import moment from 'moment';
import { error429 } from 'pages/maintenance/ErrorMessage';

//a custom function that returns the result of calling another function
function useInputRef() {
  return useOutletContext();
}

// a functional component
const TabPayment = () => {
  const inputRef = useInputRef();
  const dispatch = useDispatch();

  const [planDetails, setPlanDetails] = useState({});
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    // Fetch billing details when the component mounts
    document.title = `Billing Address | ${ALLTHEAI}`;
    getBillingDetails();
    dispatch(displayDeleteIcon(false));
    dispatch(updateDisableUpload(false));

    const plan = JSON.parse(localStorage.getItem('plan_details'));

    setPlanDetails(plan);
  }, []);

  // Initialize the state for form fields
  const [formFields, setFormFields] = useState({
    address: '',
    phone_number: '',
    city: '',
    state: '',
    postal_code: '',
    country: { code: 'US', label: 'United States' }
  });

  const [isAddressAvailable, setisAddressAvailable] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [userData, setUserData] = useState({});
  const [rateLimit, setRateLimit] = useState(false);

  // Define a list of countries
  const countryList = [{ code: 'US', label: 'United States' }];

  /**
   * @method [getBillingDetails] use to fetch billing details
   */
  const getBillingDetails = () => {
    setIsWaiting(true);
    getBillingAddressDetails().then(
      (response) => {
        setIsWaiting(false);
        if (response.status === 200) {
          setisAddressAvailable(true);
          setUserData(response.data.data);
        } else {
          setisAddressAvailable(false);
        }

        let countryCode;

        for (let i = 0; i < countryList.length; i++) {
          if (countryList[i].code === response.data.data.country) {
            countryCode = countryList[i];
          }
        }
        // Update the form fields with the retrieved data
        setFormFields({
          address_line: response.data.data?.address_line,
          phone_number: response.data.data?.phone_number,
          city: response.data.data?.city,
          state: response.data.data?.state,
          postal_code: response.data.data?.postal_code,
          country: countryCode
        });
      },
      (error) => {
        setIsWaiting(false);
        if (error.response.status == '401') {
          localStorage.clear();
          navigate('/auth/login'); // Redirect to the login page if the token is invalid
        }
        toast.error(error.response.data.message);
      }
    );
  };

  /**
   * @method [profileUpdate] use to update user profile information
   */
  const profileUpdate = async (options) => {
    const params = {
      address_line: options.address_line,
      phone_number: options.phone_number,
      city: options.city,
      state: options.state,
      postal_code: options.postal_code,
      country: options.country.code
    };
    if (isAddressAvailable) {
      /* Send a POST request to update the billing address*/
      setIsWaiting(true);
      await updateBillingAddressDetails(params).then((response) => {
        setIsWaiting(false);
        toast(response.data.message, { variant: 'success' });
      });
    } else {
      /**
       * Send a POST request to update the billing address
       */
      await addBillingAddressDetails(params).then((response) => {
        toast(response.data.message, { variant: 'success' });
      });
      getBillingDetails();
    }
  };

  /**
   * @method [handleCancelSubscription] use to cancel the subscription
   */
  const handleCancelSubscription = () => {
    setIsWaiting(true);
    const params = {};

    cancelSubscription(params)
      .then((response) => {
        setConfirmationOpen(false);
        setIsWaiting(false);
        toast(response.data.message, { variant: response.data.status });

        getBillingDetails();
      })
      .catch((error) => {
        setConfirmationOpen(false);
        setIsWaiting(false);
        if (error.response) {
          if (error.response.status === 401) {
            localStorage.clear();
            navigate('/auth/login');
          } else if (error.response.status === 429) {
            setRateLimit(true);
            toast(error429, {
              variant: 'error'
            });
          } else {
            toast(error.response.data.message, {
              variant: 'error'
            });
          }
        }
      });
  };

  const closeConfirmationDialog = () => {
    setConfirmationOpen(false);
  };

  const isRecurring = userData?.subscription_information?.is_recurring;
  const isFree = userData?.subscription_information?.is_free;

  return (
    <>
      {!rateLimit && (
        <>
          <MainCard content={false} title="Billing Information & Address" sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
            <Formik
              // Setting initial form field values using the state
              initialValues={{
                address_line: formFields.address_line || '',
                phone_number: formFields.phone_number || '',
                city: formFields.city || '',
                state: formFields.state || '',
                postal_code: formFields.postal_code || '',
                country: { code: 'US', label: 'United States' }
              }}
              validate={false}
              validateOnChange={false}
              validateOnBlur={false}
              enableReinitialize={true}
              onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                try {
                  // Call the profileUpdate function to update the profile information
                  await profileUpdate(values);
                } catch (err) {
                  err.response.data.data && setErrors(err.response.data?.data);
                  // Handle error if the profile update fails
                  setStatus({ success: false });
                  setSubmitting(false);
                  setIsWaiting(false);
                  toast(err.response.data.message, { variant: 'error' });
                }
              }}
            >
              {({ errors, handleBlur, handleSubmit, isSubmitting, touched, values, setFieldError, setFieldValue }) => (
                <form noValidate onSubmit={handleSubmit}>
                  <Box sx={{ p: 2.5 }}>
                    <Grid container spacing={3}>
                      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isWaiting === true}>
                        <CircularProgress color="inherit" />
                      </Backdrop>

                      {userData && userData.subscription_information ? (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Stack direction="column" spacing={2}>
                              <Grid item xs={12}>
                                <InputLabel>
                                  {'Name : '}
                                  <span>{planDetails.name}</span>
                                </InputLabel>
                              </Grid>

                              <Grid item xs={12}>
                                <InputLabel>
                                  {'Price : '}
                                  <span>${planDetails.price}</span>
                                </InputLabel>
                              </Grid>

                              <Grid item xs={12}>
                                <InputLabel>
                                  {'Start Date : '}
                                  <span>
                                    {userData?.subscription_information?.start_date &&
                                      moment(userData.subscription_information.start_date).format('MMMM Do YYYY, H:mm a')}
                                  </span>
                                </InputLabel>
                              </Grid>

                              {isFree || !isRecurring ? (
                                <Grid item xs={12}>
                                  <InputLabel>
                                    {'End Date : '}
                                    <span>
                                      {userData?.subscription_information?.end_date &&
                                        moment(userData.subscription_information.end_date).format('MMMM Do YYYY, H:mm a')}
                                    </span>
                                  </InputLabel>
                                </Grid>
                              ) : (
                                <Grid item xs={12}>
                                  <InputLabel>
                                    {'Renewal Date : '}
                                    <span>
                                      {userData?.subscription_information?.end_date &&
                                        moment(userData.subscription_information.end_date).add(1, 'd').format('MMMM Do YYYY, H:mm a')}
                                    </span>
                                  </InputLabel>
                                </Grid>
                              )}
                            </Stack>
                          </Grid>

                          {isRecurring && !isFree && (
                            <Grid item container direction="column" justifyContent="center" alignItems="end" display="flex" xs={12} sm={6}>
                              <Stack direction="column" spacing={1.25}>
                                <Button variant="contained" onClick={() => setConfirmationOpen(true)}>
                                  Cancel Subscription
                                </Button>
                              </Stack>
                            </Grid>
                          )}

                          <Grid item xs={12} mt={3} mb={2}>
                            <Divider variant="fullWidth" />
                          </Grid>
                        </>
                      ) : (
                        <>
                          {isAddressAvailable && (
                            <>
                              <Grid item xs={12}>
                                <Stack direction="column" spacing={2}>
                                  <Grid item xs={12}>
                                    <Typography>
                                      We regret to inform you that your current plan has expired. To ensure uninterrupted access to our
                                      services and avoid any potential issues, we kindly request you to upgrade to a new plan.
                                    </Typography>
                                  </Grid>
                                </Stack>
                              </Grid>

                              <Grid item xs={12} mt={3} mb={2}>
                                <Divider variant="fullWidth" />
                              </Grid>
                            </>
                          )}
                        </>
                      )}

                      <Dialog open={isConfirmationOpen} onClose={closeConfirmationDialog}>
                        <DialogTitle>Confirm Plan Cancellation</DialogTitle>
                        <DialogContent>Are you sure you want to cancel the subscription?</DialogContent>
                        <DialogActions>
                          <Button onClick={closeConfirmationDialog} color="primary">
                            Cancel
                          </Button>
                          <Button onClick={handleCancelSubscription} color="primary">
                            Confirm
                          </Button>
                        </DialogActions>
                      </Dialog>

                      <Grid item xs={12}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-addrees1">
                            Address<span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <TextField
                            multiline
                            rows={3}
                            fullWidth
                            id="personal-addrees1"
                            value={values?.address_line}
                            name="address"
                            onBlur={handleBlur}
                            onChange={(event) => {
                              setFieldValue('address_line', event?.target?.value);
                              setFieldError('address_line', '');
                            }}
                          />
                          {errors.address_line && (
                            <FormHelperText error id="personal-address-helper">
                              {errors.address_line[0]}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-city">
                            City<span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <TextField
                            fullWidth
                            id="personal-city"
                            value={values.city}
                            name="city"
                            onBlur={handleBlur}
                            onChange={(event) => {
                              setFieldValue('city', event?.target?.value);
                              setFieldError('city', '');
                            }}
                            inputRef={inputRef}
                          />
                          {errors.city && (
                            <FormHelperText error id="personal-city-helper">
                              {errors.city[0]}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-state">
                            State<span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <TextField
                            fullWidth
                            id="personal-state"
                            value={values.state}
                            name="state"
                            onBlur={handleBlur}
                            onChange={(event) => {
                              setFieldValue('state', event?.target?.value);
                              setFieldError('state', '');
                            }}
                            inputRef={inputRef}
                          />
                          {errors.state && (
                            <FormHelperText error id="personal-state-helper">
                              {errors.state[0]}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-postal-code">
                            Postal Code<span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <TextField
                            fullWidth
                            id="personal-postal-code"
                            value={values.postal_code}
                            name="postal_code"
                            onBlur={handleBlur}
                            onChange={(event) => {
                              setFieldValue('postal_code', event?.target?.value);
                              setFieldError('postal_code', '');
                            }}
                            inputRef={inputRef}
                          />
                          {touched.postal_code && errors.postal_code && (
                            <FormHelperText error id="personal-postal-code-helper">
                              {errors.postal_code[0]}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-phone">
                            Phone Number<span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <TextField
                              fullWidth
                              id="personal-contact"
                              value={values.phone_number}
                              name="phone"
                              maxLength={13}
                              onBlur={handleBlur}
                              onChange={(event) => {
                                setFieldValue('phone_number', event?.target?.value);
                                setFieldError('phone_number', '');
                              }}
                            />
                          </Stack>
                          {errors.phone_number && (
                            <FormHelperText error id="personal-contact-helper">
                              {errors.phone_number[0]}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1.25}>
                          <InputLabel htmlFor="personal-country">Country</InputLabel>
                          <Autocomplete
                            id="personal-country"
                            fullWidth
                            value={values.country}
                            onBlur={handleBlur}
                            onChange={(event, newValue) => {
                          //eslint-disable-line
                              // setSelectedOption(newValue);
                              setFieldValue('country', newValue === null ? '' : newValue);
                            }}
                            options={countryList}
                            isOptionEqualToValue={(option, value) => option.code === value?.code}
                            // getOptionLabel={(option) => option.label}
                            getOptionLabel={(option) => option.label || ''}
                            renderOption={(props, option) => (
                              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                {option.code && (
                                  <img
                                    loading="lazy"
                                    width="20"
                                    src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                    srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                    alt=""
                                  />
                                )}
                                {option.label}
                                {option.code && `(${option.code})`}
                              </Box>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                name="country"
                                inputProps={{
                                  ...params.inputProps,
                                  autoComplete: 'new-password', // disable autocomplete and autofill
                                  readOnly: true
                                }}
                              />
                            )}
                          />
                          {touched.country && errors.country && (
                            <FormHelperText error id="personal-country-helper">
                              {errors.country[0]}
                            </FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                  <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2.5, mb: 4.5, mr: 4.5 }}>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      Update Billing Address
                    </Button>
                  </Stack>
                </form>
              )}
            </Formik>
          </MainCard>
        </>
      )}
    </>
  );
};

export default TabPayment;
