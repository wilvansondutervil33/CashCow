import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from '@mui/material/Link';
import { Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import apiClient from '../../api/client.js';


//defines our DataGrid columns and maps them to our backend API response data
const baseColumns = [
  { field: 'id', headerName: 'ID', width: 70 , flex: 1 },
  { field: 'name', headerName: 'Name', width: 150 , flex: 1, 
    // renderCell: (params) => (
    //   <Link href={`/branches/${params.row.id}`} underline="hover">
    //     {params.value}
    //   </Link>
    // )
  },
  { field: 'location_region', headerName: 'Location Region', width: 160 , flex: 1 },
  { field: 'capacity', headerName: 'Capacity', width: 120, type: 'number' , flex: 1 },
  { field: 'supervisor_id', headerName: 'Supervisor ID', width: 110, type: 'number' , flex: 1 }]




//local state variables for tracking table rows, loading status, and network errors
//to track the lifecycle of the async API request so the UI can render appropriately
function BranchDataGrid({ onSuccess ,role}) {
  const [branches, setBranches] = useState([]);
  const [id, setId] = useState(0)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adddialogOpen, setaddDialogOpen] = useState(false);
  const [editdialogOpen, seteditDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    location_region: '',
    capacity: '',
    supervisor_id: '',
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
                            name: params.row.name,
                            location_region: params.row.location_region,
                            capacity: params.row.capacity,
                            supervisor_id: params.row.supervisor_id,
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
  async function fetchBranches() {
      setLoading(true);
      try {
        const response = await apiClient.get('/branches');
        setBranches(response.data);
        setError(null);
      } catch {
          setError('Could not load fleet data.');
      } finally {
          setLoading(false);
      }
    }

     useEffect(() => {
      fetchBranches();
    }, []);

    const handleFieldChange = (field) => (event) => {
      setFormValues((prev)=> ({ ...prev, [field]: event.target.value}));
    }

    const handleCreate = async() => {
        try {
            await apiClient.post('/branches', {
                ...formValues,
            capacity: Number(formValues.capacity),
            supervisor_id: Number(formValues.supervisor_id),
            });
            setaddDialogOpen(false);
            setFormValues({name: '', location_region: '', capacity: '', supervisor_id: ''});
            onSuccess(`Branch ${formValues.name} created.`);
            await fetchBranches(); //see the table data refreshed with the new robot
        } catch {
            //a real app would surface this inline in the dialog
        }
    }

    const handleEdit = async() => {
        try {
            await apiClient.put(`/branches/${id}`, {
                ...formValues,
            id : id,
            cash_level: Number(formValues.cash_level),
            supervisor_id: Number(formValues.supervisor_id),
            });
            seteditDialogOpen(false);
            setId(0)
            setFormValues({name: '', location_region: '', capacity: '', supervisor_id: ''});
            onSuccess(`Branch ${name.serial_number} Edited.`);
            await fetchBranches(); //see the table data refreshed with the new robot
        } catch (e){
            console.log(e.response?.data);//a real app would surface this inline in the dialog
        }
    }

    const handleDelete = async(branchid) => {
        try {
            await apiClient.delete(`/branches/${branchid}`);

            onSuccess(`Branch ${formValues.name} Deleted.`);
            await fetchBranches(); //see the table data refreshed with the new robot
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
       {role == 'Operations Admin' && (<Button variant="outlined" sx={{ mb: 2}} onClick={() => setaddDialogOpen(true)}>Add Branch</Button>)}
    <Box sx={{ height: 400, width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
      <DataGrid rows={branches} columns={columns} getRowId={(row) => row.id} />
    </Box>

    <Dialog open={adddialogOpen} onClose={() => setaddDialogOpen(false)}>
      <DialogTitle>Add New Branch</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 300}}>
          <TextField label="Name" value={formValues.name} onChange={handleFieldChange('name')} />
          <TextField label="Location Region" value={formValues.location_region} onChange={handleFieldChange('location_region')} />
          <TextField label="Capacity" type="number" value={formValues.capacity} onChange={handleFieldChange('capacity')} />
          <TextField label="Supervisor ID" type="number" value={formValues.supervisor_id} onChange={handleFieldChange('supervisor_id')} />
        </Stack>
      </DialogContent>
            <DialogActions>
              <Button onClick={() => setaddDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreate}>Create</Button>
            </DialogActions>

    </Dialog>

    <Dialog open={editdialogOpen} onClose={() => seteditDialogOpen(false)} >
      <DialogTitle>Edit Branch</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 300}}>
          <TextField label="Name" value={formValues.name} onChange={handleFieldChange('name')} />
          <TextField label="Location Region" value={formValues.location_region} onChange={handleFieldChange('location_region')} />
          <TextField label="Capacity" type="number" value={formValues.capacity} onChange={handleFieldChange('capacity')} />
          <TextField label="Supervisor ID" type="number" value={formValues.supervisor_id} onChange={handleFieldChange('supervisor_id')} />
        </Stack>
      </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setFormValues({
                                name: '',
                                location_region: '',
                                capacity: '',
                                supervisor_id: 'Offline',
                            })
                seteditDialogOpen(false)}}>Cancel</Button>
              <Button variant="contained" onClick={handleEdit}>Edit</Button>
            </DialogActions>

    </Dialog>
    </Box>
  );
}

export default BranchDataGrid; 