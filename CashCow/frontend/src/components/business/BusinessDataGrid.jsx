import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Box, CircularProgress, Typography} from '@mui/material';
import apiClient from '../../api/client.js';


//defines our DataGrid columns and maps them to our backend API response data
const colocationColumns = [
  { field: 'id', headerName: 'ID', width: 70 , type: 'number', flex: 1 },
  { field: 'title', headerName: 'Title', width: 150 , flex: 1 },
  { field: 'priority', headerName: 'Priority', width: 160 , flex: 1 },
  { field: 'atm_id', headerName: 'Atm ID', width: 120, type: 'number' , flex: 1 },
  { field: 'status', headerName: 'Status', width: 130 , flex: 1 },
  { field: 'technician_id', headerName: 'Technician ID', width: 110, type: 'number' , flex: 1 }]

const lowcashColumns = [
  { field: 'id', headerName: 'ID', width: 70 , flex: 1 },
  { field: 'serial_number', headerName: 'Serial Number', width: 150 , flex: 1 },
  { field: 'model', headerName: 'Model', width: 160 , flex: 1 },
  { field: 'cash_level', headerName: 'CASH', width: 120, type: 'number' , flex: 1 },
  { field: 'status', headerName: 'Status', width: 130 , flex: 1 },
  { field: 'branch_id', headerName: 'Branch ID', width: 110, type: 'number' , flex: 1 }]

const flagColumns = [
  { field: 'id', headerName: 'ID', width: 70 , flex: 1 },
  { field: 'name', headerName: 'Name', width: 150 , flex: 1 },
  { field: 'location_region', headerName: 'Location Region', width: 160 , flex: 1 },
  { field: 'capacity', headerName: 'Capacity', width: 120, type: 'number' , flex: 1 },
  { field: 'supervisor_id', headerName: 'Supervisor ID', width: 110, type: 'number' , flex: 1 }]

const metricsColumns = [
  { field: 'model', headerName: 'ATM Models', width: 70 , flex: 1 },
  { field: 'completed', headerName: 'Completed', width: 150 , type: 'number', flex: 1 },
  { field: 'failed', headerName: 'Failed', width: 160 , type: 'number', flex: 1 }]

const reportColumns = [
  { field: 'id', headerName: 'ID', width: 70 , flex: 1 },
  { field: 'name', headerName: 'Name', width: 150 , flex: 1 },
  { field: 'branch_id', headerName: 'Branch ID', width: 110, type: 'number' , flex: 1 }]
  
//local state variables for tracking table rows, loading status, and network errors
//to track the lifecycle of the async API request so the UI can render appropriately
function BusinessDataGrid({ onSuccess}) {
  const [colo, setColos] = useState([]);
  const [low, setLows] = useState([]);
  const [flag, setFlags] = useState([]);
  const [metr, setMetrs] = useState([]);
  const [repo, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  //React effect hook that runs our async fetch 
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


  async function fetchLow() {
      setLoading(true);
      try {
        const response = await apiClient.get('/business/lowcost');
        setLows(response.data);
        setError(null);
      } catch {
          setError('Could not load fleet data.');
      } finally {
          setLoading(false);
      }
    }

  async function fetchflag() {
      setLoading(true);
      try {
        const response = await apiClient.get('/business/flags');
        setFlags(response.data);
        setError(null);
      } catch {
          setError('Could not load fleet data.');
      } finally {
          setLoading(false);
      }
    }


  async function fetchMetr() {
      setLoading(true);
      try {
        const response = await apiClient.get('/business/metrics');
        setMetrs(response.data);
        setError(null);
      } catch {
          setError('Could not load fleet data.');
      } finally {
          setLoading(false);
      }
    }

    async function fetchReport() {
      setLoading(true);
      try {
        const listB = await apiClient.get('/branches')
        for (let i = 0; i < listB.length; i++){
          supId = listB.data[i].supervisor_id
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
      fetchColo();
      fetchLow();
      fetchflag();
      fetchMetr();
      fetchReport();
    }, []);

  
  //shows a spinning progress indicator if loading data
  if (loading) return <CircularProgress />;
  //shows error alert if API call fails
  if (error) return <Alert severity="error">{error}</Alert>;

  //loads data grid component if all goes well
  return (
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
      {low && (
        <>
        <Typography variant="h5" component="h2" gutterBottom>
          Low Cash ATM Alert
        </Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid rows={low} columns={lowcashColumns} getRowId={(row) => row.id} />
        </Box>
        </>
      )}
      {flag && (
        <>
        <Typography variant="h5" component="h2" gutterBottom>
          30% of ATM in Maintenance
        </Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid rows={flag} columns={flagColumns} getRowId={(row) => row.id} />
        </Box>
        </>
      )}
      {metr && (
        <>
        <Typography variant="h5" component="h2" gutterBottom>
          ATM Completed / Failed ratio
        </Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid rows={metr} columns={metricsColumns} getRowId={(row) => row.model} />
        </Box>
        </>
      )}
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
    </Box>
  );
}

export default BusinessDataGrid; 