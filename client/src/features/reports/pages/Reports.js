import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const Reports = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 14, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports
        </Typography>
        <Typography variant="body1">
          You have successfully accessed the Reports section. This area is currently under development.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Coming Soon:</Typography>
          <ul>
            <li>Monthly sales reports</li>
            <li>Order status analytics</li>
            <li>Client performance metrics</li>
            <li>Custom report generation</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default Reports;