import React from 'react';
import { Paper, Typography, Divider } from '@mui/material';
import { findItemById, displayValue } from '../../utils/displayUtils';
import OrderSummarySection from './OrderSummarySection';
import InfoItem from './InfoItem';
import MaterialsTable from './MaterialsTable';

interface OrderSummaryProps {
  orderData: any;
  referenceData: any;
  materials?: any[];
  materialItems?: any[];
  isReviewMode?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderData,
  referenceData,
  materials = [],
  materialItems = [],
  isReviewMode = false,
}) => {
  // Helpers para obtener nombres de referencia
  const getOrderTypeName = () =>
    findItemById(referenceData.orderTypes, orderData.order_type, 'type_name');
  const getOrderClassName = () =>
    findItemById(referenceData.orderClasses, orderData.order_class, 'class_name');
  const getWarehouseName = () =>
    findItemById(referenceData.warehouses, orderData.warehouse, 'name');
  const getProjectName = () =>
    findItemById(referenceData.projects, orderData.project, 'name');
  const getCarrierName = () =>
    findItemById(referenceData.carriers, orderData.carrier, 'name');
  const getServiceName = () =>
    findItemById(referenceData.carrierServices, orderData.service_type, 'name');
  const getMaterialName = (id: any) =>
    findItemById(materials, id, 'name');

  // Helper para renderizar la información de contacto
  const getContactInfo = () => {
    const contact = referenceData.contacts?.find(
      (item: any) => item.id === orderData.contact
    );
    if (!contact) return <Typography variant="body1">Unknown</Typography>;

    const parts: React.ReactNode[] = [];

    if (contact.company_name) {
      parts.push(
        <Typography key="company" variant="body1" component="span">
          {contact.company_name}
        </Typography>
      );
    }

    if (contact.contact_name) {
      parts.push(
        <Typography
          key="contact"
          variant="body1"
          component="span"
          sx={{ display: parts.length > 0 ? 'block' : 'inline' }}
        >
          {contact.contact_name}
        </Typography>
      );
    }

    if (contact.attention) {
      parts.push(
        <Typography
          key="attention"
          variant="body2"
          component="span"
          color="text.secondary"
          sx={{ display: 'block' }}
        >
          Attn: {contact.attention}
        </Typography>
      );
    }

    if (parts.length === 0) {
      return (
        <Typography
          variant="body1"
          style={{ color: 'rgba(0, 0, 0, 0.6)', fontStyle: 'italic' }}
        >
          Not specified
        </Typography>
      );
    }

    return parts;
  };

  // Helper para renderizar la dirección
  const getAddressInfo = (addressId: any) => {
    const address = referenceData.addresses?.find(
      (item: any) => item.id === addressId
    );
    if (!address) return 'Unknown';

    const parts: string[] = [];

    if (address.address_line_1) parts.push(address.address_line_1);
    if (address.address_line_2) parts.push(address.address_line_2);

    const cityStateZip: string[] = [];
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

  const hasMaterials = materialItems && materialItems.length > 0;

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Order Summary
        </Typography>

        {/* Basic Order Information */}
        <OrderSummarySection title="Basic Order Information">
          <InfoItem label="Order Type" value={getOrderTypeName()} />
          <InfoItem label="Order Class" value={getOrderClassName()} />
          <InfoItem
            label="Order Number"
            value={orderData.lookup_code_order}
            className="order-number"
          />
          <InfoItem
            label="Reference Number"
            value={displayValue(orderData.reference_number)}
          />
        </OrderSummarySection>

        <Divider sx={{ my: 2 }} />

        {/* Logistics Information */}
        <OrderSummarySection title="Logistics Information">
          <InfoItem label="Warehouse" value={getWarehouseName()} />
          <InfoItem label="Project" value={getProjectName()} />
          <InfoItem
            label="Carrier"
            value={
              orderData.carrier ? getCarrierName() : displayValue(undefined)
            }
          />
          <InfoItem
            label="Service Type"
            value={
              orderData.service_type ? getServiceName() : displayValue(undefined)
            }
          />
        </OrderSummarySection>

        <Divider sx={{ my: 2 }} />

        {/* Delivery Information */}
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

        {/* Additional Information (Notes) */}
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
          <Typography
            variant="h6"
            color={isReviewMode ? 'error' : 'text.primary'}
            sx={{ mb: 1 }}
          >
            No Materials Selected
          </Typography>
          <Typography variant="body1">
            {isReviewMode
              ? 'Please go back to the Materials step and select at least one material for this order.'
              : 'This order does not have any materials associated with it.'}
          </Typography>
        </Paper>
      )}
    </>
  );
};

export default OrderSummary;
