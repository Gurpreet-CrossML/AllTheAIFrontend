// material-ui
import { Button, FormHelperText, Grid, InputLabel, Stack, TextField, Typography } from '@mui/material'; //eslint-disable-line
import { useStripe, PaymentElement, useElements } from '@stripe/react-stripe-js'; //eslint-disable-line
import { useEffect, useState } from 'react';
import MainCard from 'components/MainCard';
import { getBillingAddressDetails, subscribeToPlan } from '_api/billing';
import toast from 'utils/ToastNotistack';
import { useTheme } from '@emotion/react';
import { BETA_URL } from 'config';

const PaymentForm = ({ selectedPlan, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const theme = useTheme();

  const [disabled, setIsDisabled] = useState(false);
  const [billingAddress, setBillingAddress] = useState({});

  const loginUser = JSON.parse(localStorage.getItem('user_info'));

  useEffect(() => {
    getBillingAddressInfo();
  }, []);

  /**
   * @method [getBillingAddressInfo] use to fetch the billing address details
   */
  const getBillingAddressInfo = () => {
    getBillingAddressDetails().then(
      (response) => {
        setBillingAddress(response.data.data);
      },
      (error) => {
        toast(error.response.data.message, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
            variant: 'error'
          }
        });
      }
    );
  };

  /**
   * @method [handleSubmit] use to submit the form for the card payment
   * @param {Event} event
   * @returns Payment Promise
   */
const handleSubmit = async (event) => { //eslint-disable-line
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet; handle this case gracefully
      return;
    }

    try {
      const response = await stripe.confirmPayment({
        elements,
        payment_method: {
          billing_details: {
            name: `${loginUser.first_name} ${loginUser.last_name}`
          }
        },
        shipping: {
          address: {
            line1: billingAddress?.address_line,
            city: billingAddress?.city,
            state: billingAddress?.state,
            postal_code: billingAddress?.postal_code,
            country: billingAddress?.country
          }
        },
        return_url: `${BETA_URL}}apps/profiles/user/subscribe_plan`,
        redirect: 'if_required'
      });

      const payment_status = response?.paymentIntent?.status;

      /**
       * Stripe Success Response Via API
       */
      if (payment_status === 'succeeded') {
        if (Object.keys(response?.paymentIntent).length > 0 && response?.paymentIntent?.status === 'succeeded') {
          const params = {
            plan_id: JSON.stringify(selectedPlan.id),
            payment_data: response?.paymentIntent
          };
          setIsDisabled(true);

          await subscribeToPlan(params).then((response) => {
            setIsDisabled(false);
            const successMessage =
              response.data.message || 'Subscription Successful! Thank you for choosing our service. Enjoy your new plan!';
            toast(successMessage, {
              variant: 'success',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
                variant: 'success'
              }
            });
          });

          onClose();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          return;
        }
      }

      /**
       * Stripe Error Handling VIA Api
       */
      if (response?.error?.type === 'card_error') {
        const params = {
          plan_id: JSON.stringify(selectedPlan.id),
          payment_data: { error: response?.error }
        };
        setIsDisabled(true);

        await subscribeToPlan(params).catch((error) => {
          setIsDisabled(false);
          toast(error.response.data.message, {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
              variant: 'error'
            }
          });
          onClose();
        });
      }
    } catch (error) {
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
  };

  return (
    <>
      {/* <CardElement options={appearance} /> */}
      <MainCard title="Please fill card details to continue" sx={{ maxHeight: '80vh' }} style={{ overflowY: 'scroll' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h5" component="div" sx={{ mb: 1.5 }}>
                A. Billing Details:
              </Typography>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="customer-name" sx={{ color: theme.palette.common.black }}>
                  Address :- <span>{billingAddress?.address_line}</span>{' '}
                </InputLabel>
              </Stack>
            </Grid>
            <Grid item lg={6} xs={12} md={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="customer-name" sx={{ color: theme.palette.common.black }}>
                  City :- <span>{billingAddress?.city}</span>
                </InputLabel>
              </Stack>
            </Grid>
            <Grid item lg={6} xs={12} md={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="customer-name" sx={{ color: theme.palette.common.black }}>
                  State :- <span>{billingAddress?.state}</span>
                </InputLabel>
              </Stack>
            </Grid>

            <Grid item lg={6} xs={12} md={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="customer-name" sx={{ color: theme.palette.common.black }}>
                  Zip Code :- <span>{billingAddress?.postal_code}</span>
                </InputLabel>
              </Stack>
            </Grid>
            <Grid item lg={6} xs={12} md={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="customer-name" sx={{ color: theme.palette.common.black }}>
                  Phone :- <span>{billingAddress?.phone_number}</span>
                </InputLabel>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                B. Card Details:
              </Typography>
            </Grid>

            <Grid item lg={6} xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="customer-name">First name</InputLabel>
                <TextField
                  id="customer-name"
                  placeholder="Enter Customer Name"
                  InputProps={{ readOnly: true }}
                  value={loginUser?.first_name}
                />
              </Stack>
            </Grid>
            <Grid item lg={6} xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="customer-name">Last name</InputLabel>
                <TextField
                  fullWidth
                  id="customer-name"
                  placeholder="Enter Customer Name"
                  InputProps={{ readOnly: true }}
                  value={loginUser?.last_name}
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <div style={{ position: 'relative' }}>
                <PaymentElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        '::placeholder': {
                          color: '#aab7c4'
                        }
                      }
                    },
                    hidePostalCode: true // Remove the country dropdown
                  }}
                />
                <FormHelperText>Currently we are supporting for the United States only.</FormHelperText>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                    pointerEvents: 'none'
                  }}
                >
                  {/* Apply additional CSS styles to hide the country dropdown */}
                </div>
              </div>
            </Grid>
            <Grid item xs={12} lg={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" spacing={1.5} sx={{ mt: 3.5 }}>
                <Button color="inherit" size="small" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="small"
                  variant="contained"
                  disabled={disabled === true || Object.keys(billingAddress).length === 0}
                >
                  {disabled === true ? 'Loading..' : 'Subscribe Now'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    </>
  );
};
export default PaymentForm;
