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
import AuthContext from '../../auth/AuthContext';
import apiProtected from '../../../services/api/secureApi';
import { isWithinLast30Days, filterOrders } from '../utils/DashboardUtils';
import DashboardFilters from '../components/DashboardFilters';
import OrdersSection from '../components/OrdersSection';
import DeleteOrderDialog from '../components/DeleteOrderDialog';
import { useTheme, Theme } from '@mui/material';

interface Order {
  id: number;
  order_status: number;
  lookup_code_order: string;
  reference_number?: string;
  contact: number;
  shipping_address: number;
  order_type: number;
  created_date: string;
  delivery_date?: string;
  modified_date?: string;
}

interface OrderStatus {
  id: number;
  status_name: string;
}

interface OrderType {
  id: number;
  // Otros campos según se necesiten
}

interface Contact {
  id: number;
  company_name?: string;
  contact_name?: string;
}

interface Address {
  id: number;
  city?: string;
  state?: string;
}

interface AuthContextType {
  user: any;
  loading: boolean;
}

const Dashboard: React.FC = () => {
  const { user, loading } = useContext(AuthContext) as AuthContextType;
  const navigate = useNavigate();
  const theme: Theme = useTheme();

  // API Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  
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
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
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
        setOrders(ordersRes.data);
        setOrderStatuses(statusesRes.data);
        setOrderTypes(typesRes.data);
        setContacts(contactsRes.data);
        setAddresses(addressesRes.data);
      } catch (err) {
        setOrdersError('Error loading orders or statuses.');
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
    
    // Check delivery_date first, fall back to modified_date
    if (order.delivery_date) {
      return isWithinLast30Days(order.delivery_date);
    } 
    return isWithinLast30Days(order.modified_date);
  });

  // Navigation handlers
  const handleEditClick = (orderId: number) => navigate(`/edit-order/${orderId}`);
  const handleViewClick = (orderId: number) => navigate(`/order/${orderId}`);
  
  // Delete handlers
  const handleDeleteClick = (orderId: number) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
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

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setSelectedTab(newValue);

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
      />

      {/* Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Dashboard;
