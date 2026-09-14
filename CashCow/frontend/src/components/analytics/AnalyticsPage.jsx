// pages/Analytics.jsx
import { Tabs, Tab, Box } from '@mui/material';
import { useState } from 'react';
import Reports from './Reports';
import CoLocation from './colocation';

function AnalyticsPage({ onSuccess}) {
  const [tab, setTab] = useState(0);

  return (
    <Box >
      <Tabs value={tab} onChange={(e, v) => setTab(v)}sx={{backgroundColor: 'lightgray'}}>
        <Tab label="Reports" />
        <Tab label="Service Calls" />
        <Tab label="Co-Location" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tab === 0 && <Reports />}
        {tab === 1 && <Reports />}
        {tab === 2 && <CoLocation />}
      </Box>
    </Box>
  );
}

export default AnalyticsPage;