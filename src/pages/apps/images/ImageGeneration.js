import {
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  Button,
  useTheme,
  CircularProgress,
  Select,
  Autocomplete,
  Backdrop,
  Dialog,
  DialogContent,
  DialogContentText
} from '@mui/material';

import { generateImage, getImageConfig, imageHistory, pickImageModel } from '_api/image-generation';
import MainCard from 'components/MainCard';
import React, { useEffect, useState } from 'react';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { DownloadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router';
import toast from 'utils/ToastNotistack';
import Slider from 'react-slick';
import { Reply, VerticalAlignBottom } from '@mui/icons-material';
import { ALLTHEAI } from 'config';
import { capitalizeString } from 'config';
import { error429 } from 'pages/maintenance/ErrorMessage';

/**
 * Settings
 */
const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1
};

/**
 * Number of Images
 * */
const numberOfImages = [
  {
    value: '1',
    label: '1'
  },
  {
    value: '2',
    label: '2'
  },
  {
    value: '3',
    label: '3'
  },
  {
    value: '4',
    label: '4'
  },
  {
    value: '5',
    label: '5'
  },
  {
    value: '6',
    label: '6'
  },
  {
    value: '7',
    label: '7'
  },
  {
    value: '8',
    label: '8'
  },
  {
    value: '9',
    label: '9'
  },
  {
    value: '10',
    label: '10'
  }
];

const ImageGeneration = () => {
  const id = useParams();
  const theme = useTheme();
  const navigate = useNavigate();

  const [numValue, setNumValue] = useState('1');
  const [isWaiting, setIsWaiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [imageGeneratedResponse, setImageGeneratedResponse] = useState([]);
  const [errorMessage, setErrorMessage] = useState({});
  const [modelContent, setModelContent] = useState([]);
  const [value, setValue] = useState({});
  const [formData, setFormData] = useState({});
  const [isStatic, setIsStatic] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [generatedData, setGeneratedData] = useState([]);
  const [aiModel, setAiModelId] = useState('');
  const [newHeight, setNewHeight] = useState(false);
  const [isDetailExist, setIsDetailExist] = useState(false);
  const [autoCompleteValue, setAutoCompleteValue] = useState({ value: '', index: '' }); //eslint-disable-line
  const [autoCompleteValueArr, setAutoCompleteValueArr] = useState([]);
  const [configData, setConfigData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const[rateLimit, setRateLimit] = useState(false);
  const[modelLimit, setModelLimit] = useState(false);

  const isTemp = JSON.parse(localStorage.getItem('isTemplateId'));

  /**
   * Calls after render the component
   */
  useEffect(() => {
    document.title = `Generate Images | ${ALLTHEAI}`;
  
    const loadImageData = async () => {
      try {
        setIsLoading(true);
  
        if (Object.keys(id).length > 0 && isTemp) {
          const response = await getImageConfig(id.id);
          setFormData(response.data.data);
          setTemplateId(response.data.data.template.template_id);
        } else if (Object.keys(id).length > 0 && !isTemp) {
          const response = await imageHistory(id);
          setIsDetailExist(true);
          setPrompt(response.data.data.prompt);
          setSelectedValue(response.data.data.size);
          setAiModelId(response.data.data.ai_model);
          setIsStatic(true);
  
          numberOfImages?.forEach((val) => {
            if (val.value === response.data.data.number_of_images) {
              setNumValue(response.data.data.number_of_images);
            }
          });
  
          const demoArr = Object.values(response.data.data.images).map((value, index) => ({
            des: (
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                sx={{
                  backgroundColor: '#753CEF',
                  '&:hover': {
                    backgroundColor: '#753CEF'
                  }
                }}
                onClick={() => handleDownload(value, index)}
              >
                <DownloadOutlined />
              </IconButton>
            ),
            imgSrc: value
          }));
  
          setImageGeneratedResponse(demoArr);
        }
  
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
  
        if (error.response) {
          if (error.response.status === 401) {
            localStorage.clear();
            navigate('/auth/login'); 
          }
          else if (error.response.status === 404) {
            navigate('*');
            setIsStatic(true);
            toast.error(error.response.data.message, {
              variant: 'error'
            });
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
  
    loadImageData();
    getImageModel();
  }, [id, isTemp, numberOfImages]);  // Added numberOfImages as a dependency
  

  useEffect(() => {
    if (Object.keys(formData).length > 0 && formData.configs?.length > 0) {
      const objectsWithOptions = formData.configs?.filter((item) => item.is_an_option);
      const objectsWithNoOptions = formData.configs?.filter((item) => !item.is_an_option);

      // Concatenate the two arrays to put objects with options first
      const sortedData = objectsWithOptions.concat(objectsWithNoOptions);
      setConfigData(sortedData);
      const modifiedArr = sortedData.map((item) => {
        return {
          ...item,
          ['value']: item.options[0]
        };
      });
      setGeneratedData(modifiedArr);
      const configArr = [];
      for (let i = 0; i < sortedData.length; i++) {
        if (sortedData[i].is_an_option) {
          configArr.push({
            value: sortedData[i].options[0],
            index: i
          });
        }
      }
      setAutoCompleteValueArr(configArr);
    }
  }, [formData]);

  /* handle Value Change */
  const handleNumberValueChange = (event) => {
    setNumValue(event.target.value);
    setErrorMessage((prevState) => ({ ...prevState, numValue: false }));
  };

  const handleAutocompleteValueChange = (value, index) => {
    setAutoCompleteValue({
      value: value,
      index: index
    });

    if (autoCompleteValueArr.length > 0) {
      if (autoCompleteValueArr.at(index) !== value) {
        const updatedArr = [...autoCompleteValueArr];
        updatedArr[index] = { value: value, index: index };

        setAutoCompleteValueArr(updatedArr);
      }
    } else {
      setAutoCompleteValueArr((prev) => [
        ...prev,
        {
          value: value,
          index: index
        }
      ]);
    }
  };

  /**
   *
   * @method [handleInputChange] use to handle the data for question and answer
   */
  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    const updatedFormData = generatedData?.map((object, i) => {
      if (i === index) {
        return {
          ...object,
          ['question_val']: name,
          ['value']: value
        };
      } else {
        return object;
      }
    });
    setGeneratedData(updatedFormData);
  };

/**
 * @method [handleSubmit] use to submit the response of the form
 */
const handleSubmit = async (event) => {
  try {
    if (event !== undefined) {
      event.preventDefault();
    }

    if (generatedData?.length === 0) {
      const newGeneratedData = configData?.map((object) => ({
        ...object,
        question_val: object?.question_val,
        value: ''
      }));

      setGeneratedData(newGeneratedData);
    }

    const params = {
      image_template: templateId,
      user_description: prompt,
      size: selectedValue,
      number_of_images: parseInt(numValue),
      enhance: false,
      model_id: modelContent[0]?.id,
      parameters: generatedData
    };

    if (value?.id) {
      params.model_id = value.id; // Use the selected model ID from the dropdown
    }

    setIsWaiting(true);
    setShowPopup(true);

    if (params.size === 'large') {
      setNewHeight(true);
    }

    const response = await generateImage(params);

    setIsWaiting(false);
    setShowPopup(false);

    if (response.data.status === 'success') {
      setShowPopup(false);
      setAiModelId(response.data.data.ai_model);

      const demoArr = Object.values(response.data.data.images).map((value, index) => ({
        des: (
          <>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              sx={{
                backgroundColor: '#753CEF',
                '&:hover': {
                  backgroundColor: '#753CEF'
                }
              }}
              onClick={() => handleDownload(value, index)}
            >
              <DownloadOutlined />
            </IconButton>
          </>
        ),
        imgSrc: value
      }));

      setImageGeneratedResponse(demoArr);
      setShowPopup(false);
    } 
  } catch (error) {
    if (error.response.data.data) {
      setErrorMessage(error.response.data.data);
    }
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
      setShowPopup(false);
    }
  }
};


  /**
   * @method [handleDownload] to download the image
   */
  const handleDownload = (value) => {
    const link = document.createElement('a');
    link.href = value;
    link.download = 'image.jpg';
    link.click();
  };

  /**
 * @method [getImageModel] use to get the list of the templates
 */
const getImageModel = async () => {
  try {
    if (Object.keys(id).length > 0 && isTemp) {
      const response = await pickImageModel();

      if (response?.data?.status === 'success') {
        setModelContent(response.data.data);
        setErrorMessage(false);
        setValue(response.data.data[0]);
      } 
    }
  } catch (error) {
    setShowPopup(false);
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate('/auth/login'); 
      }
      else if (error.response.status === 429) { 
        setModelLimit(true);
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


  return (
    <>
      <Grid item lg={12} container justifyContent="flex-end" alignItems="flex-end">
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading === true}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        {Object.keys(id).length > 0 && isTemp ? (
          <Button
            variant="contained"
            onClick={() => {
              navigate('/image-template');
            }}
            startIcon={<Reply />}
          >
            Back
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => {
              navigate('/images-history');
            }}
            startIcon={<Reply />}
          >
            Back
          </Button>
        )}
      </Grid>
      {!rateLimit && (<>
        {((Object.keys(id).length > 0 && isTemp) || isDetailExist) && (
        <>
          <Grid container justifyContent="space-between" alignItems="center" marginBottom={2}>
            <Grid item lg={6} sm={6} xs={12} justifyContent="flex-end" alignItems="flex-end" marginBottom={2}>
              <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 2.5 }}>
                <Typography variant="h2">{formData?.template?.template_name}</Typography>
              </Stack>
              <div>
                <Typography variant="body1" color="secondary" style={{ marginTop: '10px' }}>
                  {formData?.template?.template_description}
                </Typography>
              </div>
            </Grid>
            {!isStatic && !modelLimit && (
              <Grid item lg={6} sm={6} xs={12} alignItems="flex-end" justifyContent="flex-end" marginBottom={2}>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2.5 }}>
                  <Typography variant="h5" sx={{ color: 'text.primary' }}>
                    <strong>Image Type</strong>
                  </Typography>
                  <Select
                    style={{ width: '30%' }}
                    value={value || (Array.isArray(modelContent) && modelContent[0])}
                    onChange={(event) => {
                      setValue(event.target.value);
                    }}
                    renderValue={(selected) => capitalizeString(selected?.name)}
                  >
                    {Array.isArray(modelContent)
                      ? modelContent
                          .filter((option) => option != null)
                          ?.map((option) => (
                            <MenuItem key={option.id} value={option}>
                              {capitalizeString(option.name)}
                            </MenuItem>
                          ))
                      : null}
                  </Select>
        
                </Stack>
              </Grid>
            )}
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <MainCard title="Tell AI what kind of image you want to generate">
                <form onSubmit={handleSubmit}>
                  {Object.keys(id).length > 0 && isTemp ? (
                    <>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                          <InputLabel sx={{ color: theme.palette.common.black }}>
                            {Object.keys(id).length > 0 && !isTemp ? 'Prompt' : 'Image Description'}
                            <span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <TextField
                            multiline
                            rows={6}
                            fullWidth
                            value={prompt}
                            InputProps={{
                              readOnly: Object.keys(id).length > 0 && !isTemp
                            }}
                            onChange={(e) => {
                              setPrompt(e.target.value);
                              setErrorMessage((prevState) => ({ ...prevState, user_description: [] }));
                            }}
                            placeholder="Enter the  Image Description"
                            sx={{ marginTop: 1 }}
                          />
                          {errorMessage?.user_description?.length > 0 && (
                            <FormHelperText error id="standard-weight-helper-text-email-login">
                              {errorMessage?.user_description[0]}
                            </FormHelperText>
                          )}
                        </Grid>
                        <Grid item xs={12}>
                          <InputLabel sx={{ color: theme.palette.common.black }}>
                            Size<span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <Grid item xs={12} sm={9} lg={8}>
                            <RadioGroup
                              aria-label="size"
                              name="controlled-radio-buttons-group"
                              value={selectedValue}
                              onChange={(e) => {
                                setSelectedValue(e.target.value);
                                setErrorMessage((prevState) => ({ ...prevState, size: [] })); // Clear the size error message
                              }}
                            >
                          {/* <FormControlLabel
                            sx={{ marginLeft: '10px' }}
                            value="auto"
                            control={<Radio />}
                            label="Auto (AI decides best format)"
                          /> */}

                           <FormControlLabel
                            sx={{ marginLeft: '10px' }}
                            value="square"
                            control={<Radio />}
                            label="Square (1:1)"
                          />

                          <FormControlLabel
                            sx={{ marginLeft: '10px' }}
                            value="portrait"
                            control={<Radio />}
                            label="Portrait (4:5)"
                          />

                          <FormControlLabel
                            sx={{ marginLeft: '10px' }}
                            value="landscape"
                            control={<Radio />}
                            label="Landscape (16:9)"
                          />

                            </RadioGroup>
                            {errorMessage?.size?.length > 0 && (
                              <FormHelperText error id="standard-weight-helper-text-email-login">
                                {errorMessage?.size[0]}
                              </FormHelperText>
                            )}
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <InputLabel sx={{ color: theme.palette.common.black }}>
                            Count of Images<span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <TextField
                            placeholder="Select count of images"
                            InputProps={{
                              readOnly: Object.keys(id).length > 0 && true && !isTemp
                            }}
                            fullWidth
                            select
                            value={numValue}
                            sx={{ marginTop: 1 }}
                            onChange={handleNumberValueChange}
                          >
                            {numberOfImages?.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                          {errorMessage.numValue === true && (
                            <FormHelperText error id="standard-weight-helper-text-email-login">
                              This field is required.
                            </FormHelperText>
                          )}
                        </Grid>
                        {configData.length > 0 &&
                          configData.map((item, index) => {
                            return (
                              <React.Fragment key={index}>
                                <Grid item xs={12} marginBottom={1} marginTop={1}>
                                  <Typography sx={{ color: theme.palette.common.black, marginTop: 0.5 }}>{item.question_val}</Typography>
                                  {item.is_an_option ? (
                                    <>
                                      <Autocomplete
                                        fullWidth
                                        name={item.question_val}
                                        options={item.options}
                                        renderInput={(params) => (
                                          <TextField {...params} placeholder="Select an option" sx={{ marginTop: 1 }} />
                                        )}
                                        value={
                                          autoCompleteValueArr.length > 0 && autoCompleteValueArr[index]?.index === index
                                            ? autoCompleteValueArr[index].value
                                            : item.options[0]
                                        }
                                        onChange={(event, value) => {
                                          if (value) {
                                            handleAutocompleteValueChange(value, index);
                                            handleInputChange({ target: { name: item.question_val, value } }, index);
                                          }
                                        }}
                                        getOptionLabel={(option) => option}
                                      />
                                    </>
                                  ) : (
                                    /* Display text field */
                                    <TextField
                                      fullWidth
                                      name={item.question_val}
                                      placeholder="Enter answer"
                                      sx={{ marginTop: 1 }}
                                      onChange={(event) => {
                                        handleInputChange(event, index);
                                      }}
                                    />
                                  )}
                                </Grid>
                              </React.Fragment>
                            );
                          })}
                      </Grid>
                      {Object.keys(id).length > 0 && isTemp && (
                        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2.5 }}>
                          <Button type="submit" variant="contained" disabled={Boolean(isWaiting === true)}>
                            {isWaiting === true ? 'Loading...' : 'Generate'}
                          </Button>
                        </Stack>
                      )}
                    </>
                  ) : (
                    <>
                      <Grid>
                        <InputLabel sx={{ color: theme.palette.common.black }}>
                          <b>Prompt :</b>
                        </InputLabel>

                        <TextField
                          multiline
                          fullWidth
                          value={prompt}
                          variant={'standard'}
                          InputProps={{
                            readOnly: true,
                            disableUnderline: true
                          }}
                          sx={{ marginTop: '10px' }}
                        />
                      </Grid>
                      <Stack  style={{ marginTop: '10px' }}>
                        <InputLabel sx={{ color: theme.palette.common.black }}>
                          <b>Count of Images : </b> {parseInt(numValue)}
                        </InputLabel>
                      </Stack>
                      <Stack style={{ marginTop: '20px' }}>
                        <InputLabel sx={{ color: theme.palette.common.black }}>
                          <b>Size : </b> {selectedValue}
                        </InputLabel>
                      </Stack>
                    </>
                  )}
                </form>

                {showPopup && (
                  <Dialog
                    fullScreen={false} // Set to `true` for full screen dialog
                    open={showPopup}
                    aria-labelledby="responsive-dialog-title"
                  >
                    <DialogContent>
                      <DialogContentText align="center" style={{ padding: '20px' }}>
                        <b>Patience please!</b> Our AI is currently sprinkling some stardust on your image.
                        <br />
                        We’ll be back in a minute with some magic.
                      </DialogContentText>
                    </DialogContent>
                  </Dialog>
                )}
              </MainCard>
            </Grid>
            <Grid item xs={12} lg={6}>
              <MainCard title="AI Generated Image ">
                {!isLoading && imageGeneratedResponse.length === 0 && (
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <ImageOutlinedIcon sx={{ fontSize: 400 }} />
                  </Stack>
                )}
                {imageGeneratedResponse.length > 0 && (
                  <>
                    <Slider 
                    {...settings}
                     afterChange={(index) => setCurrentSlide(index)}
                     >
                      {imageGeneratedResponse?.map((item, index) => {
                        return (
                          <React.Fragment key={index}>
                            <Stack alignItems="center" justifyContent="center">
                              <img
                                src={item.imgSrc}
                                alt="generated"
                                style={{ height: newHeight === true ? '420px' : '', maxHeight: '420px' }}
                              />
                            </Stack>
                          </React.Fragment>
                        );
                      })}
                    </Slider>
                    <Stack
                              direction="row"
                              style={{ marginTop: '80px', marginBottom: '30px' }}
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <IconButton
                                title="Download"
                                sx={{
                                  backgroundColor: '#753CEF',
                                  '&:hover': {
                                    backgroundColor: '#753CEF'
                                  }
                                }}
                                onClick={() => handleDownload(imageGeneratedResponse[currentSlide]?.imgSrc)}
                              >
                                <VerticalAlignBottom sx={{ color: '#fff' }} />
                              </IconButton>
                              <Typography align="right" style={{ marginTop: '20px' }}>
                                Generated By - {capitalizeString(aiModel)}
                              </Typography>
                            </Stack>
                  </>
                )}
              </MainCard>
            </Grid>
          </Grid>
        </>
      )}
        </>)}
     
    </>
  );
};

export default ImageGeneration;
