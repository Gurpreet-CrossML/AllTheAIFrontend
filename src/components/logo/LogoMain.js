import PropTypes from 'prop-types';
const LogoMain = () => {
  return (
    <img src="/assets/images/logoalltheai.png" alt="logoicon" width="200" />
  );
};

LogoMain.propTypes = {
  reverse: PropTypes.bool
};

export default LogoMain;
