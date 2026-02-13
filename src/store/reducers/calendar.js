import { createSlice } from '@reduxjs/toolkit';
import { socialEventList } from '_api/social-account';
import { error429 } from 'pages/maintenance/ErrorMessage';

const initialState = {
  calendarView: 'dayGridMonth',
  error: false,
  events: [],
  isLoader: false,
  isModalOpen: false,
  selectedEventId: null,
  selectedRange: null,
  rateLimit: false
};

const calendar = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    loading(state) {
      state.isLoader = true;
    },
    hasError(state, action) {
      state.isLoader = false;
      state.error = action.payload;
    },
    setEvents(state, action) {
      state.isLoader = false;
      state.events = action.payload;
    },
    updateCalendarView(state, action) {
      state.calendarView = action.payload;
    },
    selectEvent(state, action) {
      const eventId = action.payload;
      state.isModalOpen = true;
      state.selectedEventId = eventId;
    },
    selectRange(state, action) {
      const { start, end } = action.payload;
      state.isModalOpen = true;
      state.selectedRange = { start, end };
    },
    toggleModal(state) {
      state.isModalOpen = !state.isModalOpen;
      if (state.isModalOpen === false) {
        state.selectedEventId = null;
        state.selectedRange = null;
      }
    },
    setRateLimit(state, action) {
      state.rateLimit = action.payload;
    }
  }
});

export default calendar.reducer;

export const { selectEvent, toggleModal, updateCalendarView, selectRange, error, rateLimit } = calendar.actions;

export const getEvents = () => {
  return async (dispatch) => {
    try {
      dispatch(calendar.actions.loading());
      const response = await socialEventList();
      const events = response && response.data ? response.data.data : [];
      dispatch(calendar.actions.setEvents(events));
    } catch (error) {
      dispatch(calendar.actions.hasError(error));
      if (error.response && error.response.status === 429) {
        toast(error429, {
          variant: 'error'
        });
        dispatch(calendar.actions.setRateLimit(true));
      }
    }
  };
};
