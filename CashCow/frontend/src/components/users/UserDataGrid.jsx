import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, Box, Typography, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import apiClient from '../../api/client.js';


//defines our DataGrid columns and maps them to our backend API response data
const baseColumns = [
  { field: 'id', headerName: 'ID', width: 70 , type: 'number', flex: 1 },
  { field: 'username', headerName: 'Username', width: 150 , flex: 1 },
  { field: 'role', headerName: 'Role', width: 160 , flex: 1 }]



const ROLE_OPTIONS = ['Operations Admin', 'Field Technician', 'Auditor']

//local state variables for tracking table rows, loading status, and network errors
//to track the lifecycle of the async API request so the UI can render appropriately
function UserDataGrid({ onSuccess ,role}) {
  const [users, setUsers] = useState([]);
  const [id, setId] = useState(0)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adddialogOpen, setaddDialogOpen] = useState(false);
  const [editdialogOpen, seteditDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
    role: 'Field Technician',
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
                            username: params.row.username,
                            password: '',
                            role: params.row.role,
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
  async function fetchUsers() {
      setLoading(true);
      try {
        const response = await apiClient.get('/users');
        setUsers(response.data);
        setError(null);
      } catch {
          setError('Could not load fleet data.');
      } finally {
          setLoading(false);
      }
    }

     useEffect(() => {
      fetchUsers();
    }, []);

    const handleFieldChange = (field) => (event) => {
      setFormValues((prev)=> ({ ...prev, [field]: event.target.value}));
    }

    const handleCreate = async() => {
        try {
            await apiClient.post('/auth/register', {
                ...formValues
            });
            setaddDialogOpen(false);
            setFormValues({username: '', role: 'Field Technician'});
            onSuccess(`User ${formValues.username} created.`);
            await fetchUsers(); //see the table data refreshed with the new robot
        } catch {
            //a real app would surface this inline in the dialog
        }
    }

    const handleEdit = async() => {
        try {
            await apiClient.put(`/users/${id}`, {
                ...formValues,
            id : id
            });
            seteditDialogOpen(false);
            setId(0)
            setFormValues({username: '', role: 'Field Technician'});
            onSuccess(`User ${formValues.username} Edited.`);
            await fetchUsers(); //see the table data refreshed with the new robot
        } catch (e){
            console.log(e.response?.data);//a real app would surface this inline in the dialog
        }
    }

    const handleDelete = async(userid) => {
        try {
            await apiClient.delete(`/users/${userid}`);

            onSuccess(`Call ${formValues.title} Deleted.`);
            await fetchUsers(); //see the table data refreshed with the new robot
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
      <Typography variant="h6" component="h1">
        Users
      </Typography>
       {role == 'Operations Admin' && (<Button variant="outlined" sx={{ mb: 2}} onClick={() => setaddDialogOpen(true)}>Add User</Button>)}
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={users} columns={columns} getRowId={(row) => row.id} />
    </Box>

    <Dialog open={adddialogOpen} onClose={() => setaddDialogOpen(false)}>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 300}}>
          <TextField label="Username" value={formValues.username} onChange={handleFieldChange('username')} />
          <TextField label="Password" value={formValues.password} onChange={handleFieldChange('password')} />
          <TextField select label="Role" value={formValues.role} onChange={handleFieldChange('role')}>
            {ROLE_OPTIONS.map((option) => (
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
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 300}}>
          <TextField label="Username" value={formValues.username} onChange={handleFieldChange('username')} />
          <TextField label="Password" value={formValues.password} onChange={handleFieldChange('password')} />
          <TextField select label="Role" value={formValues.role} onChange={handleFieldChange('role')}>
            {ROLE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          
        </Stack>
      </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setFormValues({
                                 username: '',
                                 role: 'Field Technician',
                                 
                            })
                seteditDialogOpen(false)}}>Cancel</Button>
              <Button variant="contained" onClick={handleEdit}>Edit</Button>
            </DialogActions>

    </Dialog>
    </Box>
  );
}

export default UserDataGrid; 