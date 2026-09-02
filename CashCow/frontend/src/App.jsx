import { Container, Typography, Box} from '@mui/material'
import {useState} from 'react'
import AppHeader from './components/layout/AppHeader.jsx'
// import AtmList from './components/atms/AtmList.jsx'
// import DiscrepancyList from './components/missions/DiscrepancyList.jsx'
// import { mockRobots } from './mockData/robots.js'
// import {mockDiscrepancies} from './mockData/discrepancies.js'

import LoginForm from './components/auth/LoginForm.jsx';
// import AtmDataGrid from './components/atms/AtmDataGrid.jsx';
import AtmDataGrid from './components/atms/atmDataGrid.jsx';
//import DiscrepancyDataGrid from './components/missions/DiscrepancyDataGrid.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

//a main dashboard component that renders the application header and robot data grid to authenticated users
function Dashboard(){
  //stores the current user object and logout function from the global AuthContext
  const {user, logout} = useAuth()
  const [notification, setNotification] = useState(null)
  return (
    <>
      <AppHeader username={user?.sub} role={user?.role} onLogout={logout} />
      <Container maxWidth="lg" sx={{ mt: 4}}>
        <Typography variant="h5" component="h2" gutterBottom>
          Fleet Overview
        </Typography>
         <Box sx={{ mb: 4}}>
          <AtmDataGrid onSuccess={setNotification} role={user?.role}/>
        </Box>
        {/*<Typography variant="h5" component="h2" gutterBottom>
          Co-Location Discrepancies
        </Typography>
        <Box sx={{ mb: 4}}>
          <DiscrepancyDataGrid />
        </Box> */}
      </Container>
    </>
  );
}

//conditional layout switcher component that renders either the Dashboard or the login form
//based on the user's authentication status, tracked in the global AuthContext
function AppContent() {
  const {isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

//acts as a root application component that wraps the entire app in the AuthProvider context
function App(){
  return (
      <AuthProvider>
        <AppContent />
      </AuthProvider>
  )
}

export default App;