import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
//API
import IconButton from 'components/@extended/IconButton';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  FormLabel,
  Grid,
  TextField,
  Stack,
  Typography,
  Tooltip,
  Dialog,
  useMediaQuery,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
//used to structure and style the content of a page
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import ProfileTab from './ProfileTab';
// assets
import { CameraOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateImageResponse, updateDisableUpload } from 'store/reducers/image';
import toast from 'utils/ToastNotistack';
import { useNavigate } from 'react-router';
import { deleteProfilePic } from '_api/account';
import { error429 } from 'pages/maintenance/ErrorMessage';
// ============|| USER PROFILE - TAB CONTENT ||============== //
const ProfileTabs = () => {
  const theme = useTheme(); // used useTheme hook to get current theme object
  const dispatch = useDispatch(); //a variable dispatch which is assigned a value of useDispatch hook
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState('');
  const [isImgSet, setIsImgSet] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isDisabled] = useState(false);

  /**
   *  @method [slice] select the slice of state containing the image object
   */
  const myImage = useSelector((state) => state.slice);
  const navigate = useNavigate();
  const loginUserDetails = JSON.parse(localStorage.getItem('user_info'));

  /**
   * @method [useEffect] used to perform side effect when the component mounts
   */
  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
      dispatch(updateImageResponse(selectedImage));
      dispatch(updateDisableUpload(selectedImage));
    }
  }, [selectedImage]);

  /**
   * @method [useEffect] hook to upload the updated image to the server and update the state
   */
  useEffect(() => {
    // Check if the image has been updated and is not yet set
    if (myImage.responseImg !== null && !isImgSet) {
      // Update the avatar with the updated image
      setAvatar(myImage.responseImg);
      setIsImgSet(true);
    }
  }, [myImage]);
 /**
 * @method [deleteProfilePicture] used to delete profile_pic
 */
const deleteProfilePicture = async () => {
  try {
    const data = {
      confirm_deletion: true
    };

    const response = await deleteProfilePic(data);

    if (response.data.status === 'success') {
      const loginUser = JSON.parse(localStorage.getItem('user_info'));
      delete loginUser.profile_pic;
      localStorage.setItem('user_info', JSON.stringify(loginUser));
      window.location.reload();

      toast(response.data.message, {
        variant: 'success'
      });
      setOpenModal(false);
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

  const ConfirmationPopup = ({ title, dialogText, open, onClose, handleCallback }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    return (
      <Dialog fullScreen={fullScreen} open={open} onClose={onClose} aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogText}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>No</Button>
          <Button onClick={handleCallback} disabled={isDisabled === true}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  /**
   * @method [handleImageChange] used to handle a change event that occurs when a user selects a image file
   */
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if(file.type ===  'image/jpg' ||  file.type ===  'image/jpeg' || file.type ===  'image/png') {
      setSelectedImage(file);
    }
    else{
      toast("Selected image type is not supported. Please choose a different image format and try again.", {variant:'error'})
    }
  
  };

  return (
    <MainCard>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          {myImage.deleteIcon && (
            <Stack direction="row" justifyContent="flex-end">
              <Tooltip title="Delete Profile Picture">
                <IconButton onClick={() => setOpenModal(true)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          <Grid item xs={12}>
            <Stack spacing={2.5} alignItems="center">
              {/* @ FormLabel contains an avatar and an input element for selecting an image file  */}
              <FormLabel
                htmlFor="change-avtar"
                sx={{
                  position: 'relative',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  '&:hover .MuiBox-root': { opacity: myImage.disableUpload === true && 1 }
                }}
              >
                <Avatar
                  alt="Avatar 1"
                  src={avatar ? avatar : loginUserDetails?.profile_pic}
                  sx={{ width: 124, height: 124, border: '1px dashed' }}
                />
                {/* This box contains a camera icon and a message for uploading an image file. */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: myImage.disableUpload === true && 'pointer'
                  }}
                >
                  {myImage.disableUpload === true && (
                    <Stack spacing={0.5} alignItems="center">
                      <CameraOutlined style={{ color: theme.palette.secondary.lighter, fontSize: '2rem' }} />
                      <Typography sx={{ color: 'secondary.lighter' }}>Upload here</Typography>
                    </Stack>
                  )}
                </Box>
              </FormLabel>
              <TextField
                type="file"
                id="change-avtar"
                placeholder="Outlined"
                variant="outlined"
                sx={{ display: 'none', pointerEvents: 'none' }}
                disabled={myImage.disableUpload === false && true}
                onChange={handleImageChange}
                inputProps={{
                  accept: ".jpg, .jpeg, .png"   // Specify that only image files are allowed
                }}
              />

              <Stack spacing={0.5} alignItems="center">
                <Typography variant="h5">{''}</Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {/* ProfileTab  component displays tabs with different content for the user's profile.*/}
          <ProfileTab />
        </Grid>
      </Grid>
      {openModal === true && (
        <ConfirmationPopup
          open={openModal}
          onClose={() => setOpenModal(false)}
          title="Confirmation!"
          dialogText="Are you sure you want to delete this Profile Picture?"
          handleCallback={deleteProfilePicture}
        />
      )}
    </MainCard>
  );
};
// prop validation is checking if the 'focusInput' prop is a function.
ProfileTabs.propTypes = {
  focusInput: PropTypes.func
};
export default ProfileTabs;
