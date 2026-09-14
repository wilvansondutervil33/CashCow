import { Container, Typography, Box, Snackbar, Alert} from '@mui/material'
import {useState} from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppHeader from './components/layout/AppHeader.jsx'

import LoginForm from './components/auth/LoginForm.jsx';
import BranchDataGrid from './components/branches/BranchDataGrid.jsx';
import AtmDataGrid from './components/atms/atmDataGrid.jsx';
import DiagnosticDataGrid from './components/diagnostic/DiagnosticDataGrid.jsx';
import CallDataGrid from './components/calls/CallDataGrid.jsx';
import BusinessDataGrid from './components/business/BusinessDataGrid.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import SigleBranch from './components/branches/Branch.jsx';
import AnalyticsPage from './components/analytics/AnalyticsPage.jsx';
import UserDataGrid from './components/users/UserDataGrid.jsx';

//a main dashboard component that renders the application header and robot data grid to authenticated users
function Dashboard(){
  //stores the current user object and logout function from the global AuthContext
  const {user, logout} = useAuth()
  const [notification, setNotification] = useState(null)
  return (
    <>
     <BrowserRouter>
      <AppHeader username={user?.sub} role={user?.role} onLogout={logout}>
        <Routes>
          <Route path='/' element = {
              <Container maxWidth="lg" sx={{ mt: 4}}>
              <Typography variant="h5" component="h2" gutterBottom>
                Fleet Overview
              </Typography>
              <Box sx={{ mb: 4}}>
                <BranchDataGrid onSuccess={setNotification} role={user?.role}/>
              </Box>
              
            </Container>
          } exact={true}/>
          <Route path='/branches/:id' element = {<SigleBranch onSuccess={setNotification} role={user?.role} />} exact={true}/>
          <Route path='/analytics' element = {<AnalyticsPage onSuccess={setNotification} role={user?.role} />} exact={true}/>
          <Route path='/servicecalls' element = {<CallDataGrid onSuccess={setNotification} role={user?.role} />} exact={true}/>
          <Route path='/reports' element = {<DiagnosticDataGrid onSuccess={setNotification} role={user?.role} />} exact={true}/>
          {user?.role == 'Operations Admin' && <Route path='/users' element = {<UserDataGrid onSuccess={setNotification} role={user?.role} />} exact={true}/>}
          <Route path='*' element = {
            <Typography variant="h5" component="h2" gutterBottom>
                404
              </Typography>
          }/>

          
        </Routes>
        <Snackbar
          open={Boolean(notification)}
          autoHideDuration={4000}
          onClose={() => setNotification(null)}>
            <Alert severity="success" onClose={() => setNotification(null)}>
              {notification}
            </Alert>
        </Snackbar>
        </AppHeader>
      </BrowserRouter>
      
      
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
  const [notification, setNotification] = useState(null)
  return (
      <AuthProvider>
        <AppContent />
      </AuthProvider>
  )
}

export default App;