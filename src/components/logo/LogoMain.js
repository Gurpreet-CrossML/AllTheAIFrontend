import PropTypes from 'prop-types';

const LogoMain = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {/* Logo Icon */}
      <img
        src="/assets/images/logoiconalltheai.png"
        alt="logo icon"
        width="32"
        height="32"
      />

      {/* Text Logo */}
      <span
        style={{
          fontSize: '24px',
          fontWeight: '700',
          letterSpacing: '0.5px'
        }}
      >
        content
        <span
          style={{
            background: 'linear-gradient(90deg, #7B3FE4, #B983FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          IQ
        </span>
      </span>
    </div>
  );
};

LogoMain.propTypes = {
  reverse: PropTypes.bool
};

export default LogoMain;
