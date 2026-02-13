import PropTypes from 'prop-types';
//material-ui
import { styled } from '@mui/material/styles';

// third-party
import { SnackbarProvider } from 'notistack';

// project import
import { useSelector } from 'store';
import { SnackbarUtilsConfigurator } from 'utils/ToastNotistack';

// assets
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons'; //eslint-disable-line
import { IconButton } from '@mui/material';
import { useRef } from 'react';

// custom styles
const StyledSnackbarProvider = styled(SnackbarProvider)(({ theme }) => ({
  '&.SnackbarItem-variantError': {
    backgroundColor: theme.palette.error.main
  },
  '&.SnackbarItem-variantSuccess': {
    backgroundColor: theme.palette.success.main
  },
  '&.SnackbarItem-variant': {
    backgroundColor: theme.palette.success.main
  },
  '&.SnackbarItem-variantInfo': {
    backgroundColor: theme.palette.info.main
  },
  '&.SnackbarItem-variantWarning': {
    backgroundColor: theme.palette.warning.light
  }
}));

// ===========================|| SNACKBAR - NOTISTACK ||=========================== //

const Notistack = ({ children }) => {
  const snackbar = useSelector((state) => state.snackbar);
  const iconSX = { marginRight: 8, fontSize: '1.15rem' }; //eslint-disable-line
  const notistackRef = useRef(null);

  const onClose = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };
  return (
    <StyledSnackbarProvider
      maxSnack={snackbar.maxStack}
      dense={snackbar.dense}
      ref={notistackRef}
      autoHideDuration={2000}
      iconVariant={
        snackbar.iconVariant === 'useemojis'
          ? {
            success: <CheckCircleOutlined style={iconSX} />,
            error: <CloseCircleOutlined style={iconSX} />,
            warning: <WarningOutlined style={iconSX} />,
            info: <InfoCircleOutlined style={iconSX} />
          }
          : undefined
      }
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      hideIconVariant={snackbar.iconVariant === 'hide' ? true : false}
      // With close as default
      action={(key) => (
        <IconButton
          size="medium"
          onClick={onClose(key)}
          sx={{
            p: 0.5, color: "#fff",
            "&:hover": {
              backgroundColor: "transparent"
            },
          }}>
          <CloseCircleOutlined />
        </IconButton>
      )}
    >
      <SnackbarUtilsConfigurator />
      {children}
    </StyledSnackbarProvider>
  );
};

Notistack.propTypes = {
  children: PropTypes.node
};

export default Notistack;
