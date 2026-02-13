import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  Backdrop,
  CircularProgress
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ALLTHEAI } from 'config';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router';
import {
  pickaTemplate,
  connectToLinkedinSocial,
  connectToTwitterSocial,
  connectToFacebookSocial,
  disconnectSocialMedia
} from '_api/social-account';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import '../../apps/contents/content.css';
import toast from 'utils/ToastNotistack';
import { useTheme } from '@mui/material/styles';
import { error429 } from 'pages/maintenance/ErrorMessage';
/**
 * Importing Dynamic icons for solid , brands, regular
 */
const solid = (iconName) => ({ prefix: 'fas', iconName });
const brands = (iconName) => ({ prefix: 'fab', iconName });

library.add(fas, far, fab);
const SocialMedia = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loader, setLoader] = useState(false);

  const [open, setOpen] = useState(false);
  const [opendisconnect, setOpennDisconnect] = useState(false);
  const [selectedVal, setSelectedVal] = useState(null);
  const [errorMessage, setErrorMessage] = useState(false);
  const [rateLimit, setRateLimit] = useState(false);

  const matchDownLG = useMediaQuery(theme.breakpoints.down('xl'));
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken == null) {
      navigate('/auth/login'); // Redirect to login page if not authenticated
    } else {
      document.title = `Social Media | ${ALLTHEAI}`;
      getTemplatesDetails();
    }
  }, [navigate]);

  /**
   * @method [getTemplatesDetails] use to get the list of templates
   */
  const getTemplatesDetails = async () => {
    try {
      setLoader(true);
      const response = await pickaTemplate();

      setLoader(false);

      if (response?.data?.status === 'success') {
        setTemplates(response.data.data);
        setLoading(false);
        setError(null);
      } else {
        // setErrorMessage(true);
        setLoading(false);
        setError(response?.data?.message);
        toast(response?.data?.message, {
          variant: 'error'
        });
      }
    } catch (error) {
      console.log(error);
      setLoader(false);
      setLoading(false);

      setError(error);
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
          setErrorMessage(true);
          toast(error.response.data.message, {
            variant: 'error'
          });
        }
      }
    }
  };

  /**
   * @method [handleSocailConnect] use to get the list of the templates
   */
  const handleSocailConnect = (val) => {
    setSelectedVal(val); //
    setOpen(true);
  };

  const handleConfirmation = async (val) => {
    try {
      setOpen(false);

      if (val.social_platform_name === 'linkedin') {
        setLoader(true);
        const response = await connectToLinkedinSocial();
        setLoader(false);
        const url = response?.data?.data?.url;
        window.location.href = url;
      } else if (val.social_platform_name === 'twitter') {
        setLoader(true);
        const response = await connectToTwitterSocial();
        setLoader(false);
        const url = response?.data?.data?.url;
        window.location.href = url;
      } else {
        setLoader(true);
        const response = await connectToFacebookSocial();
        setLoader(false);
        const url = response?.data?.data?.url[0];
        window.location.href = url;
      }
    } catch (error) {
      setLoader(false);
      setLoading(false);
      setError(error);
    }
  };

  /**
   * @method [handleSocailConnect] use to get the list of the templates
   */
  const handleDisconnectSocailConnect = async (val) => {
    setSelectedVal(val); //
    setOpennDisconnect(true);
  };

  const handleDisconnectConfirmation = async (val) => {
    setOpen(false);
    setLoader(true);

    try {
      const response = await disconnectSocialMedia(val);
      // Handle the response as needed
      setLoader(false);
      toast(response.data.message, { variant: 'success' });
      navigate('/social-media');
      window.location.reload();
    } catch (error) {
      setLoader(false);

      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login');
        } else if (error.response.status === 429) {
          toast(error429, {
            variant: 'error'
          });
        } else {
          toast(error.response.data.message, {
            variant: 'error'
          });
        }
      } else {
        // Handle non-response errors here
        console.error('Error:', error);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDisconnectClose = () => {
    setOpennDisconnect(false);
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={3}>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader === true}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {errorMessage === true && (
        <>
          <Grid item xs={12}>
            <Typography>
              {
                'We regret to inform you that your current plan has expired. To ensure uninterrupted access to our services and avoid any potential issues, we kindly request you to upgrade to a new plan.'
              }
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
              <Button variant="contained" onClick={() => navigate('/subscribe-plan')}>
                Upgrade Now
              </Button>
            </Stack>
          </Grid>
        </>
      )}

      {!loading &&
        !rateLimit &&
        !error &&
        templates.map((val, index) => (
          <Grid item key={index} xs={12} sm={6} md={3} lg={3} xl={4}>
            <MainCard
              style={{
                height: matchDownLG ? '240px' : downLG ? '200px' : '160px',
                backgroundColor: val.is_connected ? '#F2F2F2' : 'white',
                boderColor: val.is_connected ? '#F2F2F2' : 'white'
              }}
              shadow="none"
              boxShadow
              sx={{
                mt: 2,
                borderRadius: '10px',
                boxShadow: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,rgba(0, 0, 0, 0.3) 0px 8px 16px -8px'
              }}
            >
              <Stack spacing={1}>
                <Grid container>
                  <Grid item xs={12} sm={6} md={2} container direction="column" alignItems="center" justifyContent="center">
                    <FontAwesomeIcon icon={solid(val?.social_platform_icon)} size={matchDownLG && downLG ? '2x' : '3x'} />
                    <FontAwesomeIcon icon={brands(val?.social_platform_icon)} size={matchDownLG && downLG ? '2x' : '3x'} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={10} pl={2}>
                    <Stack direction="column" alignItems="left">
                      <Typography variant="h5">{val?.social_platform_name}</Typography>
                      <Typography variant="h6">{val?.social_platform_description}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} mt={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {val.is_connected ? (
                      /* Connected Icon */
                      <Button
                        variant="contained"
                        color="primary"
                        style={{ borderRadius: '8px', backgroundColor: '#ffcccb', color: 'rgb(168, 8, 8)' }}
                        onClick={() => handleDisconnectSocailConnect(val)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      /* AddCircle Icon */
                      <Button variant="contained" color="primary" style={{ borderRadius: '8px' }} onClick={() => handleSocailConnect(val)}>
                        Connect
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Stack>
            </MainCard>
          </Grid>
        ))}

      <Dialog open={open} onClose={handleClose} maxWidth="sm">
        <DialogTitle sx={{ fontSize: '1.875rem' }}>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to connect to {selectedVal?.social_platform_name} ? Upon confirmation, you will be redirected to your{' '}
            {selectedVal?.social_platform_name} page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button color="primary" onClick={() => handleConfirmation(selectedVal)}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={opendisconnect} onClose={handleDisconnectClose} maxWidth="sm">
        <DialogTitle sx={{ fontSize: '1.875rem' }}>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to disconnect to {selectedVal?.social_platform_name}.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDisconnectClose} color="primary">
            Cancel
          </Button>
          <Button color="primary" onClick={() => handleDisconnectConfirmation(selectedVal)}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default SocialMedia;
