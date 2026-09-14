
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/client.js';
import AtmDataGrid from '../atms/atmDataGrid';
import { CircularProgress, Container, Typography, Box, Alert} from '@mui/material';


function SigleBranch({ onSuccess , role}){
    const { id } = useParams()
    const [branch, setBranch] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null)
    


    async function fetchBranch() {
      setLoading(true);
      try {
        const response = await apiClient.get(`/branches/${id}`);
        setBranch(response.data);
        setError(null);
      } catch {
          setError('Could not load fleet data.');
      } finally {
          setLoading(false);
      }
    }

     useEffect(() => {
      fetchBranch();
    }, []);

    //shows a spinning progress indicator if loading data
    if (loading) return <CircularProgress />;
    //shows error alert if API call fails
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4}}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {branch.name}
                </Typography>
                <Box sx={{ mb: 4}}>
                    <AtmDataGrid onSuccess={setNotification} role={role} branch_id= {id}/>
                </Box>
            </Container>
        </>

    );

}

export default SigleBranch