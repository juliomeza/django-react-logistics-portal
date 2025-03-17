import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTheme, Theme } from '@mui/material';
import AuthContext from '../../auth/AuthContext';
import apiProtected from '../../../services/api/secureApi';
import { isWithinLast30Days, filterOrders } from '../utils/DashboardUtils';
import DashboardFilters from '../components/DashboardFilters';
import OrdersSection from '../components/OrdersSection';
import DeleteOrderDialog from '../components/DeleteOrderDialog';
import { AuthUserData } from '../../../types/auth';
import { 
  UIOrder, 
  UIOrderStatus, 
  UIOrderType, 
  UIContact, 
  UIAddress,
  adaptOrders,
  adaptOrderStatuses,
  adaptOrderTypes,
  adaptContacts,
  adaptAddresses
} from '../../../types/adapters';

interface AuthContextType {
  user: AuthUserData | null;
  loading: boolean;
}

type AlertSeverity = 'success' | 'error';

const Dashboard: React.FC = () => {
  const { user, loading } = useContext(AuthContext) as AuthContextType;
  const navigate = useNavigate();
  const theme: Theme = useTheme();

  // API Data States
  const [orders, setOrders] = useState<UIOrder[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<UIOrderStatus[]>([]);
  const [orderTypes, setOrderTypes] = useState<UIOrderType[]>([]);
  const [contacts, setContacts] = useState<UIContact[]>([]);
  const [addresses, setAddresses] = useState<UIAddress[]>([]);
  
  // UI States
  const [searchText, setSearchText] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [ordersError, setOrdersError] = useState<string>('');
  const [activeOrdersOpen, setActiveOrdersOpen] = useState<boolean>(true);
  const [deliveredOrdersOpen, setDeliveredOrdersOpen] = useState<boolean>(true);
  
  // Dialog and notification states
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertSeverity>('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, statusesRes, typesRes, contactsRes, addressesRes] = await Promise.all([
          apiProtected.get('orders/'),
          apiProtected.get('order-statuses/'),
          apiProtected.get('order-types/'),
          apiProtected.get('contacts/'),
          apiProtected.get('addresses/'),
        ]);
        
        console.log('API Orders:', JSON.stringify(ordersRes.data, null, 2));
        const adaptedOrders = adaptOrders(ordersRes.data);
        console.log('Adapted Orders:', JSON.stringify(adaptedOrders, null, 2));
        setOrders(adaptedOrders);
        
        console.log('API Statuses:', JSON.stringify(statusesRes.data, null, 2));
        const adaptedStatuses = adaptOrderStatuses(statusesRes.data);
        console.log('Adapted Statuses:', JSON.stringify(adaptedStatuses, null, 2));
        setOrderStatuses(adaptedStatuses);
        
        console.log('API Types:', JSON.stringify(typesRes.data, null, 2));
        const adaptedTypes = adaptOrderTypes(typesRes.data);
        console.log('Adapted Types:', JSON.stringify(adaptedTypes, null, 2));
        setOrderTypes(adaptedTypes);
        
        console.log('API Contacts:', JSON.stringify(contactsRes.data, null, 2));
        const adaptedContacts = adaptContacts(contactsRes.data);
        console.log('Adapted Contacts:', JSON.stringify(adaptedContacts, null, 2));
        setContacts(adaptedContacts);
        
        console.log('API Addresses:', JSON.stringify(addressesRes.data, null, 2));
        const adaptedAddresses = adaptAddresses(addressesRes.data);
        console.log('Adapted Addresses:', JSON.stringify(adaptedAddresses, null, 2));
        setAddresses(adaptedAddresses);
      } catch (err) {
        setOrdersError('Error loading orders or statuses.');
        console.error('Error fetching data:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter and sort orders
  const filteredOrders = filterOrders(
    orders, 
    contacts, 
    addresses, 
    orderTypes, 
    searchText, 
    selectedTab
  );

  // Separate active and recently delivered orders
  const activeOrders = filteredOrders.filter(order => order.order_status !== 7);
  const deliveredOrders = filteredOrders.filter(order => {
    if (order.order_status !== 7) return false;
    
    if (order.delivery_date) {
      return isWithinLast30Days(order.delivery_date);
    } 
    return order.modified_date ? isWithinLast30Days(order.modified_date) : false;
  });

  // Navigation handlers
  const handleEditClick = (orderId: number): void | Promise<void> => navigate(`/edit-order/${orderId}`);
  const handleViewClick = (orderId: number): void | Promise<void> => navigate(`/order/${orderId}`);
  
  // Delete handlers
  const handleDeleteClick = (orderId: number): void => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (orderToDelete === null) return;
    try {
      await apiProtected.delete(`/order-lines/order/${orderToDelete}/clear/`);
      await apiProtected.delete(`/orders/${orderToDelete}/`);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderToDelete));
      setSnackbarMessage('Order deleted successfully.');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to delete order. Please try again.');
      setSnackbarSeverity('error');
      console.error('Delete error:', err);
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteCancel = (): void => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => setSelectedTab(newValue);

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>Loading...</Typography>
      </Container>
    );
  }

  // Authentication check
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {/* Filters Bar */}
      <DashboardFilters 
        selectedTab={selectedTab}
        handleTabChange={handleTabChange}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 14, mb: 4 }}>
        {ordersLoading ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
            <Typography mt={2}>Loading orders...</Typography>
          </Box>
        ) : ordersError ? (
          <Typography color="error" align="center">{ordersError}</Typography>
        ) : filteredOrders.length === 0 ? (
          <Typography align="center">There are no orders to show.</Typography>
        ) : (
          <>
            <OrdersSection 
              orders={activeOrders} 
              title="Active Orders"
              subtitle="Orders in initial stages and being processed"
              isOpen={activeOrdersOpen}
              setIsOpen={setActiveOrdersOpen}
              orderStatuses={orderStatuses}
              contacts={contacts}
              addresses={addresses}
              theme={theme}
              handleEditClick={handleEditClick}
              handleViewClick={handleViewClick}
              handleDeleteClick={handleDeleteClick}
            />

            <OrdersSection 
              orders={deliveredOrders} 
              title="Recently Delivered"
              subtitle="Displayed for 30 days after delivery"
              isOpen={deliveredOrdersOpen}
              setIsOpen={setDeliveredOrdersOpen}
              orderStatuses={orderStatuses}
              contacts={contacts}
              addresses={addresses}
              theme={theme}
              handleEditClick={handleEditClick}
              handleViewClick={handleViewClick}
              handleDeleteClick={handleDeleteClick}
            />
          </>
        )}
      </Container>

      {/* Delete Dialog */}
      <DeleteOrderDialog 
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        order={orderToDelete ? orders.find(o => o.id === orderToDelete) : undefined}
      />

      {/* Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Dashboard;