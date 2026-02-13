import { useEffect, useRef, useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, ButtonBase, CardContent, ClickAwayListener, Grid, Paper, Popper, Stack, Tooltip, Typography } from '@mui/material';

// project import
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';

// assets
import { LogoutOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { updateProfileState, displayImageResponse } from 'store/reducers/image';
import { LOGOUT } from 'store/reducers/actions';
// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const Profile = () => {
  const { logout } = useAuth();
  const theme = useTheme();
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState(''); //eslint-disable-line
  const [loginUser, setLoginUser] = useState({});

  const updatedImage = useSelector(state => state.slice);


  useEffect(() => {
    const loginUserDetails = JSON.parse(localStorage.getItem('user_info'));
    setLoginUser(loginUserDetails);
  }, [])


  useEffect(() => {
    if (updatedImage.image !== null && updatedImage.profileUpdated) {
      const file = updatedImage.image;
      getBase64(file)
      .then((result) => {
        setAvatar(result);
        dispatch(displayImageResponse(null));
        })
      .catch(e => console.log(e));
      
      dispatch(updateProfileState(false));
    }
  }, [updatedImage])

  /* Convert Image to base64 URL */
  const getBase64 = (file) => new Promise(function (resolve, reject) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject('Error: ', error);
  });

  /**
   * @method [handleLogout] use to handle the logout functionality 
   */
  const handleLogout = async () => {
    dispatch({ type: LOGOUT });
    try {
      await logout();
      // navigate(`/auth/login`, {
      //   state: {
      //     from: ''
      //   }
      // });
    } catch (err) {
      if (err.response.status == "401") {
        localStorage.clear();
        navigate("/auth/login"); // Redirect to the login page if the token is invalid
      }
      console.error(err);
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';
  return (
    <Box sx={{
      flexShrink: 0, ml: 0.75, justifyContent: 'flex-end',
      alignItems: 'flex-end',
    }}>
      <ButtonBase
        sx={{
          p: 0.25,

          bgcolor: open ? iconBackColorOpen : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'secondary.light' : 'secondary.lighter' },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2
          }
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Stack direction="row" spacing={2} sx={{ p: 0.5, display: 'flex', alignItems: 'right', justifyContent: 'end' }}>
          <Avatar alt="profile usersss" src={avatar ? avatar : loginUser?.profile_pic} size="xs" />
          <Typography variant="subtitle1">{Object.keys(loginUser).length > 0 && loginUser?.first_name + ' ' + loginUser?.last_name}</Typography>
        </Stack>
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: 290,
                minWidth: 240,
                maxWidth: 290,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 250
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item lg={10} >
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          {Object.keys(loginUser).length > 0 &&
                            <>
                              <Avatar alt="profile user" src={avatar ? avatar : loginUser?.profile_pic} sx={{ width: 32, height: 32 }} />
                              <Stack sx={{ wordBreak: "break-word" }} >
                                <Typography variant="h6">{loginUser?.first_name + ' ' + loginUser?.last_name}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {loginUser?.email}
                                </Typography>
                              </Stack>
                            </>
                          }
                        </Stack>
                      </Grid>
                      <Grid item lg={2}>
                        <Tooltip title="Logout">
                          <IconButton size="large" sx={{ color: 'text.primary' }} onClick={handleLogout}>
                            <LogoutOutlined />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Profile;