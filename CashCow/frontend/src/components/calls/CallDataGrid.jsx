import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import apiClient from '../../api/client.js';


//defines our DataGrid columns and maps them to our backend API response data
const baseColumns = [
  { field: 'id', headerName: 'ID', width: 70 , type: 'number', flex: 1 },
  { field: 'title', headerName: 'Title', width: 150 , flex: 1 },
  { field: 'priority', headerName: 'Priority', width: 160 , flex: 1 },
  { field: 'atm_id', headerName: 'Atm ID', width: 120, type: 'number' , flex: 1 },
  { field: 'status', headerName: 'Status', width: 130 , flex: 1 },
  { field: 'technician_id', headerName: 'Technician ID', width: 110, type: 'number' , flex: 1 }]





const STATUS_OPTIONS = ['Pending', 'In-Progress', 'Completed', 'Failed']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'Critical']

//local state variables for tracking table rows, loading status, and network errors
//to track the lifecycle of the async API request so the UI can render appropriately
function CallDataGrid({ onSuccess ,role}) {
  const [calls, setCalls] = useState([]);
  const [id, setId] = useState(0)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adddialogOpen, setaddDialogOpen] = useState(false);
  const [editdialogOpen, seteditDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    title: '',
    priority: 'Low',
    atm_id: '',
    technician_id: '',
    status: 'Pending',
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
                            title: params.row.title,
                            priority: params.row.priority,
                            atm_id: params.row.atm_id,
                            technician_id: params.row.technician_id,
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
  async function fetchCalls() {
      setLoading(true);
      try {
        const response = await apiClient.get('/servicecalls');
        setCalls(response.data);
        setError(null);
      } catch {
          setError('Could not load fleet data.');
      } finally {
          setLoading(false);
      }
    }

     useEffect(() => {
      fetchCalls();
    }, []);

    const handleFieldChange = (field) => (event) => {
      setFormValues((prev)=> ({ ...prev, [field]: event.target.value}));
    }

    const handleCreate = async() => {
        try {
            await apiClient.post('/servicecalls', {
                ...formValues,
            atm_id: Number(formValues.atm_id),
            technician_id: Number(formValues.technician_id),
            });
            setaddDialogOpen(false);
            setFormValues({title: '', priority: 'Low', atm_id: '', technician_id: '', status: 'Pending'});
            onSuccess(`Call ${formValues.title} created.`);
            await fetchCalls(); //see the table data refreshed with the new robot
        } catch {
            //a real app would surface this inline in the dialog
        }
    }

    const handleEdit = async() => {
        try {
            await apiClient.put(`/servicecalls/${id}`, {
                ...formValues,
            id : id,
            atm_id: Number(formValues.atm_id),
            technician_id: Number(formValues.technician_id),
            });
            seteditDialogOpen(false);
            setId(0)
            setFormValues({title: '', priority: 'Low', atm_id: '', technician_id: '', status: 'Pending'});
            onSuccess(`Call ${formValues.title} Edited.`);
            await fetchCalls(); //see the table data refreshed with the new robot
        } catch (e){
            console.log(e.response?.data);//a real app would surface this inline in the dialog
        }
    }

    const handleDelete = async(callid) => {
        try {
            await apiClient.delete(`/servicecalls/${callid}`);

            onSuccess(`Call ${formValues.title} Deleted.`);
            await fetchCalls(); //see the table data refreshed with the new robot
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
       {role == 'Operations Admin' && (<Button variant="outlined" sx={{ mb: 2}} onClick={() => setaddDialogOpen(true)}>Add Service Call</Button>)}
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={calls} columns={columns} getRowId={(row) => row.id} />
    </Box>

    <Dialog open={adddialogOpen} onClose={() => setaddDialogOpen(false)}>
      <DialogTitle>Add New Service Call</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 300}}>
          <TextField label="Title" value={formValues.title} onChange={handleFieldChange('title')} />
          <TextField label="Atm ID" type="number" value={formValues.atm_id} onChange={handleFieldChange('atm_id')} />
          <TextField label="Technician ID" type="number" value={formValues.technician_id} onChange={handleFieldChange('technician_id')} />
          <TextField select label="Status" value={formValues.status} onChange={handleFieldChange('status')}>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Priority" value={formValues.priority} onChange={handleFieldChange('priority')}>
            {PRIORITY_OPTIONS.map((option) => (
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
          <TextField label="Title" value={formValues.title} onChange={handleFieldChange('title')} />
          <TextField label="Atm ID" type="number" value={formValues.atm_id} onChange={handleFieldChange('atm_id')} />
          <TextField label="Technician ID" type="number" value={formValues.technician_id} onChange={handleFieldChange('technician_id')} />
          <TextField select label="Status" value={formValues.status} onChange={handleFieldChange('status')}>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Priority" value={formValues.priority} onChange={handleFieldChange('priority')}>
            {PRIORITY_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setFormValues({
                                 title: '',
                                 priority: 'Low',
                                 atm_id: '',
                                 technician_id: '',
                                 status: 'Pending',
                            })
                seteditDialogOpen(false)}}>Cancel</Button>
              <Button variant="contained" onClick={handleEdit}>Edit</Button>
            </DialogActions>

    </Dialog>
    </Box>
  );
}

export default CallDataGrid; 