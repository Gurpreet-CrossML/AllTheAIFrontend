import {
  Grid,
  Typography,
  Divider,
  TextField,
  CardContent,
  Box,
  LinearProgress,
  Stack,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Backdrop,
  DialogActions,
  Tooltip,
  Avatar,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  Popper,
  Grow,
  Paper,
  Link,
  ClickAwayListener,
  MenuList
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { useTheme } from '@mui/material/styles';
import { getEventsHistory, updateContent, copyGeneratedContent, socialMediaConnected } from '_api/contents';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router';
import MainCard from 'components/MainCard';
import SimpleBar from 'simplebar-react';
import { capitalizeString } from 'config';
import { Reply } from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import toast from 'utils/ToastNotistack';
import { ALLTHEAI } from 'config';
import saveAs from 'save-as';
import { stateToHTML } from 'draft-js-export-html';
import '../../apps/contents/content.css';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { useMediaQuery } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './content.scss';
import { StaticDateTimePicker } from '@mui/x-date-pickers';
import { error429 } from 'pages/maintenance/ErrorMessage';
import { facebookPage, instagramPage } from '_api/endpoint';
import { createSocialPost, getMetaPages, schedulePost } from '_api/social-account';
import { Link as RouterLink } from 'react-router-dom';
/**

 * Importing Dynamic icons for solid , brands, regular
 */
const solid = (iconName) => ({ prefix: 'fas', iconName });
const brands = (iconName) => ({ prefix: 'fab', iconName });

library.add(fas, far, fab);

const ContentEvents = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [eventsHistory, setEventsHistory] = useState({});
  const [isStatic, setIsStatic] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [socilProfile, setSocilProfile] = useState([]);

  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [isPublishNowEnabled, setIsPublishNowEnabled] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openMetaConfirmationModal, setMetaOpenConfirmationModal] = useState(false);

  const [scheduleConfirmationModal, setScheduleConfirmationModal] = useState(false);
  const [scheduleMetaConfirmationModal, setScheduleMetaConfirmationModal] = useState(false);

  const minDate = new Date();
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const contentState = editorState.getCurrentContent();
  const contentBlocks = contentState.getBlocksAsArray();
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

  const [showFacebookPageDropDown, setShowFacebookPageDropDown] = useState(false);
  const [showInstagramPageDropDown, setShowInstagramPageDropDown] = useState(false);

  const [facebookPages, setFacebookPages] = useState([]);
  const [selectedFacebookPage, setSelectedFacebookPage] = useState('');
  const [selectedMetaAccount, setSelectedMetaAccount] = useState('facebook');
  const [openExportButtonMenu, setOpenExportButtonMenu] = React.useState(false);
  const [imageError, setImageError] = React.useState('');
  const [rateLimit, setRateLimit] = useState(false);
  const [connectedLimit, setConnectedLimit] = useState(false);

  const [loader, setLoader] = useState(false);

  const anchorRef = React.useRef(null);

  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(openExportButtonMenu);
  React.useEffect(() => {
    if (prevOpen.current === true && openExportButtonMenu === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = openExportButtonMenu;
  }, [openExportButtonMenu]);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken == null) {
      navigate('/auth/login');
    }
    document.title = `Content Events History | ${ALLTHEAI}`;
    getHistory();
  }, [id]);

  /**
   * @method [getHistory] use to get the history of the Particular event
   */
  const getHistory = () => {
    setIsWaiting(true);

    getEventsHistory(id)
      .then((response) => {
        setIsWaiting(false);
        setEventsHistory(response?.data?.data);
      })
      .catch((error) => {
        setIsWaiting(false);
        if (error.response) {
          setIsStatic(true);
          if (error.response.status === 401) {
            localStorage.clear();
            navigate('/auth/login');
          } else if (error.response.status === 404) {
            navigate('*');
            setIsStatic(true);
          } else if (error.response.status === 429) {
            setRateLimit(true);
            toast(error429, {
              variant: 'error'
            });
          } else {
            toast(error.response.data.message, {
              variant: 'error'
            });
            navigate('/content-history');
          }
        }
      });
  };

  /**
   *useEffect calls when eventHistory creates content
   */
  useEffect(() => {
    setTimeout(() => {
      if (eventsHistory && eventsHistory.content && eventsHistory.content['0']) {
        const editableContent = convertFromRaw(eventsHistory.content['0']);
        setEditorState(EditorState.createWithContent(editableContent));
      }
    }, 500);
  }, [eventsHistory]);

  const saveAsDraft = () => {
    setIsWaiting(true);
    /* Change the editor content in a format to give it to the API */
    const contentState = editorState.getCurrentContent();
    const contentStateRaw = convertToRaw(contentState);

    const params = {
      template: eventsHistory?.template_info.template_id,
      parameters: eventsHistory.parameters,
      content: { 0: contentStateRaw },
      status: 'draft'
    };

    updateContent(id, params)
      .then((response) => {
        setIsWaiting(false);
        toast(response.data.message, { variant: 'success' });
      })
      .catch((error) => {
        setIsWaiting(false);
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
  };
  /**
   * @method [exportAsHTML] use to export the content in html format
   */
  const exportAsHTML = () => {
    const info = stateToHTML(editorState.getCurrentContent());
    const blob = new Blob([info]);
    saveAs(blob, `${eventsHistory.template_info?.template_name}.html`);
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
    saveAs(blob, `${eventsHistory.template_info?.template_name}.docx`);
    setOpenExportButtonMenu(false);
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
      if (error.response.status === 429) {
        setConnectedLimit(true);
        toast(error429, {
          variant: 'error'
        });
      } else if (error.response && error.response.status === 404) {
        setError(true);
        // Handle 400 Bad Request
        toast(error.response.data.message, {
          variant: 'error'
        });
      }
    }
  };

  const getMetaPagesAPI = (social_platform, account) => {
    let url;
    if (account === 'facebook') {
      url = facebookPage;
    } else {
      url = instagramPage;
    }
    getMetaPages(url, social_platform.social_platform_id)
      .then((response) => {
        let pagesData = response.data.data;
        setFacebookPages(pagesData);
        setSelectedFacebookPage(pagesData && pagesData.length && pagesData[0].id);
      })
      .catch(() => {
        setIsWaiting(false);
        if (error.response) {
          if (error.response.status === 401) {
            localStorage.clear();
            navigate('/auth/login');
          } else if (error.response.status === 429) {
            setConnectedLimit(true);
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

  const handleDateTimeChange = (date) => {
    const dateTimeValue = date;
    setSelectedDateTime(dateTimeValue);
    setError(false);

    // Enable the "Publish Now" button when a date and time are selected
    setIsPublishNowEnabled(!!dateTimeValue);
  };

  const handleConfirmPublish = async (social_platform) => {
    if (!isPublishNowEnabled) {
      setSelectedProfile(social_platform);
      if (social_platform.social_platform_name == 'meta') {
        setMetaOpenConfirmationModal(true);
        setShowFacebookPageDropDown(true);
        getMetaPagesAPI(social_platform, 'facebook');
      } else {
        setOpenConfirmationModal(true);
      }
    }
  };

  const handleCloseConfirmationModal = () => {
    setOpenConfirmationModal(false);
    setShowFacebookPageDropDown(false);
    setShowInstagramPageDropDown(false);
    setMetaOpenConfirmationModal(false);
    clearInputValues();
  };

  const handlePublishNowClick = async (social_platform) => {
    if (!isPublishNowEnabled) {
      try {
        const requestData = {
          generated_content_id: id,
          social_platform: social_platform.social_platform_id
        };

        if (selectedMetaAccount === 'facebook') {
          requestData.facebook_page_id = selectedFacebookPage;
        } else {
          requestData.instagram_business_account_id = selectedFacebookPage;
        }

        setLoader(true);

        const response = await createSocialPost(requestData);

        // Handle the response as needed
        toast(response.data.message, { variant: 'success' });
        navigate('/content-history');
      } catch (error) {
        setLoader(false);

        if (error.response) {
          toast(`${error.response.data.message}`, { variant: 'error' });
          if (error.response.status === 401) {
            localStorage.clear();
            navigate('/auth/login');
          } else if (error.response.status === 429) {
            setConnectedLimit(true);
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
    }
  };

  const handleConfirmSchedule = async (social_platform) => {
    if (!isPublishNowEnabled) {
      setSelectedProfile(social_platform);
      if (social_platform.social_platform_name == 'meta') {
        setScheduleMetaConfirmationModal(true);
        setScheduleConfirmationModal(false);
        setShowFacebookPageDropDown(true);
        getMetaPagesAPI(social_platform, 'facebook');
      } else {
        setScheduleConfirmationModal(true);
        setScheduleMetaConfirmationModal(false);
      }
    }
  };

  const handleCloseScheduleConfirmationModal = () => {
    setScheduleConfirmationModal(false);
    setScheduleMetaConfirmationModal(false);

    setIsPublishNowEnabled(false);
    selectedDateTime && setSelectedDateTime(null);
    setError(false);
    setShowFacebookPageDropDown(false);
    setShowInstagramPageDropDown(false);
    clearInputValues();
  };

  const clearInputValues = () => {
    setSelectedMetaAccount('facebook');
    setSelectedFacebookPage('');
    setFacebookPages([]);
  };

  const handleScheduleLaterClick = async (social_platform) => {
    if (selectedDateTime == '' || selectedDateTime == null) {
      setError(<span style={{ color: 'red' }}>This field may not be blank.</span>);
      return;
    }

    if (!isPublishNowEnabled) {
      return;
    }

    const requestData = {
      generated_content_id: id,
      social_platform: social_platform.social_platform_id,
      start: selectedDateTime,
      end: selectedDateTime,
      title: eventsHistory?.template_info?.template_name,
      color: '#FFFFFF'
    };

    if (selectedMetaAccount === 'facebook') {
      requestData.facebook_page_id = selectedFacebookPage;
    } else {
      requestData.instagram_business_account_id = selectedFacebookPage;
    }

    setLoader(true);

    try {
      const response = await schedulePost(requestData);
      setLoader(false);
      toast(response.data.message, { variant: 'success' });
      navigate('/content-history');
    } catch (error) {
      if (error.response && error.response.status === 429) {
        setConnectedLimit(true);
        setLoader(false);
        toast(error429, {
          variant: 'error'
        });
      } else if (error.response && error.response.status === 401) {
        setLoader(false);
        localStorage.clear();
        navigate('/auth/login');
      } else if (error.response) {
        setLoader(false);
        toast(`${error.response.data.message}`, { variant: 'error' });
      }
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
    /* Change the editor content in a format to give it to the API */
    const contentState = editorState.getCurrentContent();
    const contentStateRaw = convertToRaw(contentState);

    const params = {
      template: eventsHistory?.template_info.template_id,
      parameters: eventsHistory.parameters,
      content: { 0: contentStateRaw },
      status: 'verified'
    };
    setLoader(true);

    updateContent(id.trim(), params).then(
      (response) => {
        setLoader(false);
        setConfirmationOpen(false);
        toast(response.data.message, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
            variant: 'success'
          }
        });
        window.location.reload();
      },
      (error) => {
        setLoader(false);
        setConfirmationOpen(false);
        if (error.response.status == '401') {
          localStorage.clear();
          navigate('/auth/login'); // Redirect to the login page if the token is invalid
        }
        toast(error.response.data.message, { variant: 'error' });
      }
    );
  };

  const selectPageHandle = (e) => {
    setSelectedFacebookPage(e.target.value);
  };

  const handleMakeAsCopy = () => {
    const params = {};
    const url = `api/content_generation/duplicate_content/${id}/`;

    setIsWaiting(true);

    copyGeneratedContent(url, params)
      .then((response) => {
        setIsWaiting(false);
        toast(response.data.message, { variant: 'success' });
        navigate('/content-history');
      })
      .catch((error) => {
        setIsWaiting(false);
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

  const isButtonDisabled = isContentEmpty() || eventsHistory?.status === 'verified' || eventsHistory?.status === 'published';

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isWaiting === true}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {!rateLimit && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
            <Typography>{''}</Typography>
            <Button
              variant="contained"
              onClick={() => {
                navigate('/content-history');
              }}
              sx={{ marginBottom: 2 }}
              startIcon={<Reply />}
            >
              Back
            </Button>
          </Stack>

          <Grid item lg={6}>
            <Stack direction="column" spacing="1">
              <Grid item xs={6}>
                <Stack direction="row" spacing="2">
                  <Grid item xs={6} sm={6} md={6} lg={2}>
                    <FontAwesomeIcon icon={solid(eventsHistory.template_info?.template_icon)} size="3x" />
                    <FontAwesomeIcon icon={brands(eventsHistory.template_info?.template_icon)} size="3x" />
                  </Grid>
                  <Grid item xs={6} sm={6} md={6} lg={10}>
                    <Typography variant="h3" ml={2} mt={1}>
                      {eventsHistory.template_info?.template_name}
                    </Typography>
                  </Grid>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" color="secondary">
                  {eventsHistory.template_info?.template_description}
                </Typography>
              </Grid>
            </Stack>
            <Grid item xs={12}>
              {eventsHistory && eventsHistory.status && (
                <Typography align="right" variant="h5" color={eventsHistory.status === 'draft' ? '' : '#00A854'}>
                  <FontAwesomeIcon
                    icon={solid(eventsHistory.status === 'draft' ? 'file' : 'check')}
                    style={{ color: eventsHistory.status === 'draft' ? '' : '#00A854' }}
                    size="xs"
                  />
                  {` ${eventsHistory.status === 'draft' ? 'Draft' : 'Verified'}`}
                </Typography>
              )}
            </Grid>
          </Grid>
          {!isStatic && (
            <Grid container spacing={3}>
              {eventsHistory.length === 0 ? (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress />{' '}
                </Box>
              ) : (
                <>
                  <Grid item xs={12} lg={6}>
                    <MainCard title="Questions/Answers" sx={{ height: '100%' }}>
                      <form>
                        {eventsHistory?.parameters?.length > 0 &&
                          eventsHistory?.parameters?.map((item, index) => {
                            return (
                              <React.Fragment key={index}>
                                <Grid item xs={12} marginBottom={3} marginTop={2}>
                                  <Typography variant="subtitle1" sx={{ color: theme.palette.common.black, marginBottom: 1 }}>
                                    <b>Q:-</b> {item?.question_val}
                                  </Typography>
                                  <TextField
                                    fullWidth
                                    variant="standard"
                                    id="outlined-disabled"
                                    value={item?.value === '' ? '--' : item?.value}
                                    InputProps={{
                                      readOnly: true,
                                      disableUnderline: true
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Divider />
                                </Grid>
                              </React.Fragment>
                            );
                          })}
                      </form>
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
                    <Grid container>
                      <Grid item xs={12}>
                        <MainCard
                          className="content-generation-card-main"
                          sx={{ height: 'auto' }}
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
                                      <MenuItem onClick={exportAsHTML} disabled={isContentEmpty()}>
                                        Export as HTML
                                      </MenuItem>

                                      <MenuItem onClick={exportAsWord} disabled={isContentEmpty()}>
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
                            readOnly={eventsHistory?.status === 'published' || eventsHistory?.status === 'verified'}
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
                            toolbarHidden={isButtonDisabled ? true : false}
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

                          <Grid container>
                            <Grid item xs={12} sm={6} md={6} lg={6} mt={3}>
                              {imageError && <FormHelperText sx={{ color: '#F04134', float: 'left' }}>{imageError}</FormHelperText>}
                            </Grid>

                            <Grid item xs={12} sm={6} md={6} lg={6}>
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
                                  onClick={saveAsDraft}
                                  style={{ display: eventsHistory?.status === 'draft' ? 'block' : 'none' }}
                                  disabled={isContentEmpty() || limitImagesError()}
                                >
                                  Save as Draft
                                </Button>
                                {!isButtonDisabled && (
                                  <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isButtonDisabled || limitImagesError()}
                                    onClick={handleVerifiedClick}
                                  >
                                    Verify
                                  </Button>
                                )}

                                <Dialog open={isConfirmationOpen} onClose={closeConfirmationDialog}>
                                  <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader}>
                                    <CircularProgress color="inherit" />
                                  </Backdrop>
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

                                {isButtonDisabled && (
                                  <>
                                    <Button variant="contained" onClick={handleMakeAsCopy}>
                                      Make As Copy
                                    </Button>

                                    <Button type="submit" variant="contained" onClick={() => publishContent()}>
                                      Publish
                                    </Button>
                                  </>
                                )}

                                {!connectedLimit && socilProfile.length > 0 ? (
                                  <Dialog
                                    open={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                    fullWidth={true} // Make the modal full width
                                    maxWidth="lg" // Set to 'lg' for full width
                                  >
                                    <DialogTitle sx={{ fontSize: '1.5rem', height: isSmallScreen ? '110px' : '75px' }}>
                                      Choose your integration
                                      <Typography variant="h4">
                                        {' '}
                                        {socilProfile.length > 0 && (
                                          <span style={{ fontSize: '0.8rem', marginLeft: '8px', marginBottom: '40px' }}>
                                            {socilProfile.length} {socilProfile.length === 1 ? 'profile connected' : 'profiles connected'}
                                          </span>
                                        )}
                                      </Typography>
                                    </DialogTitle>

                                    <DialogContent>
                                      {socilProfile && (
                                        <Grid container spacing={3}>
                                          {socilProfile.map((profile, index) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                              <MainCard
                                                style={{
                                                  height: '140px',
                                                  backgroundColor: 'rgba(114, 100, 230, 0.13)',
                                                  borderColor: 'rgba(114, 100, 230, 0.13)'
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
                                                          style={{
                                                            fontSize: '1.6rem',
                                                            cursor: !isPublishNowEnabled ? 'pointer' : 'allowed'
                                                          }}
                                                        />
                                                      </Tooltip>

                                                      <Tooltip title="Schedule For Later">
                                                        <ScheduleIcon
                                                          color="dark"
                                                          onClick={() => handleConfirmSchedule(profile)}
                                                          style={{
                                                            marginLeft: '11px',
                                                            cursor: !isPublishNowEnabled ? 'pointer' : 'allowed'
                                                          }}
                                                        />
                                                      </Tooltip>

                                                      <Tooltip title="Publish Now">
                                                        <TaskAltIcon
                                                          color="dark"
                                                          onClick={() => handleConfirmPublish(profile)}
                                                          style={{
                                                            marginLeft: '11px',
                                                            cursor: !isPublishNowEnabled ? 'pointer' : 'allowed'
                                                          }}
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
                                    <DialogActions mt={4}>
                                      <Button onClick={() => setIsModalOpen(false)} color="primary">
                                        Cancel
                                      </Button>
                                    </DialogActions>
                                  </Dialog>
                                ) : (
                                  !connectedLimit && (
                                    <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                                      <DialogTitle sx={{ fontSize: '1.5rem', height: '75px' }}> Choose your integration</DialogTitle>
                                      <DialogContent>
                                        No social media platforms are currently integrated into the system Click{' '}
                                        <Link
                                          variant="h6"
                                          component={RouterLink}
                                          to="/social-media"
                                          color="#753CEF"
                                          style={{ cursor: 'pointer' }}
                                        >
                                          {' '}
                                          here
                                        </Link>{' '}
                                        to connect.
                                      </DialogContent>
                                      <DialogActions>
                                        <Button onClick={() => setIsModalOpen(false)} color="primary">
                                          Cancel
                                        </Button>
                                      </DialogActions>
                                    </Dialog>
                                  )
                                )}

                                <Dialog open={scheduleConfirmationModal} onClose={handleCloseScheduleConfirmationModal}>
                                  <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader}>
                                    <CircularProgress color="inherit" />
                                  </Backdrop>
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

                                {!connectedLimit && (
                                  <>
                                    <Dialog open={scheduleMetaConfirmationModal} onClose={handleCloseScheduleConfirmationModal}>
                                      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader}>
                                        <CircularProgress color="inherit" />
                                      </Backdrop>
                                      <DialogTitle>Select Your Business Profile</DialogTitle>
                                      <DialogContent>
                                        <FormControl>
                                          <RadioGroup
                                            sx={{ marginTop: '10px' }}
                                            row
                                            aria-labelledby="demo-row-radio-buttons-group-label"
                                            name="row-radio-buttons-group"
                                            value={selectedMetaAccount}
                                            onChange={(e) => {
                                              setSelectedMetaAccount(e.target.value);
                                              if (e.target.value === 'facebook') {
                                                setShowFacebookPageDropDown(true);
                                                setShowInstagramPageDropDown(false);
                                                getMetaPagesAPI(selectedProfile, 'facebook'); // Adjusted function call
                                              } else {
                                                setShowFacebookPageDropDown(false);
                                                setShowInstagramPageDropDown(true);
                                                getMetaPagesAPI(selectedProfile, 'instagram'); // Adjusted function call
                                              }
                                            }}
                                          >
                                            <FormControlLabel value="facebook" control={<Radio />} label="Facebook Business Pages" />
                                            <FormControlLabel
                                              sx={{ marginLeft: '25px' }}
                                              value="instagram"
                                              control={<Radio />}
                                              label="Instagram Business Accounts"
                                            />
                                          </RadioGroup>
                                        </FormControl>
                                        {facebookPages && showFacebookPageDropDown && (
                                          <FormControl fullWidth sx={{ marginTop: '20px' }}>
                                            <InputLabel id="demo-simple-select-label">Select Business Pages</InputLabel>
                                            <Select
                                              labelId="demo-simple-select-label"
                                              id="demo-simple-select"
                                              value={selectedFacebookPage || (facebookPages.length > 0 ? facebookPages[0].id : '')}
                                              label="Select Page"
                                              onChange={(e) => selectPageHandle(e)}
                                            >
                                              {facebookPages.map((page, index) => (
                                                <MenuItem key={index} value={page.id}>
                                                  {page.name}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>
                                        )}
                                        {facebookPages && showInstagramPageDropDown && (
                                          <FormControl fullWidth sx={{ marginTop: '20px' }}>
                                            <InputLabel id="demo-simple-select-label">Select Business Accounts</InputLabel>
                                            <Select
                                              labelId="demo-simple-select-label"
                                              id="demo-simple-select"
                                              value={selectedFacebookPage || (facebookPages.length > 0 ? facebookPages[0].id : '')}
                                              label="Select Page"
                                              onChange={(e) => selectPageHandle(e)}
                                            >
                                              {facebookPages.map((page, index) => (
                                                <MenuItem key={index} value={page.id}>
                                                  {page.name}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>
                                        )}
                                        <FormControl fullWidth sx={{ marginTop: '20px' }}>
                                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <StaticDateTimePicker
                                              value={selectedDateTime}
                                              onChange={handleDateTimeChange}
                                              label="Select Date & Time"
                                              renderInput={(params) => (
                                                <>
                                                  <TextField {...params} InputProps={{ sx: { borderColor: 'black' } }} />
                                                  {error && <FormHelperText>{error}</FormHelperText>}
                                                  <FormHelperText sx={{ marginTop: '10px' }}>
                                                    {
                                                      'Important: The schedule date must be between 10 minutes and 30 days from the time now'
                                                    }
                                                  </FormHelperText>
                                                </>
                                              )}
                                              minDate={minDate}
                                              componentsProps={{ actionBar: { actions: [] } }}
                                            />
                                          </LocalizationProvider>
                                        </FormControl>
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
                                  </>
                                )}

                                {/* PUBLISH NOW */}

                                <Dialog
                                  open={openConfirmationModal && !isWaiting && !connectedLimit}
                                  onClose={handleCloseConfirmationModal}
                                >
                                  <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader}>
                                    <CircularProgress color="inherit" />
                                  </Backdrop>
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
                                {!connectedLimit && (
                                  <>
                                    {/* FOR META */}
                                    <Dialog open={openMetaConfirmationModal} onClose={handleCloseConfirmationModal} fullWidth>
                                      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader}>
                                        <CircularProgress color="inherit" />
                                      </Backdrop>
                                      <DialogTitle>Select Your Business Profile</DialogTitle>
                                      <DialogContent>
                                        <FormControl>
                                          <RadioGroup
                                            sx={{ marginTop: '10px' }}
                                            row
                                            aria-labelledby="demo-row-radio-buttons-group-label"
                                            name="row-radio-buttons-group"
                                            value={selectedMetaAccount}
                                            onChange={(e) => {
                                              setSelectedMetaAccount(e.target.value);
                                              if (e.target.value === 'facebook') {
                                                setShowFacebookPageDropDown(true);
                                                setShowInstagramPageDropDown(false);
                                                getMetaPagesAPI(selectedProfile, 'facebook'); // Adjusted function call
                                              } else {
                                                setShowFacebookPageDropDown(false);
                                                setShowInstagramPageDropDown(true);
                                                getMetaPagesAPI(selectedProfile, 'instagram'); // Adjusted function call
                                              }
                                            }}
                                          >
                                            <FormControlLabel value="facebook" control={<Radio />} label="Facebook Business Pages" />
                                            <FormControlLabel
                                              sx={{ marginLeft: '25px' }}
                                              value="instagram"
                                              control={<Radio />}
                                              label="Instagram Business Accounts"
                                            />
                                          </RadioGroup>
                                        </FormControl>
                                      </DialogContent>

                                      {facebookPages && showFacebookPageDropDown && (
                                        <DialogContent>
                                          <FormControl fullWidth>
                                            <InputLabel id="demo-simple-select-label">Select Business Pages</InputLabel>
                                            <Select
                                              labelId="demo-simple-select-label"
                                              id="demo-simple-select"
                                              value={selectedFacebookPage || (facebookPages && facebookPages.length && facebookPages[0].id)}
                                              label="Select Page"
                                              onChange={(e) => selectPageHandle(e)}
                                            >
                                              {facebookPages.map((page, index) => (
                                                <MenuItem key={index} value={page.id}>
                                                  {page.name}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>
                                        </DialogContent>
                                      )}
                                      {facebookPages && showInstagramPageDropDown && (
                                        <DialogContent>
                                          <FormControl fullWidth>
                                            <InputLabel id="demo-simple-select-label">Select Business Accounts</InputLabel>
                                            <Select
                                              labelId="demo-simple-select-label"
                                              id="demo-simple-select"
                                              value={selectedFacebookPage || (facebookPages && facebookPages.length && facebookPages[0].id)}
                                              label="Select Page"
                                              onChange={(e) => selectPageHandle(e)}
                                            >
                                              {facebookPages.map((page, index) => (
                                                <MenuItem key={index} value={page.id}>
                                                  {page.name}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>
                                        </DialogContent>
                                      )}
                                      <DialogActions>
                                        <Button onClick={handleCloseConfirmationModal} color="primary">
                                          Cancel
                                        </Button>
                                        <Button onClick={() => handlePublishNowClick(selectedProfile)} color="primary">
                                          Confirm
                                        </Button>
                                      </DialogActions>
                                    </Dialog>
                                  </>
                                )}

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
                            </Grid>
                          </Grid>
                        </MainCard>
                      </Grid>
                      <Grid item xs={12} marginTop={5}>
                        <MainCard title="Events History" content={false}>
                          <SimpleBar style={{ maxHeight: '350px' }}>
                            <CardContent>
                              <Grid container spacing={3} alignItems="center">
                                {eventsHistory?.events?.length > 0 &&
                                  eventsHistory?.events?.map((val, index) => {
                                    return (
                                      <Grid item xs={12} key={index}>
                                        <Grid container spacing={2}>
                                          <Grid item xs zeroMinWidth>
                                            <Typography align="left" variant="subtitle1">
                                              {capitalizeString(val?.event)}
                                              {(val?.event === 'published' || val?.event === 'scheduled') && (
                                                <>
                                                  {' '}
                                                  -
                                                  <Typography align="left" variant="caption" color="primary">
                                                    {' '}
                                                    {val?.published_platform}
                                                  </Typography>
                                                  <Typography align="left" variant="caption">
                                                    {' '}
                                                    @{val?.platform_username}
                                                  </Typography>
                                                </>
                                              )}
                                            </Typography>
                                            <Grid container spacing={2}>
                                              <Grid item xs zeroMinWidth>
                                                <Typography align="left" variant="caption" color="secondary">
                                                  {moment(val?.timestamp).format('MMMM Do YYYY, H:mm:ss a')}
                                                </Typography>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    );
                                  })}
                              </Grid>
                            </CardContent>
                          </SimpleBar>
                        </MainCard>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </>
      )}
    </>
  );
};

export default ContentEvents;
