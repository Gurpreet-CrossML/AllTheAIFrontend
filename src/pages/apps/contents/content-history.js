import { Chip, Grid, IconButton, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { filterChange, historyOfContent, pageChange, pageSize } from '_api/contents';
import { string } from 'prop-types';
import { useNavigate } from 'react-router';
import { handleTruncate } from 'config';
import { ALLTHEAI } from 'config';
import { CustomDataGrid } from 'utils/helper';
import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { error429 } from 'pages/maintenance/ErrorMessage';
import toast from 'utils/ToastNotistack';

/**
 * Status Cell
 */
const StatusCell = ({ value }) => {
  switch (value) {
    case 'draft':
      return <Chip color="error" label="Draft" size="small" variant="light" />;
    case 'verified':
      return <Chip color="success" label="Verified" size="small" variant="light" />;
    case 'published':
      return <Chip color="success" label="Published" size="small" variant="light" />;
    default:
      return <Chip color="error" label="Draft" size="small" variant="light" />;
  }
};
StatusCell.propTypes = {
  value: string
};

const ContentHistory = () => {
  const navigate = useNavigate();
  const [contentHistory, setContentHistory] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [previousPageUrl, setPreviousPageUrl] = useState('');
  const [nextPageUrl, setNextPageUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(25);
  const [muiTableKey, setMuiTableKey] = React.useState(0);
  const [quickFilterValue, setQuickFilterValue] = React.useState([]);
  const [rateLimit, setRateLimit] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (authToken == null) {
      navigate('/auth/login');
    }
    document.title = `Content History | ${ALLTHEAI}`;
    getHistoryOfGeneratedContent();
  }, []);

  const columns = [
    {
      headerName: 'Template Name',
      field: 'template_name',
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      width: 221
    },
    {
      headerName: 'Persona Name',
      field: 'persona',
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      width: 221
    },
    {
      headerName: 'Content Description',
      field: 'content',
      width: 290,
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      renderCell: (params) => handleTruncate(params?.row?.content[0]?.blocks[0]?.text)
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 230,
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      renderCell: StatusCell
    },
    {
      headerName: 'Created At',
      field: 'created_at',
      width: 222,
      disableColumnMenu: true,
      renderCell: (params) => moment(params.row?.created_at).format('MMMM Do YYYY, H:mm a')
    },
    {
      headerName: 'Actions',
      field: 'content_id',
      width: 220,
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          color="primary"
          component="label"
          title="View"
          onClick={() => {
            navigate(`/content-events/${params.row?.content_id}/`);
          }}
        >
          <VisibilityIcon />
        </IconButton>
      )
    }
  ];

  /**
   * @method [getHistoryOfGeneratedContent] use to get the content of the history of all generated content
   */
  const getHistoryOfGeneratedContent = async () => {
    try {
      /*API Promise */
      setIsLoading(true);
      const response = await historyOfContent();

      if (response.status === 200) {
        setIsLoading(false);
        setContentHistory(response.data.data.results);
        setCount(response.data.data.count);
        setPreviousPageUrl(response.data.data.previous);
        setNextPageUrl(response.data.data.next);
      }
    } catch (error) {
      setIsLoading(false);
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
  };

  /**
   *
   * @returns TextField
   */
  function CustomToolbar() {
    const headers = [];
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].field !== 'action') {
        const headerObj = { label: columns[i].headerName, key: columns[i].field };
        headers.push(headerObj);
      }
    }

    return (
      <GridToolbarContainer>
        <Grid container display={'flex'}>
          <Grid item xs={8} xl={11} md={10} sm={10} justifyContent={'flex-start'} alignItems={'flex-start'}>
            <GridToolbarQuickFilter autoFocus />
          </Grid>
        </Grid>
      </GridToolbarContainer>
    );
  }

  /**
   * @method [onFilterChange] to handle the
   * @param {Object} value
   */
  const onFilterChange = async (value) => {
    try {
      const searchText = value.quickFilterValues.length > 0 ? value.quickFilterValues.join(' ') : '';
      setQuickFilterValue(value.quickFilterValues);

      const res = await filterChange(searchText);

      if (res?.data?.data.results?.length > 0) {
        const arrItems = res?.data?.data?.results;
        setContentHistory(arrItems);
        setCount(res.data.data.count);

        setPreviousPageUrl(res.data.data.previous);
        setNextPageUrl(res.data.data.next);
        setMuiTableKey((prevKey) => prevKey + 1);
      } else {
        setContentHistory(res?.data?.data?.results);
      }
    } catch (error) {
      if (error.response && error.response.status === '401') {
        localStorage.clear();
        navigate('/auth/login'); // Redirect to the login page if the token is invalid
      } else if (error.response.status === 429) {
        toast(error429, {
          variant: 'error'
        });
      }
      toast.error(error?.response?.data?.message);
    }
  };

  /**
   * @method [onPageChange] to change the page for data
   * @param {Object} data
   */
  const onPageChange = async (data) => {
    try {
      let url;
      if (data < currentPage) {
        url = previousPageUrl;
      } else {
        url = nextPageUrl;
      }

      const res = await pageChange(url);

      if (res?.data?.data.results.length > 0) {
        const arrItems = res?.data?.data.results;
        setContentHistory(arrItems);
        setCount(res.data.data.count);

        setPreviousPageUrl(res.data.data.previous);
        setNextPageUrl(res.data.data.next);

        setCurrentPage(data);
      }
    } catch (error) {
      if (error.response && error.response.status === '401') {
        localStorage.clear();
        navigate('/auth/login'); // Redirect to the login page if the token is invalid
      } else if (error.response.status === 429) {
        toast(error429, {
          variant: 'error'
        });
      }
      toast.error(error?.response?.data?.message);
    }
  };

  /**
   * @method [onPageSizeChange] to change the size of page
   * @param {Object} data
   */
  const onPageSizeChange = async (data) => {
    try {
      setCurrentPageSize(data);

      const res = await pageSize(data);

      if (res?.data?.data.results.length > 0) {
        const arrItems = res?.data?.data.results;
        setContentHistory(arrItems);
        setCount(res.data.data.count);

        setPreviousPageUrl(res.data.data.previous);
        setNextPageUrl(res.data.data.next);
        setCurrentPage(0);
        setMuiTableKey((prevKey) => prevKey + 1);
      }
    } catch (error) {
      if (error.response && error.response.status === '401') {
        localStorage.clear();
        navigate('/auth/login'); // Redirect to the login page if the token is invalid
      } else if (error.response.status === 429) {
        toast(error429, {
          variant: 'error'
        });
      }
      toast.error(error?.response?.data?.message);
    }
  };

  /**
   * @method [onRowClick] to handle row click for navigation
   * @param {Object} params
   */
  const onRowClick = (params) => {
    const ContentId = params.row?.content_id;
    if (ContentId) {
      localStorage.setItem('isTemplateId', JSON.stringify(false));
      navigate(`/content-events/${ContentId}/`);
    }
  };

  return (
    <>
      <Typography variant="h2" marginBottom={3}>
        Content History{' '}
      </Typography>
      {!rateLimit && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ marginTop: '10px' }}>
              <MainCard content={false}>
                <ScrollX>
                  {/* Content history table */}
                  <CustomDataGrid
                    key={muiTableKey}
                    columns={columns}
                    rows={contentHistory?.length > 0 ? contentHistory : []}
                    loading={isLoading}
                    onRowClick={onRowClick}
                    components={{
                      Toolbar: CustomToolbar,
                      NoResultsOverlay: () => (
                        <Stack height="100%" alignItems="center" justifyContent="center">
                          No record found
                        </Stack>
                      ),
                      NoRowsOverlay: () => (
                        <Stack height="100%" alignItems="center" justifyContent="center">
                          No record found
                        </Stack>
                      )
                    }}
                    autoHeight={true}
                    getRowId={(row) => row?.content_id}
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
                        pageSize: currentPageSize
                      },
                      filter: {
                        filterModel: {
                          items: [],
                          quickFilterValues: quickFilterValue
                        }
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

export default ContentHistory;
