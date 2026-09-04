import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import { Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import apiClient from '../../api/client.js';


//defines our DataGrid columns and maps them to our backend API response data
const baseColumns = [
  { field: 'id', headerName: 'ID', width: 70  },
  { field: 'call_id', headerName: 'Call ID', width: 150 , type: 'number' },
  { field: 'file_url', headerName: 'File URL', width: 160 , flex: 1 },
  { field: 'notes', headerName: 'Notes', width: 120 , flex: 1 }]


//local state variables for tracking table rows, loading status, and network errors
//to track the lifecycle of the async API request so the UI can render appropriately
function DiagnosticDataGrid({ onSuccess ,role}) {
  const [diagnostic, setDiagnostics] = useState([]);
  const [id, setId] = useState(0)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adddialogOpen, setaddDialogOpen] = useState(false);
  const [editdialogOpen, seteditDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    call_id: '',
    file_url: '',
    notes: '',
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
                            call_id: params.row.call_id,
                            file_url: params.row.file_url,
                            notes: params.row.notes,
                        });
            seteditDialogOpen(true)}}
      />
    ],
    },
    ];
  const columns = role != 'AUDITOR' ? [...baseColumns, ...actionColumns] : baseColumns;

  //React effect hook that runs our async fetch 
  async function fetchReports() {
      
      setLoading(true);
      try {
        const response = await apiClient.get('/diagnosticreports');
        setDiagnostics(response.data);
        setError(null);
      } catch {
          setError('Could not load fleet data.');
      } finally {
          setLoading(false);
      }
    }

     useEffect(() => {
      fetchReports();
    }, []);

    const handleFieldChange = (field) => (event) => {
      setFormValues((prev)=> ({ ...prev, [field]: event.target.value}));
    }

    const handleCreate = async() => {
        try {
            await apiClient.post('/diagnosticreports', {
                ...formValues,
            call_id: Number(formValues.call_id),
            });
            setaddDialogOpen(false);
            setFormValues({call_id: '', file_url: '', notes: ''});
            onSuccess(`Report for Call ${formValues.call_id} has been created.`);
            await fetchReports(); //see the table data refreshed with the new robot
        } catch {
            //a real app would surface this inline in the dialog
        }
    }

    const handleEdit = async() => {
        try {
            await apiClient.put(`/diagnosticreports/${id}`, {
                ...formValues,
            call_id: Number(formValues.call_id),
            });
            seteditDialogOpen(false);
            setId(0)
            setFormValues({call_id: '', file_url: '', notes: ''});
            onSuccess(`Report for Call ${formValues.call_id} Edited.`);
            await fetchReports(); //see the table data refreshed with the new robot
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
       {role != 'AUDITOR' && (<Button variant="outlined" sx={{ mb: 2}} onClick={() => setaddDialogOpen(true)}>Add Report</Button>)}
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={diagnostic} columns={columns} getRowId={(row) => row.id} />
    </Box>

    <Dialog open={adddialogOpen} onClose={() => setaddDialogOpen(false)}>
      <DialogTitle>Add New Report</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 300}}>
          <TextField label="Call ID" type="number" value={formValues.call_id} onChange={handleFieldChange('call_id')} />
          <TextField label="File URL" value={formValues.file_url} onChange={handleFieldChange('file_url')} />
          <TextField label="Notes" value={formValues.notes} onChange={handleFieldChange('notes')} />
          
          
        </Stack>
      </DialogContent>
            <DialogActions>
              <Button onClick={() => setaddDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreate}>Create</Button>
            </DialogActions>

    </Dialog>

    <Dialog open={editdialogOpen} onClose={() => seteditDialogOpen(false)} >
      <DialogTitle>Edit Report</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 300}}>
          <TextField label="Call ID" type="number" value={formValues.call_id} onChange={handleFieldChange('call_id')} />
          <TextField label="File URL" value={formValues.file_url} onChange={handleFieldChange('file_url')} />
          <TextField label="Notes" value={formValues.notes} onChange={handleFieldChange('notes')} />
        </Stack>
      </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setFormValues({
                                call_id: '',
                                file_url: '',
                                notes: '',
                            })
                seteditDialogOpen(false)}}>Cancel</Button>
              <Button variant="contained" onClick={handleEdit}>Edit</Button>
            </DialogActions>

    </Dialog>
    </Box>
  );
}

export default DiagnosticDataGrid; 