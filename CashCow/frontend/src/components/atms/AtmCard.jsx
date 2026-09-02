import { Card, CardContent, Typography, Chip, Stack } from '@mui/material';

const LOW_CASH_THRESHOLD = 2000;

function AtmCard({ atm }) {
  const isLowCash = cash.cash_level < LOW_CASH_THRESHOLD;

  return (
    <Card variant="outlined" sx={{ minWidth: 240 }}>
      <CardContent>

        <Typography variant="h6" component="div">
          {atm.serialNumber}
        </Typography>

        <Typography color="text.secondary" gutterBottom>
          {atm.model}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={`${atm.cash_level} cash`}
            color={isLowCash ? 'error' : 'success'}
            size="small"
          />
          <Chip label={atm.status} variant="outlined" size="small" />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default AtmCard;