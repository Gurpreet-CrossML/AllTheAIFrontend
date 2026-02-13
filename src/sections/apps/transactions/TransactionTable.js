//material-ui
import { Grid, Stack, Typography, Chip, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

//used to structure and style the content of a page
import MainCard from 'components/MainCard';

//used to manage component state and side effects
import React, { useEffect, useState } from 'react';
import { filterChange, getList, pageChange, pageSizeChange, downloadInvoice } from '_api/transactions';

// method used for dob format
import moment from 'moment';

import ScrollX from 'components/ScrollX';
import { ALLTHEAI } from 'config';
import { CustomDataGrid } from 'utils/helper';
import { string } from 'prop-types';
import { useNavigate } from 'react-router';
import { error429 } from 'pages/maintenance/ErrorMessage';
import toast from 'utils/ToastNotistack';

/**
 * Status Cell
 */
const StatusCell = ({ value }) => {
  switch (value) {
    case 'failed':
      return <Chip color="error" label="Failed" size="small" variant="light" />;
    case 'completed':
      return <Chip color="success" label="Completed" size="small" variant="light" />;
    default:
      return <Chip color="error" label="Failed" size="small" variant="light" />;
  }
};
StatusCell.propTypes = {
  value: string
};

const TransactionHistory = () => {
  const [count, setCount] = useState(0);
  const [transactionList, setTransactionList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [rateLimit, setRateLimit] = useState(false);

  /**
   * @method [getTransactionHistory] to fetch the list from the server
   */
  useEffect(() => {
    document.title = `Transaction History | ${ALLTHEAI}`;
    getTransactionHistory();
  }, []);

  const getTransactionHistory = () => {
    setIsLoading(true);
    getList().then(
      (response) => {
        setIsLoading(false);
        setTransactionList(response.data.data.results);
        setCount(response?.data?.data?.count);
      },
      (error) => {
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
      }
    );
  };

  /**
   * @method [columns]
   */

  const columns = [
    {
      headerName: 'Transaction ID',
      field: 'transaction_id',
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      width: 290
    },
    {
      headerName: 'Subscription',
      field: 'subscription',
      renderCell: (params) => <Typography>{params.row?.subscription_name}</Typography>,
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      width: 200
    },
    {
      headerName: 'Amount',
      field: 'amount',
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      width: 200,
      renderCell: (params) => {
        const formattedValue = `$${params.row.amount}`;
        return <span>{formattedValue}</span>;
      }
    },
    {
      headerName: 'Payment Gateway',
      field: 'payment_gateway',
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      width: 230
    },
    {
      headerName: 'Transaction Status',
      field: 'transaction_status',
      renderCell: StatusCell,
      disableColumnMenu: true,
      width: 232,
      sortable: false,
      filterable: false
    },
    {
      headerName: 'Created At',
      field: 'created_at',
      width: 250,
      disableColumnMenu: true,
      renderCell: (params) => moment(params.row.created_at).format('MMMM Do YYYY, H:mm a')
    },
    {
      headerName: 'Actions',
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      width: 192,
      renderCell: (params) => (
        <IconButton
          color="primary"
          title="Download"
          onClick={() => {
            downloadInvoice(params.row.id)
              .then((res) => {
                window.open(res.data.data.invoice, '_blank');
              })
              .catch((err) => {
                if (err.response) {
                  if (err.response.status === 401) {
                    localStorage.clear();
                    navigate('/auth/login');
                  } else if (err.response.status === 429) {
                    setRateLimit(true);
                    toast(error429, {
                      variant: 'error'
                    });
                  } else {
                    toast(err.response.data.message, {
                      variant: 'error'
                    });
                  }
                }
              });
          }}
        >
          <DownloadIcon />
        </IconButton>
      )
    }
  ];
  /**
   * @method [onFilterChange] to handle the
   * @param {Object} value
   */
  const onFilterChange = async (value) => {
    try {
      const searchText = value.quickFilterValues.length > 0 ? value.quickFilterValues?.[0] : '';
      const res = await filterChange(searchText);

      if (res?.data?.data.results?.length > 0) {
        const arrItems = res?.data?.data?.results;
        setTransactionList(arrItems);
        setCount(res.data.data.count);
      } else {
        setTransactionList(res?.data?.data?.results);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/auth/login');
      } else {
        toast.error(error?.response?.data.message);
      }
    }
  };

  /**
   * @method [onPageChange] to change the page for data
   * @param {Object} data
   */
  const onPageChange = async (data) => {
    try {
      const res = await pageChange(data);

      if (res?.data?.data.results.length > 0) {
        const arrItems = res?.data?.data.results;
        setTransactionList(arrItems);
        setCount(res.data.data.count);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login');
        } else {
          toast(error.response.data.message, {
            variant: 'error'
          });
        }
      }
    }
  };

  /**
   * @method [onPageSizeChange] to change the size of page
   * @param {Object} data
   */
  const onPageSizeChange = async (data) => {
    try {
      const res = await pageSizeChange(data);
      if (res?.data?.data.results.length > 0) {
        const arrItems = res?.data?.data.results;
        setTransactionList(arrItems);
        setCount(res.data.data.count);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login');
        } else {
          toast(error.response.data.message, {
            variant: 'error'
          });
        }
      }
    }
  };

  return (
    <>
      {!rateLimit && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ marginTop: '10px' }}>
              <MainCard content={false}>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}></Stack>
                <ScrollX>
                  <CustomDataGrid
                    columns={columns}
                    rows={transactionList?.length > 0 ? transactionList : []}
                    loading={isLoading}
                    components={{
                      NoRowsOverlay: () => (
                        <Stack height="100%" alignItems="center" justifyContent="center">
                          No record found
                        </Stack>
                      )
                    }}
                    autoHeight={true}
                    getRowId={(row) => row?.id}
                    rowCount={count}
                    getRowHeight={() => 'auto'}
                    disableSelectionOnClick={true}
                    pagination
                    paginationMode="server"
                    filterMode="server"
                    onFilterModelChange={onFilterChange}
                    onPageChange={(data) => {
                      onPageChange(data);
                    }}
                    onPageSizeChange={(data) => {
                      onPageSizeChange(data);
                    }}
                    initialState={{
                      pagination: {
                        pageSize: 25
                      }
                    }}
                  />
                </ScrollX>
              </MainCard>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};
export default TransactionHistory;
