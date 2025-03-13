import React, { ReactNode } from 'react';
import Header from './Header';
import { Box } from '@mui/material';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <Box sx={{ height: '32px' }} />
      <Box sx={{ p: 2 }}>
        {children}
      </Box>
    </>
  );
};

export default MainLayout;
