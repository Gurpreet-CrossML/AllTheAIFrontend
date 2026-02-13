  import React, { useEffect, useRef, useState } from 'react';
  import { useMediaQuery, Box, Grid, Typography, Dialog, Backdrop, CircularProgress } from '@mui/material';
  import CalendarStyled from 'sections/apps/calendar/CalendarStyled';
  import FullCalendar from '@fullcalendar/react';
  import Toolbar from 'sections/apps/calendar/ToolBar';
  import interactionPlugin from '@fullcalendar/interaction';
  import listPlugin from '@fullcalendar/list';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import timelinePlugin from '@fullcalendar/timeline';
  import { useSelector } from 'store';
  import { getEvents, selectEvent, selectRange, updateCalendarView } from 'store/reducers/calendar';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { library } from '@fortawesome/fontawesome-svg-core';
  import { fas } from '@fortawesome/free-solid-svg-icons';
  import { far } from '@fortawesome/free-regular-svg-icons';
  import { fab } from '@fortawesome/free-brands-svg-icons';
  import { useDispatch } from 'react-redux';
  import moment from 'moment';

  import AddEventForm from 'sections/apps/calendar/AddEventForm';
  import { PopupTransition } from 'components/@extended/Transitions';

  const solid = (iconName) => ({ prefix: 'fas', iconName });
  const brands = (iconName) => ({ prefix: 'fab', iconName });

  library.add(fas, far, fab);

  const AppCalendar = () => {
    const dispatch = useDispatch();
    const matchDownSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const matchDownMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const { calendarView, events, selectedRange, isLoader} = useSelector((state) => state.calendar);
    const [selectedProfile, setSelectedProfile] = useState(null); //eslint-disable-line
    const [scheduleId, setScheduleId] = useState('');
    const [open, setOpen] = useState(false); //eslint-disable-line
    const [date, setDate] = useState(new Date());
    const [dateTime, setDateTime] = useState('');
    const [selectedDateTime, setSelectedDateTime] = useState(''); //eslint-disable-line


    const selectedEvent = useSelector((state) => {
      const { events, selectedEventId } = state.calendar;
      if (selectedEventId) {
        return events.find((event) => event.id === selectedEventId);
      }
      return null;
    });
    const rateLimit = useSelector((state) => state.calendar.rateLimit);


    useEffect(() => {
      dispatch(getEvents());
    }, [dispatch]);

    const calendarRef = useRef(null);

    useEffect(() => {
      const calendarEl = calendarRef.current;
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();
        const newView = matchDownSM ? 'listWeek' : 'dayGridMonth';
        calendarApi.changeView(newView);
        dispatch(updateCalendarView(newView));
      }
    }, [matchDownSM]);

    /**
     * @method [handleViewChange] use tohandle the view
     */
    const handleViewChange = (newView) => {
      const calendarEl = calendarRef.current;
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();
        calendarApi.changeView(newView);
        dispatch(updateCalendarView(newView));
      }
    };

    /**
     * @method [handleDatePrev] use to manage the previous view
     */
    const handleDatePrev = () => {
      const calendarEl = calendarRef.current;
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();
        calendarApi.prev();
        setDate(calendarApi.getDate());
      }
    };

    /**
     * @method [handleDateNext] use to get the history of the Particular event
     */
    const handleDateNext = () => {
      const calendarEl = calendarRef.current;
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();
        calendarApi.next();
        setDate(calendarApi.getDate());
      }
    };

    /**
     * @method [handleRangeSelect] use to handle the range of the Particular event
     */
    const handleRangeSelect = (arg) => {
      const calendarEl = calendarRef.current;
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();
        calendarApi.unselect();
      }
      dispatch(selectRange(arg.start, arg.end));
    };

    /**
     * @method [handleEventSelect] use to handle the selected  event
     */
    const handleEventSelect = (arg) => {
      const eventDate = moment(arg.event.start).startOf('day').toDate();
      const currentDate = moment().startOf('day').toDate();

      // Check if the event date is on or after today
      if (eventDate >= currentDate && !arg.event.extendedProps.posted) {
        let id = arg.event.extendedProps.schedule_id;
        setScheduleId(id);
        dispatch(selectEvent(arg.event.id));
        handleClickOpen(true); // Open the popup/modal
        setSelectedProfile(arg.event.extendedProps.social_platform_icon); // Update the selected profile
        setDateTime(arg.event.extendedProps.start);

        // converting date and time with moment
        const startDateTime = moment(arg.event.start).toDate();
        setSelectedDateTime(startDateTime);
      }
    };

    const handleTruncate = (str) => {
      //eslint-disable-line
      if (str && str.length > 60) {
        if (matchDownSM) return str.substring(0, 80) + '...';
        else if (matchDownMD) return str.substring(0, 100) + '...';
        else return str.substring(0, 180) + '...';
      }
      return str;
    };

    /**
     * @method [eventContent] use to get the content of the  event
     */
    const eventContent = (arg) => {
      const { event } = arg;
      const { social_platform_icon, social_platform_name, generatedContent, start, posted } = event.extendedProps;
      const startTime = moment(start).format('hh:mm A');
      const isClickable = !arg.event.extendedProps.posted;

      return (
        <>
          <div className={isClickable && 'clickable-event'}>
            <Grid container spacing={1}>
              <>
                <Grid item xs={2}>
                  <FontAwesomeIcon icon={solid(social_platform_icon)} size="1x" style={{ color: '#ffffff' }} />
                  <FontAwesomeIcon icon={brands(social_platform_icon)} size="1x" style={{ color: '#ffffff' }} />
                </Grid>
                <Grid item xs={12} sm={10}>
                  <Typography variant="h6" sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    @{social_platform_name}
                  </Typography>
                </Grid>
              </>
              <>
                <Grid item xs={12} lg={12}>
                  <Typography variant="h6" sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {handleTruncate(generatedContent)}
                  </Typography>
                </Grid>
                <Grid item xs={12} lg={6} style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">{startTime}</Typography>
                  {posted ? (
                    <FontAwesomeIcon icon={['fas', 'circle-check']} style={{ marginLeft: '10px' }} />
                  ) : (
                    moment(start).startOf('day').toDate() >= moment().startOf('day').toDate() && (
                      <FontAwesomeIcon icon={['far', 'clock']} style={{ marginLeft: '10px' }} />
                    )
                  )}
                </Grid>
              </>
            </Grid>
          </div>
        </>
      );
    };

    const calendarEvents = events.map((event) => {
      return {
        title: event?.social_info?.username,
        start: event?.start,
        generatedContent: event?.generated_content,
        schedule_id: event?.id,
        posted: event?.is_posted,
        extendedProps: {
          social_platform_icon: event?.social_platform_icon,
          social_platform_name: event?.social_info?.username,
          generatedContent: event?.generated_content,
          start: event?.start,
          schedule_id: event?.id,
          posted: event?.is_posted
        }
      };
    });

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    return (
      <>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoader}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {!rateLimit && (<>
          <Box sx={{ position: 'relative' }}>
          <CalendarStyled>
            <Toolbar
              date={date}
              view={calendarView}
              onClickNext={handleDateNext}
              onClickPrev={handleDatePrev}
              onChangeView={handleViewChange}
            />
            <FullCalendar
              weekends
              selectable
              eventMaxStack={1}
              slotEventOverlap={false}
              events={calendarEvents}
              ref={calendarRef}
              rerenderDelay={10}
              initialDate={date}
              initialView={calendarView}
              dayMaxEventRows={2}
              eventDisplay="block"
              headerToolbar={false}
              allDayMaintainDuration
              eventResizableFromStart
              select={handleRangeSelect}
              eventClick={handleEventSelect}
              // slotLabelInterval={{ hours: 2 }}
              height={'auto'}
              expandRows={true}
              // slotDuration={'02:00:00'}
              plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
              eventContent={eventContent}
            />
          </CalendarStyled>
          <Dialog TransitionComponent={PopupTransition} open={open} onClose={handleClose} sx={{ '& .MuiDialog-paper': { p: 0 } }}>
            <AddEventForm
              event={selectedEvent}
              range={selectedRange}
              onCancel={handleClose}
              scheduleId={scheduleId}
              defaultDateTime={dateTime}
            />
          </Dialog>
        </Box>
        </>)}
      
      </>
    );
  };

  export default AppCalendar;
