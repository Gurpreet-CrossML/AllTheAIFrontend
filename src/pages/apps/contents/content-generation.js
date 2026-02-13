import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTheme } from '@mui/material/styles';
import {
  CircularProgress,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Backdrop,
  DialogActions,
  Tooltip,
  Avatar,
  FormHelperText,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  IconButton
} from '@mui/material';
import toast from 'utils/ToastNotistack';
import MainCard from 'components/MainCard';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { generateNewContent, getTemplateConfig, updateContent } from '_api/contents';
import '../../apps/contents/content.css';
import { Reply } from '@mui/icons-material';
import { ALLTHEAI } from 'config';
import saveAs from 'save-as';
import { stateToHTML } from 'draft-js-export-html';
import '../../apps/contents/content.css';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './content.scss';
import { StaticDateTimePicker } from '@mui/x-date-pickers';
import { error429 } from 'pages/maintenance/ErrorMessage';
import { activePersonna, personaOption, personaSearchRecord } from '_api/personna';
/**
 * Importing Dynamic icons for solid , brands, regular
 */
const solid = (iconName) => ({ prefix: 'fas', iconName });
const brands = (iconName) => ({ prefix: 'fab', iconName });

library.add(fas, far, fab);

const ContentGeneration = () => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();

  /*Initializations and Declarations */
  const [showPopup, setShowPopup] = useState(false);

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [formData, setFormData] = useState({});
  const [generatedData, setGeneratedData] = useState([]);
  const [generatedDataContent, setDataFromGeneratedContent] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [personnaContent, setPersonnaContent] = useState([]);
  const [value, setValue] = useState(null);
  const [isStatic, setIsStatic] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [socilProfile, setSocilProfile] = useState([]);

  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [isPublishNowEnabled, setIsPublishNowEnabled] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [scheduleConfirmationModal, setScheduleConfirmationModal] = useState(false);
  const minDate = new Date();
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const contentState = editorState.getCurrentContent();
  const contentBlocks = contentState.getBlocksAsArray();

  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [openExportButtonMenu, setOpenExportButtonMenu] = React.useState(false);
  const [imageError, setImageError] = React.useState('');
  const [rateLimit, setRateLimit] = useState(false);
  const [contentLimit, setContentLimit] = useState(false);

  const anchorRef = React.useRef(null);

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(openExportButtonMenu);
  React.useEffect(() => {
    if (prevOpen.current === true && openExportButtonMenu === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = openExportButtonMenu;
  }, [openExportButtonMenu]);

  /**
   * @method [openModal] use to open the modal for the share popup
   */
  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken == null) {
      navigate('/auth/login');
    }
    document.title = `Content Generate | ${ALLTHEAI}`;
    getPersonnaDetail();
  }, [id]);

  /**
   * @method [getPersonnaDetails] use to getPersonna Details and for the dropdown as well
   */
  const getPersonnaDetail = async () => {
    try {
      const response = await personaOption();
      setPersonnaContent(response.data.data);
      setValue(response?.data?.data[0] || null);
    } catch (error) {
      if (error.response.status === 429) {
        setRateLimit(true);
        toast(error429, {
          variant: 'error'
        });
      }
    }
  };

  /**
   * @method [exportAsHTML] use to export the content in html format
   */
  const exportAsHTML = () => {
    const info = stateToHTML(editorState.getCurrentContent());
    const blob = new Blob([info]);
    saveAs(blob, `${formData?.template?.template_name}.html`);
    setOpenExportButtonMenu(false);
  };

  /**
   * @method [exportAsWord] use to export in word format
   */
  const exportAsWord = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const plainText = rawContent.blocks.map((block) => block.text).join('\n');
    const blob = new Blob([plainText]);
    saveAs(blob, `${formData?.template?.template_name}.docx`);
    setOpenExportButtonMenu(false);
  };

  /**
   * Calls after component renderes
   */
  useEffect(() => {
    getTheTemplateQueAns();
  }, [id]);

  /**
   * @method [getTheTemplateQueAns] to get the questions details
   */
  const getTheTemplateQueAns = () => {
    // Promise to fetch que ans
    setIsWaiting(true);
    getTemplateConfig(id).then(
      (response) => {
        setIsWaiting(false);
        setFormData(response.data.data);
      },
      (error) => {
        setIsWaiting(false);
        if (error.response.status === 400) {
          // Handle 400 Bad Request
          toast(error.response.data.message, {
            variant: 'error'
          });
          navigate('/templates');
        }
        if (error.response.status === 404) {
          navigate('*');
          setIsStatic(true);
        } else if (error.response.status === 429) {
          setRateLimit(true);
          toast(error429, {
            variant: 'error'
          });
        }
      }
    );
  };

  /**
   * @method [handleSubmit] use to handle the submit response for the content generated API
   * @param {Event} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (value === undefined || value === null) {
        return toast('Please add personas; there should at least be one persona.', { variant: 'error' });
      }

      if (generatedData?.length === 0) {
        formData?.configs?.map((object) => {
          let demo = Object.assign(object, {
            question_val: object?.question_val,
            value: ''
          });
          generatedData.push(demo);
          setGeneratedData([...generatedData]);
        });
      } else {
        for (let i = 0; i < generatedData.length; i++) {
          delete generatedData[i]['template_name'];

          if (generatedData[i]['value'] === undefined) {
            generatedData[i]['value'] = '';
          }
          delete generatedData[i]['default_value'];
        }
      }

      const params = {
        template: id,
        parameters: generatedData,
        persona_id: value?.persona_id
      };

      setIsDisabled(true);
      setShowPopup(true);

      // Promise For Content Generate
      const response = await generateNewContent(params);

      setDataFromGeneratedContent(response?.data?.data);
      const editableContent = convertFromRaw(response?.data?.data?.content[0]);
      setIsDisabled(false);
      setShowPopup(false);
      setImageError('');

      // Success Message
      toast(response.data.message, { variant: 'success' });

      setTimeout(() => {
        setEditorState(EditorState.createWithContent(editableContent));
      }, 500);
    } catch (error) {
      setIsDisabled(false);
      setShowPopup(false);
      setImageError('');

      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/auth/login'); // Redirect to the login page if the token is invalid
      } else if (error.response && error.response.status === 429) {
        setContentLimit(true);
        toast(error429, {
          variant: 'error'
        });
      } else {
        toast(error.response?.data?.message, { variant: 'error' });
      }
    }
  };

  /**
   *
   * @param {Object} event
   * @param {Number} index
   */
  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    const updatedFormData = formData?.configs?.map((object, i) => {
      if (i === index) {
        return Object.assign(object, {
          question_val: name,
          value: value
        });
      } else {
        return object;
      }
    });
    setGeneratedData(updatedFormData);
  };

  /**
   * @method [saveAsDraft] use to save as the draft
   */
  const saveAsDraft = async () => {
    try {
      // Change the editor content in a format to give it to the API
      const contentState = editorState.getCurrentContent();
      const contentStateRaw = convertToRaw(contentState);

      let newArr = [];
      if (Object.keys(generatedDataContent).length > 0) {
        newArr = generatedDataContent.parameters;
      } else {
        newArr = generatedData;
      }

      const params = {
        template: id,
        parameters: newArr,
        content: { 0: contentStateRaw },
        status: 'draft'
      };
      setIsWaiting(true);
      const response = await updateContent(generatedDataContent.content_id, params);
      setIsWaiting(false);
      toast(response.data.message, { variant: 'success' });
    } catch (error) {
      setIsWaiting(false);
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/auth/login'); // Redirect to the login page if the token is invalid
      } else if (error.response && error.response.status === 429) {
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
  };

  /**
   * @method [handleSearch] use to handle the search
   * @param {Event} event
   */
  const handleSearch = async (event) => {
    if (personnaContent.length === 0) {
      toast("You don't have listed any persona yet. Please add to continue", { variant: 'error' });
      return;
    }
    let searchRecord;
    if (event) {
      if (event.target.value.length > 0) {
        searchRecord = event.target.value;
      }
      if (searchRecord !== undefined) {
        personaSearchRecord(searchRecord).then((response) => {
          setPersonnaContent(response.data.data);
        });
      } else {
        await activePersonna().then((response) => {
          setPersonnaContent(response.data.data);
          setValue(response.data.data[0]);
        });
      }
    }
  };

  /**
   * @method [isContentEmpty] use to disbale Publish Button when editor is empty
   */
  const isContentEmpty = () => {
    const contentState = editorState.getCurrentContent();
    const contentText = contentState.getPlainText().trim();
    return contentText.length === 0;
  };

  // publish content
  const renderedContent = contentBlocks.map((block, index) => <p key={index}>{block.getText()}</p>);

  const handleViewModalOpen = async (social_platform) => {
    setSelectedProfile(social_platform);
    setViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
  };
  const getCurrentDate = () => {
    const currentDate = new Date();
    // You can customize the date format using options like 'weekday', 'year', 'month', 'day', etc.
    const formattedDate = currentDate.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return formattedDate;
  };

  const CustomView = ({ profile }) => (
    <Grid container spacing={2}>
      <Grid item>
        <Avatar src={profile?.picture} alt={profile?.username} />
      </Grid>
      <Grid item>
        <div>
          <Typography variant="subtitle1">{profile.username}</Typography>
          <Typography variant="body2" color="textSecondary">
            {getCurrentDate()}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">{renderedContent}</Typography>
      </Grid>
    </Grid>
  );

  /**
   * @method [publishContent] to publish the content to the Respective handle
   */
  const publishContent = async () => {
    setIsWaiting(true);
    setSelectedDateTime(null);
    setIsPublishNowEnabled(false);
    try {
      const response = await socialMediaConnected();
      setIsWaiting(false);
      setSocilProfile(response?.data?.data);
      setIsModalOpen(true);
    } catch (error) {
      setIsWaiting(false);
      if (error.response.status === 404) {
        setError(true);
        // Handle 400 Bad Request
        toast(error.response.data.message, {
          variant: 'error'
        });
      }
    }
  };

  const handleDateTimeChange = (date) => {
    const dateTimeValue = date;
    setSelectedDateTime(dateTimeValue);

    // Enable the "Publish Now" button when a date and time are selected
    setIsPublishNowEnabled(!!dateTimeValue);
  };

  const handleConfirmPublish = async (social_platform) => {
    if (!isPublishNowEnabled) {
      setSelectedProfile(social_platform);
      setOpenConfirmationModal(true);
    }
  };

  const handleCloseConfirmationModal = () => {
    setOpenConfirmationModal(false);
  };

  const handlePublishNowClick = async (social_platform) => {
    // Check if the "Publish Now" button is enabled
    if (!isPublishNowEnabled) {
      // Make an API call here
      // Prepare the data to send in the request
      const requestData = {
        generated_content_id: generatedDataContent.content_id,
        social_platform: social_platform.social_platform_id
      };

      socialPost(requestData)
        .then((response) => {
          // Handle the response as needed
          toast(response.data.message, { variant: 'success' });
          navigate('/content-history');
        })
        .catch((error) => {
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
          }
        });
    }
  };

  const handleConfirmSchedule = async (social_platform) => {
    if (!isPublishNowEnabled) {
      setSelectedProfile(social_platform);
      setScheduleConfirmationModal(true);
    }
  };

  const handleCloseScheduleConfirmationModal = () => {
    setScheduleConfirmationModal(false);
  };

  const handleScheduleLaterClick = async (social_platform) => {
    // Check if the "Publish Now" button is enabled
    if (isPublishNowEnabled) {
      // Prepare the data to send in the request
      const requestData = {
        generated_content_id: generatedDataContent.content_id,
        social_platform: social_platform.social_platform_id,
        start: selectedDateTime,
        end: selectedDateTime,
        title: formData?.template?.template_name,
        color: '#FFFFFF'
      };
      schedulePost(requestData);
      setIsWaiting(true)
        .then((response) => {
          // Handle the response as needed
          setIsWaiting(false);
          toast(response.data.message, { variant: 'success' });
          navigate('/content-history');
        })
        .catch((error) => {
          // Handle any errors that may occur during the request
          setIsWaiting(false);
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
        });
    }
  };

  const openConfirmationDialog = () => {
    setConfirmationOpen(true);
  };

  const handleVerifiedClick = async () => {
    openConfirmationDialog();
  };

  const closeConfirmationDialog = () => {
    setConfirmationOpen(false);
  };

  const verifiedContent = async () => {
    try {
      // Change the editor content in a format to give it to the API
      const contentState = editorState.getCurrentContent();
      const contentStateRaw = convertToRaw(contentState);

      // Remove unnecessary fields
      let newArr = [];
      if (Object.keys(generatedDataContent).length > 0) {
        newArr = generatedDataContent.parameters;
      } else {
        newArr = generatedData;
      }

      const params = {
        template: id,
        parameters: newArr,
        content: { 0: contentStateRaw },
        status: 'verified'
      };

      // Set isWaiting to true before making the API call
      setIsWaiting(true);

      // Make the API call to update content
      const response = await updateContent(generatedDataContent.content_id, params);

      // Set isWaiting to false after receiving the response
      setIsWaiting(false);

      // Handle the response
      toast(response.data.message, {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
          variant: 'success'
        }
      });
      navigate('/content-history');
    } catch (error) {
      // Set isWaiting to false in case of an error
      setIsWaiting(false);

      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/content-history');
      }

      // Handle the error response
      toast(error.response.data.message, {
        variant: 'error'
      });
    }
  };

  const handleToggle = () => {
    setOpenExportButtonMenu((prevOpen) => !prevOpen);
  };

  const handleCloseExportBtnMenu = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpenExportButtonMenu(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpenExportButtonMenu(false);
    } else if (event.key === 'Escape') {
      setOpenExportButtonMenu(false);
    }
  };

  const limitImagesError = () => {
    return imageError.length > 0;
  };

  const _uploadImageCallBack = (file) => {
    let fileSize = file.size / 1024 / 1024;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      if (!file.type.includes('image')) {
        setImageError('Please upload a valid image file.');
      } else if (fileSize > 4) {
        setImageError('Selected image exceeds 4MB size limit.');
      } else {
        if (fileSize < 4 && file.type.includes('image')) {
          reader.onload = () => {
            const dataURL = reader.result;
            const truncatedDataURL = dataURL.substring(10, 30) + '...'; // set the maximum length of the truncated string
            resolve({ data: { link: dataURL }, link: { url: truncatedDataURL } });
          };
        } else {
          reader.onerror = (error) => {
            reject(error);
          };
        }
      }
    });
  };

  const isButtonDisabled = isContentEmpty() || generatedDataContent?.status === 'verified' || generatedDataContent?.status === 'published';

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography>{''}</Typography>
        <Button
          variant="contained"
          onClick={() => {
            navigate('/templates');
          }}
          startIcon={<Reply />}
        >
          Back
        </Button>
      </Stack>
      {!isStatic && (
        <>
          <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isWaiting === true}>
            <CircularProgress color="inherit" />
          </Backdrop>
          {!contentLimit && (
            <>
              <Grid container>
                <Grid item lg={12} sm={6} xs={12}>
                  <Stack direction="column" spacing="1">
                    <Grid item xs={12}>
                      <Stack direction="row" spacing="2">
                        <Grid item xs={1.5} sm={1.5} md={1.5} lg={0.5}>
                          <FontAwesomeIcon icon={solid(formData?.template?.template_icon)} size="3x" />
                          <FontAwesomeIcon icon={brands(formData?.template?.template_icon)} size="3x" />
                        </Grid>

                        <Grid item xs={10.5} sm={10.5} md={10.5} lg={11.5}>
                          <Typography variant="h3" mt={1}>
                            {formData?.template?.template_name}
                          </Typography>
                        </Grid>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1" color="secondary" mb={2}>
                        {formData?.template?.template_description}
                      </Typography>
                    </Grid>
                  </Stack>
                </Grid>
                {/* Personna Dropdown */}
                {!rateLimit && (
                  <>
                    <Grid item lg={12} sm={6} xs={12} alignItems={'flex-end'} justifyContent="flex-end" marginBottom={2}>
                      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
                        <Typography variant="h5" sx={{ color: 'text.primary' }}>
                          <strong>Persona Profile</strong>{' '}
                        </Typography>
                        <Autocomplete
                          style={{ width: '15%' }}
                          options={Array.isArray(personnaContent) ? personnaContent.filter((option) => option != null) : []}
                          onInputChange={(event, newValue) => {
                            if (!newValue) {
                              handleSearch(newValue);
                            }
                          }}
                          getOptionLabel={(option) => option?.name}
                          value={value}
                          onChange={(event, newValue) => {
                            setValue(newValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {personnaContent.length > 0 && (
                                      <IconButton
                                        aria-label="clear"
                                        onClick={() => {
                                          setValue(null);
                                        }}
                                      >
                                        {/* <ClearIcon /> */}
                                      </IconButton>
                                    )}
                                    {params.InputProps.endAdornment}
                                  </>
                                )
                              }}
                            />
                          )}
                        />
                      </Stack>
                    </Grid>
                  </>
                )}
              </Grid>
              {Object.keys(formData).length > 0 && (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={6}>
                      <MainCard title="Tell AI what to write about">
                        <form onSubmit={handleSubmit}>
                          {formData?.configs?.length > 0 &&
                            formData?.configs?.map((item, index) => {
                              return (
                                <React.Fragment key={index}>
                                  <Grid item xs={12} marginBottom={3} marginTop={2}>
                                    <Typography variant="subtitle1" sx={{ color: theme.palette.common.black, marginBottom: 1 }}>
                                      <b>Q:-</b> {item.question_val}
                                    </Typography>
                                    <TextField
                                      fullWidth
                                      name={item.question_val}
                                      placeholder="Enter answer"
                                      onChange={(event) => {
                                        handleInputChange(event, index);
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Divider />
                                  </Grid>
                                </React.Fragment>
                              );
                            })}
                          {formData?.configs?.length > 0 && (
                            <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2.5 }}>
                              <Button disabled={Boolean(isDisabled === true)} type="submit" variant="contained">
                                {isDisabled === true ? 'Please Wait...' : 'Generate'}
                              </Button>
                            </Stack>
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
                                <b>Patience please!</b> Our AI is currently sprinkling some stardust on your content.
                                <br />
                                We’ll be back in a minute with some magic.
                              </DialogContentText>
                            </DialogContent>
                          </Dialog>
                        )}
                      </MainCard>
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      lg={6}
                      sx={{
                        '& .rdw-editor-wrapper': {
                          bgcolor: theme.palette.background.paper,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          borderRadius: '4px',
                          overflow: 'hidden',
                          '& .rdw-editor-main': {
                            px: 2,
                            py: 0.5,
                            border: 'none'
                          },
                          '& .rdw-editor-toolbar': {
                            pt: 1.25,
                            border: 'none',
                            borderBottom: '1px solid',
                            borderColor: theme.palette.divider,
                            bgcolor: theme.palette.mode === 'dark' ? 'dark.light' : 'grey.50',
                            '& .rdw-option-wrapper': {
                              bgcolor: theme.palette.mode === 'dark' ? 'dark.light' : 'grey.50',
                              borderColor: theme.palette.divider
                            },
                            '& .rdw-dropdown-wrapper': {
                              bgcolor: theme.palette.mode === 'dark' ? 'dark.light' : 'grey.50',
                              borderColor: theme.palette.divider,
                              '& .rdw-dropdown-selectedtext': {
                                color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : 'grey.900'
                              },
                              '& .rdw-dropdownoption-default': {
                                color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : 'grey.900'
                              }
                            }
                          }
                        }
                      }}
                    >
                      <MainCard
                        className="content-generation-card-main"
                        sx={{ height: '100%' }}
                        title={
                          <div>
                            Generated Content
                            <Button
                              title="Action"
                              ref={anchorRef}
                              id="composition-button"
                              aria-controls={openExportButtonMenu ? 'composition-menu' : undefined}
                              aria-expanded={openExportButtonMenu ? 'true' : undefined}
                              aria-haspopup="true"
                              onClick={handleToggle}
                              sx={{ float: 'right', backgroundColor: 'transparent !important' }}
                              color="inherit"
                            >
                              <FontAwesomeIcon icon={solid('ellipsis-vertical')} size="1x" />
                            </Button>
                          </div>
                        }
                      >
                        <Popper
                          open={openExportButtonMenu}
                          anchorEl={anchorRef.current}
                          role={undefined}
                          placement="bottom-start"
                          transition
                          disablePortal
                          sx={{ 'z-index': '99' }}
                        >
                          {({ TransitionProps, placement }) => (
                            <Grow
                              {...TransitionProps}
                              style={{
                                transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom'
                              }}
                            >
                              <Paper>
                                <ClickAwayListener onClickAway={handleCloseExportBtnMenu}>
                                  <MenuList
                                    autoFocusItem={openExportButtonMenu}
                                    id="export-as-btn-composition-menu"
                                    aria-labelledby="composition-button"
                                    onKeyDown={handleListKeyDown}
                                  >
                                    <MenuItem
                                      onClick={exportAsHTML}
                                      disabled={isContentEmpty() || (generatedDataContent.length === 0 && true)}
                                    >
                                      Export as HTML
                                    </MenuItem>
                                    <MenuItem
                                      onClick={exportAsWord}
                                      disabled={isContentEmpty() || (generatedDataContent.length === 0 && true)}
                                    >
                                      Export as Word
                                    </MenuItem>
                                  </MenuList>
                                </ClickAwayListener>
                              </Paper>
                            </Grow>
                          )}
                        </Popper>

                        <Editor
                          editorStyle={{ height: 350, margin: 12, borderWidth: 0.5, padding: 10, borderRadius: '2px' }}
                          editorState={editorState}
                          onEditorStateChange={setEditorState}
                          onContentStateChange={() => {
                            const contentState = editorState.getCurrentContent();
                            const contentStateRaw = convertToRaw(contentState);

                            let imgArray = Object.keys(contentStateRaw.entityMap);

                            if (imgArray && imgArray.length > 5) {
                              setImageError('Exceeded limit, please choose up to 5 images only.');
                            } else {
                              setImageError('');
                            }
                          }}
                          toolbarHidden={isContentEmpty() || (generatedDataContent.length === 0 && true) ? true : false}
                          toolbar={{
                            image: {
                              urlEnabled: true,
                              uploadEnabled: true,
                              uploadCallback: _uploadImageCallBack,
                              previewImage: true,
                              inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                              defaultSize: {
                                height: '500px',
                                width: '500px'
                              }
                            },
                            options: [
                              'inline',
                              'blockType',
                              'fontSize',
                              'fontFamily',
                              'list',
                              'textAlign',
                              'link',
                              'emoji',
                              'image',
                              'remove',
                              'history'
                            ],
                            list: { inDropdown: true },
                            textAlign: { inDropdown: true },
                            inline: {
                              options: ['bold', 'italic', 'underline', 'strikethrough']
                            }
                          }}
                        />

                        {imageError && <FormHelperText sx={{ color: '#F04134', float: 'left' }}>{imageError}</FormHelperText>}

                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="flex-end"
                          alignItems="center"
                          spacing={2}
                          sx={{ mt: 2.5, top: 0, right: 0, left: 0, position: 'relative' }}
                        >
                          <Button
                            variant="contained"
                            color="secondary"
                            disabled={isContentEmpty() || (generatedDataContent.length === 0 && true) || limitImagesError()}
                            onClick={saveAsDraft}
                          >
                            Save as Draft
                          </Button>

                          <Button
                            type="submit"
                            variant="contained"
                            disabled={isButtonDisabled || (generatedDataContent.length === 0 && true) || limitImagesError()}
                            onClick={handleVerifiedClick}
                          >
                            Verify
                          </Button>

                          <Dialog open={isConfirmationOpen} onClose={closeConfirmationDialog}>
                            <DialogTitle>Confirm Verification</DialogTitle>
                            <DialogContent>
                              Are you sure you want to verify the content? After verification, you cannot edit this content.
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={closeConfirmationDialog} color="primary">
                                Cancel
                              </Button>
                              <Button onClick={verifiedContent} color="primary">
                                Confirm
                              </Button>
                            </DialogActions>
                          </Dialog>

                          {!isButtonDisabled && generatedDataContent.length === 0 && generatedDataContent.length > 0 && (
                            <Button
                              type="submit"
                              onClick={() => publishContent(eventsHistory.template_info?.template_name)}
                              disabled={isContentEmpty() || (generatedDataContent.length === 0 && true)}
                            >
                              Publish
                            </Button>
                          )}

                          <Dialog
                            open={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            fullWidth={true} // Make the modal full width
                            maxWidth="lg" // Set to 'lg' for full width
                          >
                            <DialogTitle sx={{ fontSize: '1.5rem', height: '75px' }}>
                              Choose your integration
                              <Typography variant="body1" color="secondary" style={{ marginTop: '8px' }}>
                                {' '}
                                No social media platforms are currently integrated into the system.
                              </Typography>
                              <Typography variant="h5">
                                {' '}
                                {socilProfile.length > 0 && (
                                  <span style={{ fontSize: '0.8rem', marginLeft: '8px' }}>
                                    {socilProfile.length} {socilProfile.length === 1 ? 'profile connected' : 'profiles connected'}
                                  </span>
                                )}
                              </Typography>
                            </DialogTitle>

                            <DialogContent>
                              {socilProfile && (
                                <Grid container spacing={3}>
                                  {socilProfile.map((profile, index) => (
                                    <Grid item xs={12} sm={6} md={3} lg={3} key={index}>
                                      {' '}
                                      {/* Add key prop here */}
                                      <MainCard
                                        style={{
                                          height: '140px',
                                          backgroundColor: 'rgba(114, 100, 230, 0.13)',
                                          boderColor: 'rgba(114, 100, 230, 0.13)'
                                        }}
                                        shadow="none"
                                        boxShadow
                                        sx={{
                                          mt: 2,
                                          borderRadius: '10px'
                                        }}
                                      >
                                        <Stack spacing={1}>
                                          <Grid container>
                                            <Grid
                                              item
                                              xs={12}
                                              sm={6}
                                              md={2}
                                              container
                                              direction="column"
                                              alignItems="center"
                                              justifyContent="center"
                                            >
                                              <FontAwesomeIcon icon={solid(profile?.social_platform_icon)} size="3x" />
                                              <FontAwesomeIcon icon={brands(profile?.social_platform_icon)} size="3x" />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={10} pl={2}>
                                              <Stack direction="column" alignItems="left">
                                                <Typography variant="h5">{profile?.social_platform_name}</Typography>
                                                <Typography variant="h6">@{profile?.username}</Typography>
                                              </Stack>
                                            </Grid>

                                            <Grid
                                              item
                                              xs={12}
                                              sm={12}
                                              md={3}
                                              lg={3}
                                              mt={4}
                                              style={{ display: 'flex', justifyContent: 'flex-start' }}
                                            >
                                              <Tooltip title="View">
                                                <VisibilityIcon
                                                  color="dark"
                                                  onClick={() => handleViewModalOpen(profile)}
                                                  style={{ fontSize: '1.6rem', cursor: !isPublishNowEnabled ? 'pointer' : 'allowed' }}
                                                />
                                              </Tooltip>

                                              <Tooltip title="Schedule For Later">
                                                <ScheduleIcon
                                                  color="primary"
                                                  onClick={() => handleConfirmSchedule(profile)}
                                                  style={{ marginLeft: '11px', cursor: !isPublishNowEnabled ? 'pointer' : 'allowed' }}
                                                />
                                              </Tooltip>

                                              <Tooltip title="Publish Now">
                                                <TaskAltIcon
                                                  color="success"
                                                  onClick={() => handleConfirmPublish(profile)}
                                                  style={{ marginLeft: '11px', cursor: !isPublishNowEnabled ? 'pointer' : 'allowed' }}
                                                />
                                              </Tooltip>
                                            </Grid>
                                          </Grid>
                                        </Stack>
                                      </MainCard>
                                    </Grid>
                                  ))}
                                </Grid>
                              )}
                            </DialogContent>
                            <DialogActions mt={4} sx={{ marginBottom: '10px', marginRight: '42px' }}>
                              <Button onClick={() => setIsModalOpen(false)} color="secondary">
                                Cancel
                              </Button>
                            </DialogActions>
                          </Dialog>

                          <Dialog open={scheduleConfirmationModal} onClose={handleCloseScheduleConfirmationModal}>
                            <DialogTitle>
                              Select Date & Time
                              <span style={{ color: 'red' }}>*</span>
                            </DialogTitle>
                            <DialogContent>
                              <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <StaticDateTimePicker
                                  value={selectedDateTime}
                                  onChange={handleDateTimeChange}
                                  renderInput={(params) => (
                                    <>
                                      <TextField {...params} InputProps={{ sx: { borderColor: 'black' } }} />
                                      <FormHelperText>{error}</FormHelperText>
                                    </>
                                  )}
                                  minDate={minDate}
                                  componentsProps={{ actionBar: { actions: [] } }}
                                />
                              </LocalizationProvider>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleCloseScheduleConfirmationModal} color="primary">
                                Cancel
                              </Button>
                              <Button onClick={() => handleScheduleLaterClick(selectedProfile)} color="primary">
                                Schedule
                              </Button>
                            </DialogActions>
                          </Dialog>

                          <Dialog open={openConfirmationModal} onClose={handleCloseConfirmationModal}>
                            <DialogTitle>Confirmation</DialogTitle>
                            <DialogContent>Are you sure you want to publish now?</DialogContent>
                            <DialogActions>
                              <Button onClick={handleCloseConfirmationModal} color="primary">
                                Cancel
                              </Button>
                              <Button onClick={() => handlePublishNowClick(selectedProfile)} color="primary">
                                Confirm
                              </Button>
                            </DialogActions>
                          </Dialog>

                          <Dialog open={isViewModalOpen} onClose={handleViewModalClose}>
                            <DialogContent>
                              <CustomView profile={selectedProfile} />
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleViewModalClose} color="primary">
                                Cancel
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </Stack>
                      </MainCard>
                    </Grid>
                  </Grid>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default ContentGeneration;
