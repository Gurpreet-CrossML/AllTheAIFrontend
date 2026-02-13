// material-ui
import { Box } from '@mui/material';

// ==============================|| AUTH BLUR BACK SVG ||============================== //

const AuthBackground = () => {
  return (
    <Box sx={{ position: 'absolute', filter: 'blur(28px)', zIndex: -1, bottom: 0 }}>
      <img src="/assets/images/logoiconalltheai.png" width="100%" alt="alltheaiicon" />
    </Box>
  );
};

export default AuthBackground;
