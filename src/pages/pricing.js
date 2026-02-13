import React, { useEffect, useState } from 'react';
import MainCard from 'components/MainCard';
import { Backdrop, CircularProgress, Grid, List, ListItem, ListItemIcon, ListItemText, Stack, Typography, Switch} from '@mui/material'; //eslint-disable-line
// import { PopupTransition } from 'components/@extended/Transitions';
import { checkoutBilling, getSubscriptionPacks } from '_api/billing';
import { CheckOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { ALLTHEAI } from 'config';
import toast from 'utils/ToastNotistack';
import { useDispatch } from 'react-redux';
import { displayDeleteIcon } from 'store/reducers/image';
import { LoadingButton } from '@mui/lab';
import { error429 } from './maintenance/ErrorMessage';
import { activePlan } from '_api/dashboard';

const BillingInformation = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [plansList, setPlansList] = useState([]);
  const [activatePlan, setActivePlan] = useState({});
  const [selectedPlan, setSelectedPlan] = useState({});
  const [isDisabled, setIsDisabled] = useState(false); //eslint-disable-line
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState(false);

  const [isCheckoutCalled, setIsCheckoutCalled] = useState({
    loading: false,
    index: ''
  });
  const [timePeriod, setTimePeriod] = useState(true);

  /**
   * Calls after every render
   */
  useEffect(() => {
    document.title = `Subscriptions and Billing | ${ALLTHEAI}`;
    setIsLoading(true);
    dispatch(displayDeleteIcon(false));
    getPlansList();
    getActiveSubscriptionPlan();
  }, []);

  /**
   * @method [getPlansList] use to get the Plans list
   */
  const getPlansList = async () => {
    try {
      const response = await getSubscriptionPacks();
      setIsLoading(false);
      setPlansList(response.data.data);
    } catch (error) {
      setIsLoading(false);
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
    }
  };

  useEffect(() => {
    plansList?.forEach((val) => {
      if (val?.id === activatePlan?.billing_plan) {
        setIsDisabled(true);
      }
    });
  }, [plansList, activatePlan]);

  /**
   * @method [getActiveSubscriptionPlan] use to activate the plan
   */
  const getActiveSubscriptionPlan = async () => {
    try {
      const response = await activePlan();
      setActivePlan(response.data.data);

      localStorage.setItem('plan_details', JSON.stringify(response.data.data.plan_details));
      localStorage.setItem('subscription_info', JSON.stringify(response.data.data.subscription_info));
      localStorage.setItem('billing_address', JSON.stringify(response.data.data.billing_address));
    } catch (error) {
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
    }
  };

  useEffect(() => {}, [selectedPlan]);

  /**
   * @method [handleModal] use to handleModal
   */

  const handleModal = async (data, index) => {
    const payload = {
      plan_id: data?.id,
      yearly_billing: !timePeriod
    };

    setIsCheckoutCalled({ loading: true, index: index });

    try {
      const res = await checkoutBilling(payload);

      window.location.href = res.data.data;
      setIsCheckoutCalled({ loading: false, index: '' });
      toast(res?.data?.message, {
        variant: res?.data?.status
      });
    } catch (err) {
      setIsCheckoutCalled({ loading: false, index: index });

      if (err.response) {
        toast(err.response.data.message, {
          variant: err.response.data.status
        });

        if (err.response.data.data?.plan_id !== undefined) {
          setDowngradeMessage(err.response.data.data?.plan_id);
          toast(err.response.data.data?.plan_id, {
            variant: 'error'
          });
        }
      }
    }
  };

  const handleConfirmModalOpen = (data, index) => {
    setSelectedPlan({ plan: data, index: index });
  };

  const getYearlyPrice = (plan) => {
    if (timePeriod === false) {
      return `${plan.yearly_price} / yearly`;
    }
    return `${plan.price} / monthly`;
  };

  return (
    <>
      <Grid container spacing={1} marginTop={2}>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading === true}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {!rateLimit && (
          <>
            <Grid item xs={12} marginTop={-5}>
              <MainCard>
                <Grid container item xs={12} md={12} lg={12}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Typography variant="subtitle1" color={timePeriod ? 'textSecondary' : 'textPrimary'}>
                            Billed Yearly
                          </Typography>
                          <Switch
                            checked={timePeriod}
                            onChange={() => setTimePeriod(!timePeriod)}
                            inputProps={{ 'aria-label': 'container' }}
                          />
                          <Typography variant="subtitle1" color={timePeriod ? 'textPrimary' : 'textSecondary'}>
                            Billed Monthly
                          </Typography>
                        </Stack>
                        <Typography color="textSecondary">
                          Choose annual billing for yearly payments or monthly billing for more frequent charges.
                          <br></br>
                          Your plan will be billed {timePeriod ? 'monthly' : 'yearly'}.
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </MainCard>
            </Grid>
            <Grid container spacing={2}>
              {plansList?.length > 0 &&
                plansList.map((item, index) => {
                  return (
                    <Grid item xs={12} sm={6} lg={4} key={index} mt={4}>
                      <MainCard
                        sx={{
                          pt: 1.75,
                          transition: 'box-shadow 0.3s',
                          '&:hover': {
                            boxShadow: `rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px`
                          },
                          mt: 0,
                          ml: 0,
                          borderRadius: '10px',
                          boxShadow:
                            item.id === activatePlan?.billing_plan
                              ? `rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px`
                              : '0 4px 8px rgba(0, 0, 0, 0.1',
                          height: item.id === activatePlan?.billing_plan ? '600px' : '550px',
                          padding: 0,
                          marginTop: item.id === activatePlan?.billing_plan ? 0 : 2,
                          overflowY: 'auto'
                        }}
                      >
                        <Grid container spacing={3} disabled={true}>
                          <Grid item xs={12}>
                            <Stack direction="row" spacing={2} textAlign="center">
                              <Typography variant="h4">{item?.name}</Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={12}>
                            <Stack direction="row" spacing={2} textAlign="center">
                              {timePeriod && (
                                <Typography variant="h3">
                                  $
                                  {item.id === activatePlan?.billing_plan
                                    ? `${activatePlan.plan_details?.price} - ${
                                        activatePlan.plan_details?.yearly_subscription ? 'Yearly' : 'Monthly'
                                      }`
                                    : `${getYearlyPrice(item)}`}
                                </Typography>
                              )}
                              {!timePeriod && (
                                <Typography variant="h3">
                                  $
                                  {item.id === activatePlan?.billing_plan
                                    ? `${activatePlan?.plan_details?.price} - ${
                                        activatePlan.plan_details?.yearly_subscription ? 'Yearly' : 'Monthly'
                                      }`
                                    : `${getYearlyPrice(item)}`}
                                </Typography>
                              )}
                            </Stack>
                          </Grid>
                          <Grid item xs={12}>
                            <List
                              sx={{
                                m: 0,
                                p: 0,
                                '&> li': {
                                  px: 0,
                                  py: 0.625,
                                  '& svg': {
                                    fill: theme.palette.success.dark
                                  }
                                }
                              }}
                              component="ul"
                            >
                              <Stack direction="column" justifyContent="center" sx={{ padding: 2 }}>
                                <LoadingButton
                                  loading={isCheckoutCalled.loading && isCheckoutCalled.index == index}
                                  onClick={() => {
                                    Number(item.price) < Number(activatePlan?.plan_details?.price)
                                      ? handleConfirmModalOpen(item, index)
                                      : handleModal(item, index);
                                  }}
                                  fullWidth={item.id === activatePlan?.billing_plan && true}
                                  style={{
                                    pointerEvents: item.id === activatePlan?.billing_plan ? 'none' : '',
                                    color: item.id === activatePlan?.billing_plan ? '#7265E6' : '#fff',
                                    backgroundColor:
                                      item.id === activatePlan?.billing_plan
                                        ? '#ffffff' // Active plan, keep it white
                                        : Number(item.price) < Number(activatePlan?.plan_details?.price)
                                        ? '#d3d3d3' // Disabled color for plans with lower price
                                        : '#7265E6', // Default color for other plans

                                    borderColor:
                                      item.id === activatePlan?.billing_plan
                                        ? '#7265E6' // Border color for active plan
                                        : '#fff'
                                  }}
                                  variant={item.id === activatePlan?.billing_plan ? 'outlined' : 'contained'}
                                  disabled={Number(item.price) < Number(activatePlan?.plan_details?.price) ? true : false}
                                >
                                  {
                                    item.id === activatePlan?.billing_plan
                                      ? 'Subscribed' // If the plan ID is the same, then it's Subscribed
                                      : Number(item.price) < Number(activatePlan?.plan_details?.price)
                                      ? 'Downgrade' // If the item price is less than the active plan price, then it's a Downgrade
                                      : 'Upgrade' // If none of the above conditions are met, it's an Upgrade
                                  }
                                </LoadingButton>
                              </Stack>

                              <List key={item.id}>
                                <ListItemText
                                  primaryTypographyProps={{ component: 'div' }}
                                  primary={item.desc.split('\n').map((line, index) => (
                                    <ListItem divider key={index}>
                                      <ListItemIcon>
                                        <CheckOutlined />
                                      </ListItemIcon>
                                      <React.Fragment key={index}>{line}</React.Fragment>
                                    </ListItem>
                                  ))}
                                />
                              </List>
                            </List>
                          </Grid>
                        </Grid>

                        <Grid item xs={12}></Grid>
                        <Stack direction="column" justifyContent="center"></Stack>
                      </MainCard>
                    </Grid>
                  );
                })}
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default BillingInformation;
