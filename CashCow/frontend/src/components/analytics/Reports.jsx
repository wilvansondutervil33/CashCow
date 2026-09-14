import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Alert, Box, CircularProgress, Typography} from '@mui/material';
import apiClient from '../../api/client.js';


function Reports () {
    const [repo, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    

    const reportColumns = [
        { field: 'id', headerName: 'ID', width: 70 , flex: 1 },
        { field: 'name', headerName: 'Name', width: 150 , flex: 1 },
        { field: 'branch_id', headerName: 'Branch ID', width: 110, type: 'number' , flex: 1 }]
    
    async function fetchReport() {
      setLoading(true);
      try {
        const listB = await apiClient.get('/branches')
        
        for (let i = 0; i < listB.data.length; i++){
            supId = listB.data[i].supervisor_id
            console.log(supId)
          const response = await apiClient.get(`/report/${supId}`);
          setRepos([...repo, ...response.data]);
        }
        setError(null);
        console.log(repo)
      } catch {
          setError('Could not load fleet data.');
      } finally {
          setLoading(false);
      }
    }

    useEffect(() => {
      fetchReport();
    }, []);

    if (loading) return <CircularProgress />;
    //shows error alert if API call fails
    if (error) return <Alert severity="error">{error}</Alert>;

    return(
        <Box>
            {repo.length > 0 && (
                    <>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Report
                    </Typography>
                    <Box sx={{ height: 400, width: '100%' }}>
                      <DataGrid rows={repo} columns={reportColumns} getRowId={(row) => row.model} />
                    </Box>
                    </>
                  )}
            {!repo.length && (
                <Typography variant="h5" component="h2" gutterBottom>
                        NO Open Service Calls found
                    </Typography>
            )}
        </Box>
    )
}


export default Reports;