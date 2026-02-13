import { Grid, IconButton, Stack, Typography } from '@mui/material';
import { filterChange, generateImagesList, pageChange, pageSizeChange } from '_api/image-generation';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import React, { useEffect, useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router';
import { capitalizeString } from 'config';
import moment from 'moment';
import { ALLTHEAI } from 'config';
import { CustomDataGrid } from 'utils/helper';
import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { error429 } from 'pages/maintenance/ErrorMessage';

const ImageHistory = () => {
  const navigate = useNavigate();
  const [imageHistory, setImageHistory] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState(false);

  /**
   * Added Page title and Retrieve Images from the Server
   */
  useEffect(() => {
    document.title = `Images History | ${ALLTHEAI}`;
    retrieveImage();
  }, []);

  /**
   * @method [retrieveImage] use to retrieve image
   */
  const retrieveImage = async () => {
    try {
      setIsLoading(true);
      const response = await generateImagesList();
      setIsLoading(false);
      setImageHistory(response.data.data.results);
      setCount(response?.data?.data?.count);
    } catch (error) {
      setIsLoading(false);
      if (error.response.status === 429) {
        setRateLimit(true);
        toast(error429, {
          variant: 'error'
        });
      }
    }
  };

  const columns = [
    {
      width: 328,
      headerName: 'Prompt',
      field: 'prompt',
      disableColumnMenu: true,
      renderCell: (params) => (
        <>
          {params?.row?.prompt.length > 60 && params?.row?.prompt.substring(0, 60) + '...'}
          {params?.row?.prompt.length < 60 && params?.row?.prompt}
        </>
      )
    },
    {
      headerName: 'AI Model',
      field: 'ai_model',
      width: 215,
      disableColumnMenu: true,
      renderCell: (params) => capitalizeString(params?.row?.ai_model)
    },
    {
      width: 215,
      headerName: 'No. of Images',
      field: 'number_of_images',
      disableColumnMenu: true
    },
    {
      width: 215,
      headerName: 'Size',
      field: 'size',
      disableColumnMenu: true,
      renderCell: (params) => capitalizeString(params?.row?.size)
    },
    {
      width: 215,
      headerName: 'Created At',
      field: 'created_at',
      disableColumnMenu: true,
      renderCell: (params) => moment(params.row?.created_at).format('MMMM Do YYYY, H:mm a')
    },
    {
      headerName: 'Actions',
      field: 'image_content_id',
      width: 200,
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            component="label"
            title="View"
            onClick={() => {
              localStorage.setItem('isTemplateId', JSON.stringify(false));
              navigate(`/image_detail/${params.row?.image_content_id}/`);
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </>
      )
    }
  ];

  /**
   * @method [onFilterChange] to handle the
   * @param {Object} value
   */
  const onFilterChange = async (value) => {
    try {
      const searchText = value.quickFilterValues.length > 0 ? value.quickFilterValues : '';
      const res = await filterChange(searchText);

      if (res?.data?.data.results?.length > 0) {
        const arrItems = res?.data?.data?.results;
        setImageHistory(arrItems);
        setCount(res.data.data.count);
      } else {
        setImageHistory(res?.data?.data?.results);
      }
    } catch (error) {
      if (error.response.status === 429) {
        toast(error429, {
          variant: 'error'
        });
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
        setImageHistory(arrItems);
        setCount(res.data.data.count);
      }
    } catch (error) {
      if (error.response.status === 429) {
        toast(error429, {
          variant: 'error'
        });
      } else {
        toast.error(error?.response?.data.message);
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
        setImageHistory(arrItems);
        setCount(res.data.data.count);
      }
    } catch (error) {
      if (error.response.status === 429) {
        toast(error429, {
          variant: 'error'
        });
      } else {
        toast.error(error?.response?.data.message);
      }
    }
  };

  /**
   * @method [onRowClick] to handle row click for navigation
   * @param {Object} params
   */
  const onRowClick = (params) => {
    const imageContentId = params.row?.image_content_id;
    if (imageContentId) {
      localStorage.setItem('isTemplateId', JSON.stringify(false));
      navigate(`/image_detail/${imageContentId}/`);
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

  return (
    <>
      <Typography variant="h2" marginBottom={3}>
        Images History{' '}
      </Typography>
      {!rateLimit && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ marginTop: '10px' }}>
              <MainCard content={false}>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}></Stack>
                <ScrollX>
                  <CustomDataGrid
                    columns={columns}
                    rows={imageHistory?.length > 0 ? imageHistory : []}
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
                    getRowId={(row) => row?.image_content_id}
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

export default ImageHistory;
