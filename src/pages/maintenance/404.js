import { Link } from 'react-router-dom'; //eslint-disable-line

// project import
import { APP_DEFAULT_PATH } from 'config'; //eslint-disable-line

// material-ui
import { Box, Button, Grid, Stack, Typography } from '@mui/material'; //eslint-disable-line

// assets
// import error404 from 'assets/images/maintenance/Error404.png';
// import TwoCone from 'assets/images/maintenance/TwoCone.png';
import { DASHBOARD_PAGE } from 'config';


// ==============================|| ERROR 404 - MAIN ||============================== //

function Error404() {
    return (
        <>
            <Grid
                container
                spacing={10}
                direction="column"
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: '100vh', pt: 1.5, pb: 1, overflow: 'hidden' }}
            >
                <Grid item xs={12}>
                    <Stack direction="row">
                        <Grid item>
                            <Box >
                                <img src="/assets/images/pagenotfound.png" alt="mantis" style={{ maxWidth: '100%', height: 'auto' }} />
                            </Box>
                        </Grid>
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <Stack spacing={1} justifyContent="center" alignItems="center">
                        <Button component={Link} to={DASHBOARD_PAGE} variant="contained">
                            Back To Home
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </>
    );
}

export default Error404;
