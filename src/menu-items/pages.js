// third-party
import { FormattedMessage } from 'react-intl';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
// assets
import {
  LoginOutlined,
  PhoneOutlined,
  RocketOutlined,
  HomeOutlined,
  ProjectOutlined,
  TeamOutlined,
  DatabaseOutlined,
  ContainerFilled,
  DashboardOutlined,
  FileImageFilled,
  TransactionOutlined,
  CalendarOutlined,
  VerifiedOutlined,
  DollarOutlined
} from '@ant-design/icons';

// icons
const icons = {
  LoginOutlined,
  PhoneOutlined,
  RocketOutlined,
  HomeOutlined,
  ProjectOutlined,
  TeamOutlined,
  DatabaseOutlined,
  PersonOutlineIcon,
  MenuBookIcon,
  ContainerFilled,
  DashboardOutlined,
  FileImageFilled,
  TransactionOutlined,
  CalendarOutlined,
  VerifiedOutlined,
  DollarOutlined
};

/*|| MENU ITEMS - PAGES ||*/
const dashboard = {
  id: 'group-dashboard',
  type: 'group',
  icon: 'dashboardOutlined',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'item',
      url: '/dashboard',
      icon: icons.DashboardOutlined
    },
    {
      id: 'content',
      title: <FormattedMessage id="content" />,
      type: 'collapse',
      icon: icons.ContainerFilled,
      children: [
        {
          id: 'choose-template',
          title: <FormattedMessage id="choose-template" />,
          type: 'item',
          url: '/templates',
          breadcrumbs: false
        },
        {
          id: 'content-history',
          title: <FormattedMessage id="content-history" />,
          type: 'item',
          url: '/content-history',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'persona-profiles',
      title: <FormattedMessage id="persona-profiles" />,
      type: 'item',
      url: '/persona-profiles',
      icon: icons.TeamOutlined
    },
    {
      id: 'generate_images',
      title: <FormattedMessage id="generate_images" />,
      type: 'collapse',
      icon: icons.FileImageFilled,
      children: [
        {
          id: 'image-template',
          title: <FormattedMessage id="image-template" />,
          type: 'item',
          url: '/image-template',
          breadcrumbs: false
        },
        {
          id: 'image-history',
          title: <FormattedMessage id="image-history" />,
          type: 'item',
          url: '/images-history',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'profile',
      title: <FormattedMessage id="profile" />,
      type: 'item',
      url: '/profile/personal-information',
      icon: icons.PersonOutlineIcon
    },
    {
      id: 'social-media',
      title: <FormattedMessage id="social-media" />,
      type: 'item',
      url: '/social-media',
      icon: icons.VerifiedOutlined
    },
    {
      id: 'calendar',
      title: <FormattedMessage id="calendar" />,
      type: 'item',
      url: '/scheduler',
      icon: icons.CalendarOutlined
    }

    // {
    //   id: 'subscribe-plan',
    //   title: <FormattedMessage id="subscribe-plan"  />,
    //   type: 'item',
    //   url: '/subscribe-plan',
    //   icon: icons.DollarOutlined
    // },

    // {
    //   id: 'transaction-history',
    //   title: <FormattedMessage id="transaction-history" />,
    //   type: 'item',
    //   url: '/transaction-history',
    //   icon: icons.TransactionOutlined
    // },
  ]
};
export default dashboard;
