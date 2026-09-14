import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography} from '@mui/material';
import apiClient from '../../api/client.js';


function CoLocation () {
    const [colo, setColos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    

    const colocationColumns = [
        { field: 'id', headerName: 'ID', width: 70 , type: 'number', flex: 1 },
        { field: 'title', headerName: 'Title', width: 150 , flex: 1 },
        { field: 'priority', headerName: 'Priority', width: 160 , flex: 1 },
        { field: 'atm_id', headerName: 'Atm ID', width: 120, type: 'number' , flex: 1 },
        { field: 'status', headerName: 'Status', width: 130 , flex: 1 },
        { field: 'technician_id', headerName: 'Technician ID', width: 110, type: 'number' , flex: 1 }]
    
    async function fetchColo() {
      setLoading(true);
      try {
        const response = await apiClient.get('/business/colocation');
        setColos(response.data);
        setError(null);
      } catch {
          setError('Could not load fleet data.');
      } finally {
          setLoading(false);
      }
    }

    useEffect(() => {
      fetchColo();
    }, []);

    if (loading) return <CircularProgress />;
    //shows error alert if API call fails
    if (error) return <Alert severity="error">{error}</Alert>;

    return(
        <Box>
            {colo && (
                <>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Co-Location
                    </Typography>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid rows={colo} columns={colocationColumns} getRowId={(row) => row.id} />
                    </Box>
                </>
            )}
            {!colo && (
                <Typography variant="h5" component="h2" gutterBottom>
                        NO Co-Location found
                    </Typography>
            )}
        </Box>
    )
}


export default CoLocation;