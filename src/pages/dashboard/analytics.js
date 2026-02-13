import React, { useEffect, useState } from 'react';

// material-ui
import { Box, Button, CircularProgress, Grid, Stack, Tab, Tabs, Typography, Backdrop } from '@mui/material';

import MainCard from 'components/MainCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, fas } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router';
import './../apps/contents/content.css';
import IconButton from 'components/@extended/IconButton';
import { AddCircle } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { categoryTemplate, listCategories, pickaTemplate } from '_api/contents';
import { ALLTHEAI } from 'config';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import toast from 'utils/ToastNotistack';
import { error429 } from 'pages/maintenance/ErrorMessage';

/**
 * Importing Dynamic icons for solid , brands, regular
 */
const solid = (iconName) => ({ prefix: 'fas', iconName });
const brands = (iconName) => ({ prefix: 'fab', iconName });

library.add(fas, far, fab);

const useStyles = makeStyles({
  customColor: {
    color: '#753CEF',
    fontSize: '40px'
  }
});

const DashboardAnalytics = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const [pickTemplate, setPickedTemplate] = useState([]);
  const [errorPage, setErrorPage] = useState(false);
  const [loader, setloader] = useState(false);
  const [value, setValue] = useState(0);
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [rateLimit, setRateLimit] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken == null) {
      navigate('/auth/login');
    }
    document.title = `Choose Template | ${ALLTHEAI}`;
    getTemplatesDetails();
    getCategoriesDetails();
  }, []);

  /**
   * @method [getTemplatesDetails] use to get the list of the templates
   */
  const getTemplatesDetails = async () => {
    setloader(true);

    try {
      const response = await pickaTemplate();
      setloader(false);
      if (response?.data?.status === 'success') {
        setPickedTemplate(response?.data?.data);
        setErrorPage(false);
      }
    } catch (error) {
      setloader(false);
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
          setErrorPage(true);
          toast(error.response.data.message, {
            variant: 'error'
          });
        }
      }
    }
  };

  /**
   * @method [getCategoriesDetails] use to get the categories details
   */
  const getCategoriesDetails = async () => {
    try {
      const response = await listCategories();

      // Need to add All here ...
      response.data.data.unshift({
        category: 'ALL',
        id: ''
      });

      setCategoriesList(response?.data?.data);
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

  /**
   *
   * @param {Event} event
   * @param {Number} newValue
   */
  const handleChange = (event, newValue) => {
    setValue(newValue);
    const categoryId = categoriesList[newValue].id;
    setCategoryId(categoryId);
  };

  useEffect(() => {
    if (categoryId !== null) {
      categoryTemplate(categoryId).then(
        (response) => {
          setPickedTemplate(response.data.data);
        },
        (error) => {
          if (error.response.status == '401') {
            localStorage.clear();
            navigate('/auth/login'); // Redirect to the login page if the token is invalid
          }
        }
      );
    }
  }, [categoryId]);

  return (
    <>
      <Typography variant="h2" marginBottom={3}>
        Choose Template
      </Typography>
      {!rateLimit && (
        <>
          <Grid container rowSpacing={4.5} columnSpacing={3}>
            {categoriesList && categoriesList.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ bgcolor: 'background.paper' }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="scrollable auto tabs example"
                  >
                    {categoriesList?.length > 0 &&
                      categoriesList.map((item) => {
                        return <Tab label={item.category} key={item.id} />;
                      })}
                  </Tabs>
                </Box>
              </Grid>
            )}
            {errorPage === true && (
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
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader === true}>
              <CircularProgress color="inherit" />
            </Backdrop>
            {/* row 1 */}
            {!loader &&
              !errorPage &&
              pickTemplate?.length > 0 &&
              pickTemplate.map((val, index) => {
                return (
                  <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                    <MainCard
                      style={{ height: '200px' }}
                      shadow="none"
                      boxShadow
                      sx={{
                        boxShadow: `rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px`,
                        mt: 2,
                        borderRadius: '10px'
                      }}
                    >
                      <Stack spacing={1}>
                        <Grid container>
                          <Grid item xs={12}>
                            <FontAwesomeIcon icon={solid(val?.template_icon)} size="3x" />
                            <FontAwesomeIcon icon={brands(val?.template_icon)} size="3x" />
                          </Grid>
                          <Grid item xs={12}>
                            <Stack marginTop={2} direction="row" alignItems="center" spacing={3} justifyContent="space-between">
                              <Typography variant="h5">{val?.template_name}</Typography>
                              <FontAwesomeIcon icon={faCircleInfo} title={val?.template_description} color="#753CEF" />
                            </Stack>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="secondary" sx={{ overflow: 'hidden' }}>
                            {val?.template_description?.length > 30
                              ? val.template_description.substring(0, 30) + '...'
                              : val.template_description}
                          </Typography>
                        </Grid>
                      </Stack>
                      <Stack justifyContent="space-between" alignItems="flex-end">
                        <Typography>{''}</Typography>
                        <IconButton
                          size="small"
                          shape="rounded"
                          onClick={() => {
                            navigate(`/content-generation/template/${val.template_id}`);
                          }}
                          sx={{
                            fontSize: '1.25rem',
                            bgcolor: '#fff',
                            color: '#7265E6'
                          }}
                        >
                          <AddCircle className={classes.customColor} />
                        </IconButton>
                      </Stack>
                    </MainCard>
                  </Grid>
                );
              })}
          </Grid>
        </>
      )}
    </>
  );
};

export default DashboardAnalytics;
