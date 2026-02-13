//material-ui
import {
  Avatar,
  AvatarGroup,
  Box,
  Grid,
  Stack,
  Typography,
  Button,
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  IconButton,
  Chip,
  ListItemButton,
  List,
  ListItemText,
  ListItemSecondaryAction,
  Backdrop,
  CircularProgress
} from '@mui/material';
import toast from 'utils/ToastNotistack';

//used to structure and style the content of a page
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

//necessary components from 'components/third-party/ReactTable'
import { EmptyTable } from 'components/third-party/ReactTable';
import { activePlan } from '_api/dashboard';


// method used for dob format
import moment from 'moment';
import { PropTypes, string } from 'prop-types';

//used to manage component state and side effects
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useRowSelect, useTable } from 'react-table';

import VisibilityIcon from '@mui/icons-material/Visibility';
import avatar1 from 'assets/images/users/avatar-1.png';
import avatar2 from 'assets/images/users/avatar-2.png';
import avatar3 from 'assets/images/users/avatar-3.png';
import avatar4 from 'assets/images/users/avatar-4.png';

//API
import { useDispatch } from 'react-redux';
import { displayActivePlan } from 'store/reducers/image';
import { ALLTHEAI } from 'config';
import { handleTruncate } from 'config';
import { error429 } from 'pages/maintenance/ErrorMessage';
import { contentHistoryDashboard, transactionHistoryDashboard } from '_api/dashboard';

const addTruncate = (str) => {
  //eslint-disable-line
  if (str && str.length > 15) {
    return str.substring(0, 15) + '...';
  }
  return str;
};

/**
 * Status Cell
 */
const StatusCell = ({ value }) => {
  switch (value) {
    case 'draft':
      return <Chip color="error" label="Draft" size="small" variant="light" />;
    case 'published':
      return <Chip color="success" label="Published" size="small" variant="light" />;
    default:
      return <Chip color="error" label="Draft" size="small" variant="light" />;
  }
};
StatusCell.propTypes = {
  value: string
};

function ReactTable({ columns, data, renderRowSubComponent }) {
  const { getTableProps, getTableBodyProps, headerGroups, visibleColumns, rows, prepareRow } = useTable(
    {
      columns,
      data
    },
    useRowSelect
  );

  return (
    <>
      <Stack spacing={3} sx={{ overflowX: 'auto' }}>
        {/* Table Component */}
        <Table {...getTableProps()}>
          {/* Table Header */}
          <TableHead>
            {headerGroups.map((headerGroup, i) => (
              <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => (
                  <TableCell key={index} {...column.getHeaderProps([{ className: column.className }])}>
                    {column.render('Header')}
                    {/* <HeaderSort column={column} /> */}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          {/* Table Body */}
          <TableBody {...getTableBodyProps()}>
            {/* Check if there are rows */}
            {rows?.length > 0 ? (
              rows?.map((row, i) => {
                prepareRow(row);
                const rowProps = row.getRowProps();
                return (
                  <React.Fragment key={i}>
                    <TableRow>
                      {row.cells.map((cell, index) => (
                        <TableCell key={index} {...cell.getCellProps([{ className: cell.column.className }])}>
                          {cell.render('Cell')}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.isExpanded && renderRowSubComponent({ row, rowProps, visibleColumns })}
                  </React.Fragment>
                );
              })
            ) : (
              /* Render empty table message if there are no rows */
              <EmptyTable msg="No Data" colSpan={7} />
            )}
          </TableBody>
        </Table>
      </Stack>
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  renderRowSubComponent: PropTypes.any
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activePlanDetails, setActivePlanDetails] = useState({});
  const [contentHistory, setContentHistory] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showSubscriptionNotFoundText, setShowSubscriptionNotFoundText] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const dispatch = useDispatch();
  const [rateLimit, setRateLimit] = useState(false);
  const [transactionLimit, setTransactionLimit] = useState(false);
  const[contentRateLimit, setContentRateLimit] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken == null) {
      // Redirect to login if auth token is missing
      navigate('/auth/login');
    }
    document.title = `Dashboard | ${ALLTHEAI}`;
    getTransactionHistory();
    getActivePlan();
    setTimeout(() => {
      getContentHistory();
    }, 1500);
  }, []);

/**
 * @method [getContentHistory] use to get history of content
 */
  const getContentHistory = async () => {
    try {
      await contentHistoryDashboard().then((response) => {
        setContentHistory(response.data.data);
      });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login'); 
        } 
        else if (error.response.status === 429) { 
          setContentRateLimit(true);
          toast(error429, {
            variant: 'error'
          });
        }
        else {
          toast(error.response.data.message, {
            variant: 'error'
          });
        }
      }
    }
  };
  

/**
 * @method [getTransactionHistory] use to check the activate the plan
 */
const getTransactionHistory = async () => {
  try {
    await transactionHistoryDashboard().then((response) => {
      setTransactionHistory(response.data.data.results);
    });
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate('/auth/login'); 
      }
      else if (error.response.status === 429) { 
        setTransactionLimit(true);
        toast(error429, {
          variant: 'error'
        });
      }
      else {
        toast(error.response.data.message, {
          variant: 'error'
        });
      }
    }
  }
};

 /**
 * @method [getActivePlan] use to check the activate the plan
 */
const getActivePlan = async () => {
  try {
    setIsWaiting(true);
    const response = await activePlan();
    setIsWaiting(false);

    const plan = {
      name: response.data.data.plan_details.name,
      price: response.data.data.plan_details.price,
      endDate: response.data.data.subscription_info.end_date
    };

    dispatch(displayActivePlan(plan));
    setActivePlanDetails(response.data.data);
  } catch (error) {
    setIsWaiting(false);
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate('/auth/login'); 
      }
      else if (error.response.status === 429) { 
        setRateLimit(true);
        toast(error429, {
          variant: 'error'
        });
      }
        else {
          setShowSubscriptionNotFoundText(true);
          toast(error.response.data.message, {
            variant: 'error'
          });
        }
    } 
  }
};


  /**
   * @method [content_columns] used to perform headers
   */
  const content_columns = [
    {
      Header: 'Template Name',
      accessor: 'template_name',
      disableSortBy: true,
      width: 100
    },
    {
      Header: 'Persona Name',
      accessor: 'persona',
      disableSortBy: true,
      width: 80,
      Cell: ({ value }) => addTruncate(value, 15)
    },
    {
      Header: 'Content Description',
      width: 80,
      Cell: ({ row }) => handleTruncate(row?.original?.content[0]?.blocks[0]?.text),
      disableSortBy: true
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: StatusCell,
      disableSortBy: true,
      width: 80
    },
    {
      Header: 'Actions',
      accessor: 'content_id',
      disableSortBy: true,
      width: 80,
      Cell: ({ row }) => (
        <IconButton
          color="primary"
          component="label"
          title="View"
          onClick={() => {
            navigate(`/content-events/${row?.original?.content_id}/`);
          }}
        >
          <VisibilityIcon />
        </IconButton>
      )
    }
  ];

  // Select the latest 5 transactions from the transactionHistory array
  const latestTransactionHistory = transactionHistory.slice(0, 5);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={3}>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isWaiting === true}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {showSubscriptionNotFoundText === true && (
        <>
          <Grid item xs={12}>
            <Typography>
              {
                'We regret to inform you that your current plan has expired. To ensure uninterrupted access to our services and avoid any potential issues, we kindly request you to upgrade to a new plan.'
              }
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
              <Button variant="contained" onClick={() => navigate('/subscribe-plan')}>
                Upgrade Now
              </Button>
            </Stack>
          </Grid>
        </>
      )}
      {/* Display total persona left if active plan details exist */}
      {Object.keys(activePlanDetails).length > 0 && (
        <>
          {!rateLimit &&
            <>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    {/* Total Persona Left */}
                    <AnalyticEcommerce title="Persona" count={activePlanDetails?.plan_details?.unique_personas} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    {/* Total Users Access */}
                    <AnalyticEcommerce title="Total Users Access" count={activePlanDetails?.plan_details?.user_access} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    {/* Words Left */}
                    <AnalyticEcommerce title="Words Left" count={activePlanDetails?.subscription_info?.words_left} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                    {/* Images Left */}
                    <AnalyticEcommerce title="Images Left" count={activePlanDetails?.subscription_info?.images_left} />
                </Grid>
                <Grid item xs={12} md={5} lg={12}>
                    {/* Activated Plan */}
                    {/* <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h5">Activated Plan</Typography>
                    </Grid>
                    <Grid item />
                    </Grid>
                    <MainCard sx={{ mt: 2 }} content={false}>
                    <Box sx={{ p: 3, pb: 0 }}>
                        <Stack spacing={2}>
                        <Typography variant="h4">{activePlanDetails?.plan_details?.name}</Typography>
                        <Typography variant="h3" color="GrayText">{`$ ${activePlanDetails?.plan_details?.price}`}</Typography>
                        <Typography variant="caption" color="textSecondary">
                            Your plan will expire on{' '}
                            <Typography component="span" variant="caption" sx={{ color: 'primary' }}>
                            {moment(activePlanDetails?.subscription_info.end_date).format('MMMM Do YYYY, H:mm a')}
                            </Typography>{' '}
                        </Typography>
                        </Stack>
                    </Box>
                    </MainCard> */}
                </Grid>
            </>
          }
        </>
        )}
        {!contentRateLimit && 
        <>
        <Grid item xs={12} md={7} lg={8}>
            <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
                <Typography variant="h5">Content History</Typography>
            </Grid>
            <Grid item />
            </Grid>
            <MainCard sx={{ mt: 2 }} content={false}>
            {/* Content History Table */}
            {contentHistory?.results?.length > 0 && <ReactTable columns={content_columns} data={contentHistory?.results} />}
            </MainCard>
        </Grid>
        </>
        }
        {!transactionLimit && (
          <>
 <Grid item xs={12} md={5} lg={4}>
            {/* <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                <Typography variant="h5">Transaction History</Typography>
                </Grid>
                <Grid item />
            </Grid>
            <MainCard sx={{ mt: 2 }} content={false}>
               
                <List
                component="nav"
                sx={{
                    px: 0,
                    py: 0
                }}
                >
                {latestTransactionHistory?.length > 0 &&
                    latestTransactionHistory.map((item, index) => (
                    <ListItemButton divider key={index}>
                        <ListItemText
                        primary={<Typography variant="subtitle1">{item.transaction_id}</Typography>}
                        secondary={moment(item.created_at).format('MMMM Do YYYY, H:mm a')}
                        />
                        <ListItemSecondaryAction>
                        <Stack alignItems="flex-end">
                            <Typography variant="h6" noWrap>
                            ${item.amount}
                            </Typography>
                        </Stack>
                        </ListItemSecondaryAction>
                    </ListItemButton>
                    ))}
                </List>
            </MainCard> */}
            <MainCard sx={{ mt: 2 }}>
                <Stack spacing={3}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                    <Stack>
                        <Typography variant="h5" noWrap>
                        Help & Support Chat
                        </Typography>
                        <Typography variant="caption" color="secondary" noWrap>
                        Typical replay within 5 min
                        </Typography>
                    </Stack>
                    </Grid>
                    <Grid item>
                    <AvatarGroup sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                        <Avatar alt="Remy Sharp" src={avatar1} />
                        <Avatar alt="Travis Howard" src={avatar2} />
                        <Avatar alt="Cindy Baker" src={avatar3} />
                        <Avatar alt="Agnes Walker" src={avatar4} />
                    </AvatarGroup>
                    </Grid>
                </Grid>
                <Button component="a" href="mailto:support@crossml.com" size="small" variant="contained" sx={{ textTransform: 'capitalize' }}>
                    Need Help?
                </Button>
                </Stack>
            </MainCard>
        </Grid>
          </>
        )}
    </Grid>
  );
};
export default Dashboard;
