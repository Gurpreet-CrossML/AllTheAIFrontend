import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Grid,
  IconButton,
  Stack,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  Chip
} from '@mui/material'; //eslint-disable-line
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  changeStatusForPersona,
  deletePersonaType,
  filterChange,
  getList,
  getPageSizePersona,
  getPersonaIndustryList,
  pageChange
} from '_api/personna';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import toast from 'utils/ToastNotistack';
import { ALLTHEAI } from 'config';
import { CustomDataGrid } from 'utils/helper';
import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { handleTruncate } from 'config';
import { error429 } from 'pages/maintenance/ErrorMessage';

const Personna = () => {
  const navigate = useNavigate();

  const [personnaList, setPersonnaList] = useState([]);
  const [openDeleteConfirmation, setOpenModalConfirmation] = useState(false);
  const [openStatusConfPopup, setOpenStatusConfPopup] = useState(false);
  const [selectedId, setSelectedId] = useState({ id: '', index: '', personaStatus: '' });
  const [count, setCount] = useState(0);
  const [industryList, setIndustryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState(false);
  const [rateDeleteLimit, setRateDeleteLimit] = useState(false);
  /**
   * @method [getIndustriesList] to fetch the industries list from the server
   */
  const getIndustriesList = async () => {
    try {
      const response = await getPersonaIndustryList();

      if (response?.data?.status === 'success') {
        setIndustryList(response.data.data);
      }
    } catch (error) {
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
   * Confirmation Popup for the status and delete
   */
  const ConfirmationPopup = ({ title, dialogText, open, onClose, handleCallback }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    return (
      <Dialog fullScreen={fullScreen} open={open} onClose={onClose} aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogText}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>No</Button>
          <Button onClick={handleCallback}>Yes</Button>
        </DialogActions>
      </Dialog>
    );
  };

  /**
   * @method [columns]
   */
  const columns = [
    {
      width: 180,
      headerName: 'Name',
      field: 'name',
      sortable: false,
      filterable: false,
      headerAlign: 'left',
      align: 'left',
      disableColumnMenu: true
    },
    {
      headerName: 'Target Audience',
      field: 'target_audience',
      width: 280,
      sortable: false,
      headerAlign: 'left',
      align: 'left',
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography>
          {params.row?.target_audience?.map((val, index, arr) => (
            <React.Fragment key={index}>
              {' ' + val.label}
              {index < arr.length - 1 && ', '}
            </React.Fragment>
          ))}
        </Typography>
      )
    },

    {
      headerName: 'Industry',
      field: 'industry',
      width: 210,
      disableColumnMenu: true,
      align: 'left',
      sortable: false,
      filterable: false,
      headerAlign: 'left',
      renderCell: (params) => (
        <>
          {industryList.map((option) =>
            option.id === params.row?.industry ? <Typography key={option.id}>{option.name}</Typography> : null
          )}
        </>
      )
    },
    {
      headerName: 'Status',
      field: 'persona_status',
      width: 190,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Chip
            onClick={() => {
              setSelectedId({ id: params.row.persona_id, personaStatus: params.row?.persona_status, index: params.row?.index });
              setOpenStatusConfPopup(true);
            }}
            color={params.row.persona_status === 'active' ? 'primary' : 'secondary'}
            label={params.row.persona_status === 'active' ? 'Active' : 'Deactive'}
            sx={{ cursor: 'pointer' }}
          />
        </>
      )
    },
    {
      width: 160,
      headerName: 'Competitors',
      field: 'competitors',
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Typography key={params.row.persona_id}>{params.row.competitors === '' ? '--' : handleTruncate(params.row.competitors)}</Typography>
      )
    },
    {
      headerName: 'Created At',
      field: 'created_at',
      headerAlign: 'left',
      align: 'left',
      disableColumnMenu: true,
      width: 190,
      renderCell: (params) => moment(params.row?.created_at).format('MMMM Do YYYY, H:mm a')
    },
    {
      headerName: 'Actions',
      field: 'content_id',
      headerAlign: 'left',
      width: 190,
      disableColumnMenu: true,
      align: 'left',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            title="Edit"
            component="label"
            onClick={() => {
              navigate(`/edit-persona/${params.row.persona_id}`);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="primary"
            title="Delete"
            component="label"
            onClick={() => {
              setSelectedId({ id: params.row?.persona_id });
              setOpenModalConfirmation(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];

  /**
   * @method [getPersonnaList] to fetch the list from the server
   */
  useEffect(() => {
    const authToken = localStorage?.getItem('token');
    if (!authToken) {
      navigate('/auth/login');
    }
    document.title = `Persona | ${ALLTHEAI}`;
    getPersonnaList();
    getIndustriesList();
  }, []);

  /**
   * @method [getPersonnaList] use to fetch the list of personas from the server
   */
  const getPersonnaList = async () => {
    try {
      setIsLoading(true);
      const response = await getList();

      if (response.status === 200) {
        setPersonnaList(response.data.data.results);
        setCount(response?.data?.data?.count);
      }

      setIsLoading(false);
    } catch (error) {
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
      setIsLoading(false);
    }
  };

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
        setPersonnaList(arrItems);
        setCount(res.data.data.count);
      } else {
        setPersonnaList(res?.data?.data?.results);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login');
        } else if (error.response.status === 429) {
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
   * @method [onPageChange] to change the page for data
   * @param {Object} data
   */
  const onPageChange = async (data) => {
    try {
      setIsLoading(true);
      const response = await pageChange(data);
      setIsLoading(false);

      if (response?.data?.data.results.length > 0) {
        const arrItems = response?.data?.data.results;
        setPersonnaList(arrItems);
        setCount(response.data.data.count);
      }
    } catch (error) {
      setIsLoading(false);

      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login');
        } else if (error.response.status === 429) {
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
   * @method [onPageSizeChange] to change the size of page
   * @param {Object} data
   */
  const onPageSizeChange = async (data) => {
    try {
      setIsLoading(true);
      const response = await getPageSizePersona(data);
      setIsLoading(false);

      if (response?.data?.data.results.length > 0) {
        const arrItems = response?.data?.data.results;
        setPersonnaList(arrItems);
        setCount(response.data.data.count);
      }
    } catch (error) {
      setIsLoading(false);

      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login');
        } else if (error.response.status === 429) {
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
          <Grid item xs={8} xl={11} md={10} sm={10} justifyContent="flex-start" alignItems="flex-start">
            <GridToolbarQuickFilter autoFocus />
          </Grid>
        </Grid>
      </GridToolbarContainer>
    );
  }

  /**
   * @method [changeStatus] to active and deactivate the field
   */
  const changeStatus = async () => {
    try {
      let statusValue = selectedId?.personaStatus === 'active' ? 'deactive' : 'active';

      const response = await changeStatusForPersona(selectedId?.id, statusValue);

      setOpenStatusConfPopup(false);
      getPersonnaList(); // Assuming you have a function to fetch the updated persona list
      toast(response.data.message, { variant: 'success' });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login');
        } else if (error.response.status === 429) {
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
   * @method [deletePersona] use to delete the persona from the list
   */
  const deletePersona = async () => {
    try {
      const response = await deletePersonaType(selectedId?.id);

      toast(response?.data?.message, { variant: 'success' });

      const updatedPersonnaList = personnaList.filter((list) => list?.persona_id !== selectedId?.id);
      setPersonnaList(updatedPersonnaList);
      setCount(count - 1);
      setOpenModalConfirmation(false);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate('/auth/login');
        } else if (error.response.status === 429) {
          setRateDeleteLimit(true);
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

  return (
    <>
      {!rateLimit && (
        <>
          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ marginTop: '10px', marginBottom: '10px' }}>
            <Typography>{''}</Typography>
            <Button
              variant="contained"
              onClick={() => {
                navigate('/add-persona');
              }}
              startIcon={<PlusOutlined />}
              size="small"
            >
              Add Personas
            </Button>
          </Stack>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ marginTop: '10px' }}>
              <MainCard content={false}>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}></Stack>
                <ScrollX>
                  <CustomDataGrid
                    sx={{ marginLeft: 1 }}
                    columns={columns}
                    rows={personnaList?.length > 0 ? personnaList : []}
                    loading={isLoading}
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
                    initialState={{
                      pagination: {
                        pageSize: 25
                      }
                    }}
                    autoHeight={true}
                    getRowId={(row) => row?.persona_id}
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
                  />
                </ScrollX>
                {/* Open Confirmation Popup for delete the User */}
                {!rateDeleteLimit && (
                  <>
                    <ConfirmationPopup
                      open={openDeleteConfirmation}
                      onClose={() => setOpenModalConfirmation(false)}
                      title="Confirmation!"
                      dialogText="Are you sure you want to delete this persona ?"
                      handleCallback={deletePersona}
                    />
                  </>
                )}

                {openStatusConfPopup === true && (
                  <ConfirmationPopup
                    open={openStatusConfPopup}
                    onClose={() => setOpenStatusConfPopup(false)}
                    title="Confirmation!"
                    dialogText="Are you sure you want to change the status ?"
                    handleCallback={changeStatus}
                  />
                )}
              </MainCard>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};
export default Personna;
