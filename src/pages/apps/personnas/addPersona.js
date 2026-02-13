import React, { useEffect, useState } from 'react';
// material-ui
import {
  Grid,
  InputLabel,
  Stack,
  TextField,
  FormHelperText,
  useTheme,
  Autocomplete,
  Button,
  CircularProgress,
  Backdrop
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import MainCard from 'components/MainCard';
import { useNavigate, useParams } from 'react-router';
import {
  getPersonaDetailsById,
  getPersonaIndustryList,
  getPersonaTypes,
  getTargetAudience,
  getTones,
  savePersonna,
  updatePersonaRecord
} from '_api/personna';
import AnimateButton from 'components/@extended/AnimateButton';
import toast from 'utils/ToastNotistack';
import { capitalizeString } from 'config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { ALLTHEAI } from 'config';
import { error429 } from 'pages/maintenance/ErrorMessage';

const useStyles = makeStyles({
  iconClass: {
    cursor: 'pointer'
  }
});

const AddPersonna = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const id = useParams();
  const classes = useStyles();

  /**State */
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [targetAudience, setTargetAudience] = useState([]);
  const [tonesList, setTonesList] = useState([]);
  const [toneSelect, setToneSelect] = useState([]);
  const [industryList, setIndustryList] = useState([]);
  const [industryValue, setIndustryValue] = useState(null);
  const [personaTypes, setPersonaTypes] = useState([]);
  const [isStatic, setIsStatic] = useState(false);
  const [audi, setAudi] = useState([]);
  const [errorMessage, setErrorMessage] = useState({});

  const [idBasedRecord, setIdBasedRecord] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [rateLimit, setRateLimit] = useState(false);

  useEffect(() => {
    document.title = `Add Persona | ${ALLTHEAI}`;
    getAudienceList();
    getTonesList();
    getIndustriesList();
    getPersonaTypeList();
  }, []);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken == null) {
      navigate('/auth/login');
    }

    if (Object.keys(id).length !== 0) {
      getIdBasedPersona();
    }
  }, [id]);

  /**
   * @method
   */
  const getIdBasedPersona = async () => {
    try {
      setIsLoading(true);

      const response = await getPersonaDetailsById(id);

      /* Industry List */
      setIsLoading(false);
      setIdBasedRecord(response.data.data);

      // Update formData state without mutating it directly
      setFormData((prevFormData) => ({
        ...prevFormData,
        name: response.data.data.name,
        description: response.data.data.description,
        keywords: response.data.data.keywords,
        competitors: response.data.data.competitors,
        goals_objectives: response.data.data.goals_objectives
      }));
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
          setIsStatic(true);
        }
      }
    }
  };

  useEffect(() => {
    if (Object.keys(idBasedRecord).length > 0) {
      const initialValue = personaTypes.find((option) => option.id === idBasedRecord?.persona_type);
      setSelectedOption(initialValue);

      const initialIndustry = industryList.find((option) => option.id === idBasedRecord?.industry);
      setIndustryValue(initialIndustry);
      setAudi(idBasedRecord?.target_audience);
      setToneSelect(idBasedRecord?.tone);
    }
  }, [idBasedRecord]);

  /**
   * @method [getAudienceList] use to get the audience list from the server
   */
  const getAudienceList = async () => {
    try {
      const response = await getTargetAudience();

      if (response?.data?.data?.length > 0) {
        const vList = response.data.data.map((item) => ({
          id: item.id,
          label: item.name
        }));

        setTargetAudience(vList);
      }
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
   * @method [getTonesList] use to get the tones for the persona
   */
  const getTonesList = async () => {
    try {
      setIsLoading(true);
      const response = await getTones();
      setIsLoading(false);

      if (response.data.data.length > 0) {
        const toneArr = response.data.data.map((item) => ({
          id: item.id,
          label: item.name
        }));

        setTonesList(toneArr);
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login');
        } else if (error.response.status === 429) {
          setRateLimit(true);
        } else {
          toast(error.response.data.message, {
            variant: 'error'
          });
        }
      }
    }
  };

  /**
   * @method [getIndustriesList] to fetch the industries list from the server
   */
  const getIndustriesList = async () => {
    try {
      const response = await getPersonaIndustryList();
      setIndustryList(response.data.data);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login');
        } else if (error.response.status === 429) {
          setRateLimit(true);
        } else {
          toast(error.response.data.message, {
            variant: 'error'
          });
        }
      }
    }
  };

  /**
   * @method [getPersonaTypeList] to fetch the persona types list from the server
   */
  const getPersonaTypeList = async () => {
    try {
      const response = await getPersonaTypes();
      setPersonaTypes(response.data.data);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login');
        } else if (error.response.status === 429) {
          setRateLimit(true);
        } else {
          toast(error.response.data.message, {
            variant: 'error'
          });
        }
      }
    }
  };

  /**
   * @method [handleSubmit] use to submit the form with various information related to persona
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Extract ids using map and arrow functions
    const newTarget = audi.map((item) => item.id);
    const newTone = toneSelect.map((item) => item.id);

    const params = {
      competitors: formData.competitors,
      keywords: formData.keywords,
      name: formData.name,
      description: formData.description,
      target_audience: newTarget,
      tone: newTone,
      goals_objectives: formData.goals_objectives,
      industry: industryValue?.id,
      persona_type: selectedOption?.id
    };

    setIsLoading(true);

    try {
      const response = Object.keys(id).length !== 0 ? await updatePersonaRecord(id, params) : await savePersonna(params);

      setIsLoading(false);

      if (response.data.status === 'success') {
        toast(response.data.message, { variant: 'success' });
        navigate('/persona-profiles');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.data);
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

  /**
   * @method handleAudienceChange use to change the audience at the point of handle change
   */
  const handleAudienceChange = (e, i, val) => {
    console.log(e, i, val);
    setAudi(i);
  };

  /* handleToneChange is use to change the tone  */
  const handleToneChange = (e, i, val) => {
    console.log(e, i, val);
    setToneSelect(i);
  };

  return (
    <>
      <div width="20px">{/* {(isStatic === true) && <Error404 />} */}</div>
      {!isStatic && !rateLimit && (
        <Grid container spacing={2.5} justifyContent="center">
          <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading === true}>
            <CircularProgress color="inherit" />
          </Backdrop>
          <Grid item xs={12} md={6} lg={7}>
            <MainCard title={Object.keys(id).length > 0 ? 'Update Persona' : 'Add Persona'} sx={{ minHeight: '800px' }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Stack justifyContent="space-between" direction="row">
                          <div style={{ justifyContent: 'space-between' }}>
                            <InputLabel
                              sx={{ color: theme.palette.common.black }}
                              //  justifyContent="space-between"
                            >
                              Name<span style={{ color: 'red' }}>*</span>
                            </InputLabel>
                          </div>

                          <FontAwesomeIcon icon={faCircleInfo} title="What is the name of this persona?" className={classes.iconClass} />
                        </Stack>
                        <TextField
                          fullWidth
                          value={formData.name}
                          onChange={(event) => {
                            /* Error Handling */
                            if (event.target.value.length > 0) {
                              setErrorMessage((prevErrorMessage) => ({
                                ...prevErrorMessage,
                                name: false
                              }));
                            }
                            /*Handle change event */
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              name: event.target.value
                            }));
                          }}
                        />
                        {errorMessage?.name?.length > 0 && (
                          <FormHelperText error id="standard-weight-helper-text-email-login">
                            {errorMessage?.name[0]}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Stack justifyContent="space-between" direction="row">
                          <InputLabel sx={{ color: theme.palette.common.black }}>Keywords</InputLabel>
                          <FontAwesomeIcon
                            icon={faCircleInfo}
                            title="List any important keywords that should be included in the content generated for this persona."
                            className={classes.iconClass}
                          />
                        </Stack>
                        <TextField
                          fullWidth
                          value={formData.keywords}
                          onChange={(event) => {
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              keywords: event.target.value
                            }));
                          }}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} lg={12}>
                      <Stack spacing={0.5}>
                        <Stack justifyContent="space-between" direction="row">
                          <InputLabel sx={{ color: theme.palette.common.black }}>
                            Description<span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <FontAwesomeIcon
                            icon={faCircleInfo}
                            title="Provide a brief description of the brand or company."
                            className={classes.iconClass}
                          />
                        </Stack>
                        <TextField
                          multiline
                          rows={3}
                          fullWidth
                          value={formData.description}
                          onChange={(event) => {
                            /* Error Handling */
                            if (event?.target?.value?.length > 0) {
                              setErrorMessage((prevErrorMessage) => ({
                                ...prevErrorMessage,
                                description: false
                              }));
                            }
                            /* handling change  */
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              description: event.target.value
                            }));
                          }}
                        />
                        {errorMessage?.description?.length > 0 && (
                          <FormHelperText error id="standard-weight-helper-text-email-login">
                            {errorMessage?.description[0]}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Stack justifyContent="space-between" direction="row">
                          <InputLabel sx={{ color: theme.palette.common.black }}>Competitors</InputLabel>
                          <FontAwesomeIcon
                            icon={faCircleInfo}
                            title="Who are the main competitors in the market?"
                            className={classes.iconClass}
                          />
                        </Stack>
                        <TextField
                          fullWidth
                          value={formData?.competitors}
                          onChange={(event) => {
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              competitors: event.target.value
                            }));
                          }}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Stack justifyContent="space-between" direction="row">
                          <InputLabel sx={{ color: theme.palette.common.black }}>
                            Goals Objective<span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <FontAwesomeIcon
                            icon={faCircleInfo}
                            title="What are the goals and objectives for the content generated by this persona?"
                            className={classes.iconClass}
                          />
                        </Stack>
                        <TextField
                          fullWidth
                          value={formData.goals_objectives}
                          onChange={(event) => {
                            /* Error Handling */
                            if (event?.target?.value?.length > 0) {
                              setErrorMessage((prevErrorMessage) => ({
                                ...prevErrorMessage,
                                goals_objectives: false
                              }));
                            }
                            /* handling change  */
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              goals_objectives: event.target.value
                            }));
                          }}
                        />
                        {errorMessage?.goals_objectives?.length > 0 && (
                          <FormHelperText error id="standard-weight-helper-text-email-login">
                            {errorMessage?.goals_objectives[0]}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Stack justifyContent="space-between" direction="row">
                          <InputLabel sx={{ color: theme.palette.common.black }}>
                            Tone<span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <FontAwesomeIcon
                            icon={faCircleInfo}
                            title="Describe the voice and tone of the brand (e.g., professional, friendly, casual, formal)"
                            className={classes.iconClass}
                          />
                        </Stack>
                        <Autocomplete
                          disablePortal
                          multiple
                          name="vendor"
                          value={toneSelect || []}
                          onChange={(e, i, v) => {
                            /* Error Handling */
                            if (i?.length > 0) {
                              setErrorMessage((prevErrorMessage) => ({
                                ...prevErrorMessage,
                                tone: false
                              }));
                            }
                            /* handling change  */
                            handleToneChange(e, i, v);
                          }}
                          options={tonesList.length > 0 ? tonesList : []}
                          renderInput={(params) => <TextField {...params} />}
                          isOptionEqualToValue={(option, value) => option.id === value.id && option.label === value.label}
                        />
                        {errorMessage?.tone?.length > 0 && (
                          <FormHelperText error id="standard-weight-helper-text-tone">
                            {errorMessage?.tone[0]}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <InputLabel sx={{ color: theme.palette.common.black }}>
                          Target Audience<span style={{ color: 'red' }}>*</span>
                        </InputLabel>
                        <Autocomplete
                          disablePortal
                          multiple
                          name="vendor"
                          value={audi || []}
                          onChange={(e, i, v) => {
                            /* Error Handling */
                            if (i?.length > 0) {
                              setErrorMessage((prevErrorMessage) => ({
                                ...prevErrorMessage,
                                target_audience: false
                              }));
                            }
                            handleAudienceChange(e, i, v);
                          }}
                          options={targetAudience.length > 0 ? targetAudience : []}
                          renderInput={(params) => <TextField {...params} />}
                          isOptionEqualToValue={(option, value) => option.id === value.id && option.label === value.label}
                        />
                        {errorMessage?.target_audience?.length > 0 && (
                          <FormHelperText error id="standard-weight-helper-text-target_audience">
                            {errorMessage?.target_audience[0]}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Stack justifyContent="space-between" direction="row">
                          <InputLabel sx={{ color: theme.palette.common.black }}>Persona Type</InputLabel>
                          <FontAwesomeIcon
                            icon={faCircleInfo}
                            title="Is this persona representing a brand or company?"
                            className={classes.iconClass}
                          />
                        </Stack>
                        <Autocomplete
                          options={personaTypes}
                          getOptionLabel={(option) => capitalizeString(option.name)}
                          value={selectedOption}
                          onChange={(event, newValue) => {
                            setSelectedOption(newValue);
                          }}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Stack justifyContent="space-between" direction="row">
                          <InputLabel sx={{ color: theme.palette.common.black }}>
                            Industry<span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <FontAwesomeIcon
                            icon={faCircleInfo}
                            title="In which industry does the brand operate?"
                            className={classes.iconClass}
                          />
                        </Stack>
                        <Autocomplete
                          options={industryList}
                          getOptionLabel={(option) => capitalizeString(option.name)}
                          value={industryValue}
                          onChange={(event, newValue) => {
                            setIndustryValue(newValue);
                            if (newValue && Object.keys(newValue).length > 0) {
                              setErrorMessage((prevErrorMessage) => ({
                                ...prevErrorMessage,
                                industry: false
                              }));
                            }
                          }}
                          renderInput={(params) => <TextField {...params} />}
                        />
                        {errorMessage?.industry?.length > 0 && (
                          <FormHelperText error id="standard-weight-helper-text-industry">
                            {errorMessage.industry[0]}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                  </>
                </Grid>
                <Stack direction="row" justifyContent="flex-end" alignItems="center">
                  <Button variant="outlined" onClick={() => navigate('/persona-profiles')} sx={{ my: 3, ml: 1 }}>
                    Back
                  </Button>
                  <AnimateButton>
                    <Button variant="contained" disabled={isLoading} type="submit" sx={{ my: 3, ml: 1 }}>
                      {isLoading === true ? 'Please Wait...' : Object.keys(id).length !== 0 ? 'Update Persona' : 'Create Persona'}
                    </Button>
                  </AnimateButton>
                </Stack>
              </form>
            </MainCard>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default AddPersonna;
