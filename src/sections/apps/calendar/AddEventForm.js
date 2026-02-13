import PropTypes from 'prop-types';
import { getEvents } from 'store/reducers/calendar';

import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { LocalizationProvider, StaticDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState } from 'react';
import toast from 'utils/ToastNotistack';
import { useDispatch } from 'react-redux';
import { error429 } from 'pages/maintenance/ErrorMessage';
import { deleteScheduleEvent, updateSocialSchedule } from '_api/social-account';

const minDate = new Date();

const AddEventForm = ({ onCancel, scheduleId, defaultDateTime }) => {
  const dispatch = useDispatch();
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [openModal, setOpenModal] = useState(false); //eslint-disable-line
  const [isWaiting, setIsWaiting] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [rateLimit, setRateLimit] = useState(false);
  const [deleteLimit, setDeleteLimit] = useState(false);

  const handleCloseScheduleConfirmationModal = () => {
    setOpenModal(false);
    onCancel();
    selectedDateTime && setSelectedDateTime(null);
  };

  const handleScheduleLaterClick = async () => {
    // Prepare the data to send in the request
    const requestData = {
      start: selectedDateTime ? selectedDateTime : defaultDateTime
    };
    setIsWaiting(true);
    updateSocialSchedule(scheduleId, requestData)
      .then((response) => {
        // Handle the response as needed
        setIsWaiting(false);
        toast(response.data.message, { variant: 'success' });
        onCancel();
        setOpenModal(false);
        dispatch(getEvents());
      })
      .catch((error) => {
        setIsWaiting(false);
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
      });
  };

  const handleDelete = async () => {
    // Prepare the data to send in the request
    const requestData = {
      start: selectedDateTime
    };
    setLoader(true);
    deleteScheduleEvent(scheduleId, requestData)
      .then((response) => {
        // Handle the response as needed
        setLoader(false);
        setDeleteConfirmationOpen(true);
        toast(response.data.message, { variant: 'success' });
        onCancel();
        setOpenModal(false);
        setDeleteConfirmationOpen(false);
        dispatch(getEvents());
      })
      .catch((error) => {
        if (error.response) {
          setLoader(false);
          setDeleteConfirmationOpen(false);
          if (error.response.status === 401) {
            localStorage.clear();
            navigate('/auth/login');
          } else if (error.response.status === 429) {
            setDeleteLimit(true);
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
  };

  const handleConfirmSchedule = () => {
    setDeleteConfirmationOpen(true);
  };

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isWaiting === true}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {!rateLimit && (
        <>
          <DialogTitle>
            Schedule your Content
            <span style={{ color: 'red' }}>*</span>
          </DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <StaticDateTimePicker
                value={selectedDateTime ? selectedDateTime : defaultDateTime}
                onChange={handleDateTimeChange}
                renderInput={(params) => (
                  <>
                    <TextField {...params} InputProps={{ sx: { borderColor: 'black' } }} />
                  </>
                )}
                minDate={minDate}
                componentsProps={{ actionBar: { actions: [] } }}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmSchedule} style={{ marginRight: '150px' }} color="primary">
              Delete
            </Button>
            <Button onClick={handleCloseScheduleConfirmationModal} color="primary">
              Cancel
            </Button>
            <Button onClick={() => handleScheduleLaterClick()} color="primary">
              Schedule
            </Button>
          </DialogActions>
        </>
      )}

      {!deleteLimit && (
        <>
          <Dialog open={deleteConfirmationOpen} onClose={() => setDeleteConfirmationOpen(false)}>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader === true}>
              <CircularProgress color="inherit" />
            </Backdrop>
            <DialogTitle>Delete Confirmation</DialogTitle>
            <DialogContent>Are you sure you want to delete this event?</DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteConfirmationOpen(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDelete} color="primary">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

AddEventForm.propTypes = {
  event: PropTypes.object,
  range: PropTypes.object,
  onCancel: PropTypes.func
};

export default AddEventForm;
