import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import apiClient from '../../api/client.js';


//defines our DataGrid columns and maps them to our backend API response data
const baseColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'serial_number', headerName: 'Serial Number', width: 150 },
  { field: 'model', headerName: 'Model', width: 160 },
  { field: 'cash_level', headerName: 'CASH', width: 120, type: 'number' },
  { field: 'status', headerName: 'Status', width: 130 },
  { field: 'branch_id', headerName: 'Branch ID', width: 110, type: 'number' }]





const STATUS_OPTIONS = ['Operational', 'Low-Cash', 'Maintenance', 'Offline']

//local state variables for tracking table rows, loading status, and network errors
//to track the lifecycle of the async API request so the UI can render appropriately
function AtmDataGrid({ onSuccess ,role}) {
  const [atms, setAtms] = useState([]);
  const [id, setId] = useState(0)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adddialogOpen, setaddDialogOpen] = useState(false);
  const [editdialogOpen, seteditDialogOpen] = useState(false);
  const [deletedialogOpen, deletesetDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    serial_number: '',
    model: '',
    cash_level: '',
    branch_id: '',
    status: 'Offline',
  });

  const actionColumns = [
  {field: 'actions', type: 'actions', headerName: 'Actions', width: 100,
    getActions: (params) => [
      <GridActionsCellItem
        icon={<EditIcon />}
        label="Edit"
        onClick={() => {
            setId(params.row.id)
            setFormValues({
                            serial_number: params.row.serial_number,
                            model: params.row.model,
                            cash_level: params.row.cash_level,
                            branch_id: params.row.branch_id,
                            status: params.row.status,
                        });
            seteditDialogOpen(true)}}
      />,
      <GridActionsCellItem
        icon={<DeleteIcon />}
        label="Delete"
        onClick={() => handleDelete(params.row.id)}
      />,
    ],
    },
    ];
  const columns = role == 'Operations Admin' ? [...baseColumns, ...actionColumns] : baseColumns;

  //React effect hook that runs our async fetch 
  async function fetchAtms() {
      setLoading(true);
      try {
        const response = await apiClient.get('/atms');
        setAtms(response.data);
        setError(null);
      } catch {
          setError('Could not load fleet data.');
      } finally {
          setLoading(false);
      }
    }

     useEffect(() => {
      fetchAtms();
    }, []);

    const handleFieldChange = (field) => (event) => {
      setFormValues((prev)=> ({ ...prev, [field]: event.target.value}));
    }

    const handleCreate = async() => {
        try {
            await apiClient.post('/atms', {
                ...formValues,
            cash_level: Number(formValues.cash_level),
            branch_id: Number(formValues.branch_id),
            });
            setaddDialogOpen(false);
            setFormValues({serial_number: '', model: '', cash_level: '', branch_id: '', status: 'Offline'});
            onSuccess(`Atm ${formValues.serial_number} created.`);
            await fetchAtms(); //see the table data refreshed with the new robot
        } catch {
            //a real app would surface this inline in the dialog
        }
    }

    const handleEdit = async() => {
        try {
            await apiClient.put(`/atms/${id}`, {
                ...formValues,
            id : id,
            cash_level: Number(formValues.cash_level),
            branch_id: Number(formValues.branch_id),
            });
            seteditDialogOpen(false);
            setId(0)
            setFormValues({serial_number: '', model: '', cash_level: '', branch_id: '', status: 'Offline'});
            onSuccess(`Atm ${formValues.serial_number} Edited.`);
            await fetchAtms(); //see the table data refreshed with the new robot
        } catch (e){
            console.log(e.response?.data);//a real app would surface this inline in the dialog
        }
    }

    const handleDelete = async(atmid) => {
        try {
            await apiClient.delete(`/atms/${atmid}`);

            onSuccess(`Atm ${formValues.serial_number} Deleted.`);
            await fetchAtms(); //see the table data refreshed with the new robot
        } catch (e){
            console.log(e.response?.data);//a real app would surface this inline in the dialog
        }
    }
  
  //shows a spinning progress indicator if loading data
  if (loading) return <CircularProgress />;
  //shows error alert if API call fails
  if (error) return <Alert severity="error">{error}</Alert>;

  //loads data grid component if all goes well
  return (
    <Box>
       {role == 'Operations Admin' && (<Button variant="outlined" sx={{ mb: 2}} onClick={() => setaddDialogOpen(true)}>Add Atm</Button>)}
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={atms} columns={columns} getRowId={(row) => row.id} />
    </Box>

    <Dialog open={adddialogOpen} onClose={() => setaddDialogOpen(false)}>
      <DialogTitle>Add New Atm</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 300}}>
          <TextField label="Serial Number" value={formValues.serial_number} onChange={handleFieldChange('serial_number')} />
          <TextField label="Model" value={formValues.model} onChange={handleFieldChange('model')} />
          <TextField label="CASH Level" type="number" value={formValues.cash_level} onChange={handleFieldChange('cash_level')} />
          <TextField label="Branch ID" type="number" value={formValues.branch_id} onChange={handleFieldChange('branch_id')} />
          <TextField select label="Status" value={formValues.status} onChange={handleFieldChange('status')}>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
            <DialogActions>
              <Button onClick={() => setaddDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreate}>Create</Button>
            </DialogActions>

    </Dialog>

    <Dialog open={editdialogOpen} onClose={() => seteditDialogOpen(false)} >
      <DialogTitle>Edit Atm</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 300}}>
          <TextField label="Serial Number" value={formValues.serial_number} onChange={handleFieldChange('serial_number')} />
          <TextField label="Model" value={formValues.model} onChange={handleFieldChange('model')} />
          <TextField label="CASH Level" type="number" value={formValues.cash_level} onChange={handleFieldChange('cash_level')} />
          <TextField label="Branch ID" type="number" value={formValues.branch_id} onChange={handleFieldChange('branch_id')} />
          <TextField select label="Status" value={formValues.status} onChange={handleFieldChange('status')}>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setFormValues({
                                serial_number: '',
                                model: '',
                                cash_level: '',
                                branch_id: '',
                                status: 'Offline',
                            })
                seteditDialogOpen(false)}}>Cancel</Button>
              <Button variant="contained" onClick={handleEdit}>Edit</Button>
            </DialogActions>

    </Dialog>
    </Box>
  );
}

export default AtmDataGrid; 