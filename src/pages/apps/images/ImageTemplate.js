import React from 'react';
import { useEffect, useState } from 'react';
//mui
import { Grid, Typography, Stack, Box, CircularProgress, Button, Backdrop } from '@mui/material'; //eslint-disable-line
import { ALLTHEAI } from 'config';
import MainCard from 'components/MainCard'; //eslint-disable-line
import toast from 'utils/ToastNotistack';
import { error429 } from 'pages/maintenance/ErrorMessage';

import { useNavigate } from 'react-router';
import { pickaTemplate } from '_api/image-generation';


const ImageTemplate = () => {
  const navigate = useNavigate();
  const [pickTemplate, setPickedTemplate] = useState([]);
  const [loader, setLoader] = useState(false);
  const [errorPage, setErrorPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const[rateLimit, setRateLimit]= useState(false);

  useEffect(() => {
    document.title = `Choose Image Template | ${ALLTHEAI}`;
    getTemplatesDetails();
  }, []);

  /**
 * @method [getTemplatesDetails] use to get the list of the templates
 */
const getTemplatesDetails = async () => {
  try {
    setLoader(true);
    const response = await pickaTemplate();
    setLoader(false);

    if (response?.data?.status === 'success') {
      setPickedTemplate(response?.data?.data);
      setErrorPage(false);
    } else if (response?.data?.status === 'error') {
      setErrorPage(true);
    }
  } catch (error) {
    setLoader(false);

    if (error.response) {
      if (error.response.status === 404) {
        setErrorMessage(true);
        toast(error.response.data.message, {
          variant: 'error'
        });
      } else if (error.response.status === 401) {
        localStorage.clear();
        navigate('/auth/login'); // Redirect to the login page if the token is invalid
      }
      else if (error.response.status === 429) { 
        setRateLimit(true);
        toast(error429, {
          variant: 'error'
        });
      }
      else if (error.response.data.status === 'error') {
        setErrorPage(true);
        toast(error.response.data.message, {
          variant: 'error'
        });
      }
    } 
  }
};


  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader === true}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Typography variant="h2" marginBottom={3}>
        Choose Image Template
      </Typography>
      
      <Grid container rowSpacing={4.5} columnSpacing={3}>
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

        {/* row 1 */}
        {!loader && !rateLimit &&
          !errorPage &&
          pickTemplate?.length > 0 &&
          pickTemplate.map((val, index) => {
            return (
              <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                <MainCard
                  style={{ height: '200px', position: 'relative' }}
                  shadow="none"
                  onClick={() => {
                    localStorage.setItem('isTemplateId', JSON.stringify(true));
                    navigate(`/generate-image/template/${val?.template_id}`);
                  }}
                  boxShadow
                  sx={{
                    boxShadow: `rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px`,
                    mt: 2,
                    borderRadius: '10px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${val.template_bg_image})`,
                    cursor: 'pointer',
                    transition: 'cursor 0.3s' // Add transition for smooth effect
                  }}
                >
                  <Stack
                    spacing={0.4} // Adjust the spacing value as needed
                    sx={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      width: '100%',
                      padding: '10px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '0 0 10px 10px'
                    }}
                  >
                    <Typography variant="h5" style={{ color: '#fff' }}>
                      {val?.template_name}
                    </Typography>
                    <Typography variant="caption" color="secondary" style={{ color: '#fff' }}>
                      {val?.template_description?.length > 10
                        ? val.template_description.substring(0, 10) + '...'
                        : val.template_description}
                    </Typography>
                  </Stack>
                </MainCard>
              </Grid>
            );
          })}
      </Grid>
    </>
  );
};
export default ImageTemplate;
