import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// material-ui
import { useTheme } from '@mui/material/styles';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
// assets
import { CreditCardOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { displayDeleteIcon, updateDisableUpload } from 'store/reducers/image';
function getPathIndex(pathname) {
  let selectedTab = 0;
  switch (pathname) {
    case '/profile/billing-information':
      selectedTab = 1;
      break;
    case '/profile/change-password':
      selectedTab = 2;
      break;
    case '/subscribe-plan':
      selectedTab = 3;
      break;
    case '/profile/personal-information':
    default:
      selectedTab = 0;
  }
  return selectedTab;
}
// ==============================|| USER PROFILE - TAB ||============================== //
const ProfileTab = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(getPathIndex(pathname));
  const handleListItemClick = (index, route) => {
    setSelectedIndex(index);
    navigate(route);
    if (index === 0) {
      dispatch(displayDeleteIcon(true));
      dispatch(updateDisableUpload(true));
    } else {
      dispatch(displayDeleteIcon(false));
      dispatch(updateDisableUpload(false));
    }
  };
  useEffect(() => {
    setSelectedIndex(getPathIndex(pathname));
  }, [pathname]);
  const dispatch = useDispatch();
  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: theme.palette.grey[500] } }}>
      <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick(0, '/profile/personal-information')}>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="Personal Information" />
      </ListItemButton>
      {/* <ListItemButton selected={selectedIndex === 1} onClick={() => handleListItemClick(1, '/profile/billing-information')}>
        <ListItemIcon>
          <CreditCardOutlined />
        </ListItemIcon>
        <ListItemText primary="Billing Information & Address" />
      </ListItemButton> */}
      <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClick(2, '/profile/change-password')}>
        <ListItemIcon>
          <LockOutlined />
        </ListItemIcon>
        <ListItemText primary="Change Password" />
      </ListItemButton>
    </List>
  );
};
export default ProfileTab;
