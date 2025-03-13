import React from 'react';
import { 
  Paper, 
  Typography, 
  Divider
} from '@mui/material';
import { findItemById, displayValue } from '../../utils/displayUtils';
import OrderSummarySection from './OrderSummarySection';
import InfoItem from './InfoItem';
import MaterialsTable from './MaterialsTable';

/**
 * A reusable component to display order summary information
 * Used in both OrderView and ReviewStep components
 * 
 * @param {Object} orderData - The order data to display
 * @param {Object} referenceData - Object containing reference data collections
 * @param {Array} materials - List of available materials
 * @param {Array} materialItems - List of materials associated with this order
 * @param {Boolean} isReviewMode - Whether this component is used in review mode
 */
const OrderSummary = ({ 
  orderData,
  referenceData,
  materials = [],
  materialItems = [],
  isReviewMode = false
}) => {
  // Helper functions to get values from reference data
  const getOrderTypeName = () => findItemById(referenceData.orderTypes, orderData.order_type, 'type_name');
  const getOrderClassName = () => findItemById(referenceData.orderClasses, orderData.order_class, 'class_name');
  const getWarehouseName = () => findItemById(referenceData.warehouses, orderData.warehouse, 'name');
  const getProjectName = () => findItemById(referenceData.projects, orderData.project, 'name');
  const getCarrierName = () => findItemById(referenceData.carriers, orderData.carrier, 'name');
  const getServiceName = () => findItemById(referenceData.carrierServices, orderData.service_type, 'name');
  const getMaterialName = (id) => findItemById(materials, id, 'name');

  // Helper function to render contact information
  const getContactInfo = () => {
    const contact = referenceData.contacts?.find(item => item.id === orderData.contact);
    if (!contact) return <Typography variant="body1">Unknown</Typography>;
  
    const parts = [];
  
    if (contact.company_name) {
      parts.push(
        <Typography key="company" variant="body1" component="span">
          {contact.company_name}
        </Typography>
      );
    }
  
    if (contact.contact_name) {
      if (parts.length > 0) {
        parts.push(
          <Typography key="contact" variant="body1" component="span" sx={{ display: 'block' }}>
            {contact.contact_name}
          </Typography>
        );
      } else {
        parts.push(
          <Typography key="contact" variant="body1" component="span">
            {contact.contact_name}
          </Typography>
        );
      }
    }
  
    if (contact.attention) {
      parts.push(
        <Typography key="attention" variant="body2" component="span" color="text.secondary" sx={{ display: 'block' }}>
          Attn: {contact.attention}
        </Typography>
      );
    }
  
    if (parts.length === 0) {
      return <Typography variant="body1" style={{ color: 'rgba(0, 0, 0, 0.6)', fontStyle: 'italic' }}>Not specified</Typography>;
    }
  
    return parts;
  };

  // Helper function to render address information
  const getAddressInfo = (addressId) => {
    const address = referenceData.addresses?.find(item => item.id === addressId);
    if (!address) return 'Unknown';
    
    const parts = [];
    
    if (address.address_line_1) parts.push(address.address_line_1);
    if (address.address_line_2) parts.push(address.address_line_2);
    
    const cityStateZip = [];
    if (address.city) cityStateZip.push(address.city);
    if (address.state) cityStateZip.push(address.state);
    if (address.postal_code) cityStateZip.push(address.postal_code);
    
    if (cityStateZip.length > 0) {
      parts.push(cityStateZip.join(', '));
    }
    
    if (address.country) parts.push(address.country);
    
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Check if materials are selected
  const hasMaterials = materialItems && materialItems.length > 0;

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Order Summary
        </Typography>
        
        {/* Basic Order Information Section */}
        <OrderSummarySection title="Basic Order Information">
          <InfoItem label="Order Type" value={getOrderTypeName()} />
          <InfoItem label="Order Class" value={getOrderClassName()} />
          <InfoItem label="Order Number" value={orderData.lookup_code_order} className="order-number" />
          <InfoItem label="Reference Number" value={displayValue(orderData.reference_number)} />
        </OrderSummarySection>

        <Divider sx={{ my: 2 }} />
        
        {/* Logistics Information Section */}
        <OrderSummarySection title="Logistics Information">
          <InfoItem label="Warehouse" value={getWarehouseName()} />
          <InfoItem label="Project" value={getProjectName()} />
          <InfoItem
            label="Carrier"
            value={orderData.carrier ? getCarrierName() : displayValue()}
          />
          <InfoItem
            label="Service Type"
            value={orderData.service_type ? getServiceName() : displayValue()}
          />
        </OrderSummarySection>

        <Divider sx={{ my: 2 }} />
        
        {/* Delivery Information Section */}
        <OrderSummarySection title="Delivery Information">
          <InfoItem
            label="Customer"
            value={getContactInfo()}
            colSize={{ xs: 12, sm: 6 }}
          />
          <InfoItem
            label="Expected Delivery Date"
            value={displayValue(orderData.expected_delivery_date)}
            colSize={{ xs: 12, sm: 6 }}
          />
          <InfoItem
            label="Shipping Address"
            value={getAddressInfo(orderData.shipping_address)}
            colSize={{ xs: 12, sm: 6 }}
          />
          <InfoItem
            label="Billing Address"
            value={getAddressInfo(orderData.billing_address)}
            colSize={{ xs: 12, sm: 6 }}
          />
        </OrderSummarySection>

        {/* Notes Section (Conditional) */}
        {orderData.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <OrderSummarySection title="Additional Information">
              <InfoItem 
                label="Notes" 
                value={orderData.notes} 
                colSize={{ xs: 12 }}
              />
            </OrderSummarySection>
          </>
        )}
      </Paper>

      {/* Materials Section */}
      {hasMaterials ? (
        <MaterialsTable
          materialItems={materialItems}
          getMaterialName={getMaterialName}
          displayValue={displayValue}
          isReviewMode={isReviewMode}
        />
      ) : (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" color={isReviewMode ? "error" : "text.primary"} sx={{ mb: 1 }}>
            No Materials Selected
          </Typography>
          <Typography variant="body1">
            {isReviewMode 
              ? "Please go back to the Materials step and select at least one material for this order."
              : "This order does not have any materials associated with it."}
          </Typography>
        </Paper>
      )}
    </>
  );
};

export default OrderSummary;