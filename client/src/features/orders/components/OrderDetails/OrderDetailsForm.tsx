import React from 'react';
import BasicOrderInfoStep from './BasicOrderInfoStep';
import LogisticsInfoStep from './LogisticsInfoStep';
import DeliveryInfoStep from './DeliveryInfoStep';
import AdditionalInfoStep from './AdditionalInfoStep';

interface OrderDetailsFormProps {
  formData: any;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  orderTypes?: any[];
  orderClasses?: any[];
  warehouses?: any[];
  projects?: any[];
  carriers?: any[];
  carrierServices?: any[];
  contacts?: any[];
  addresses?: any[];
  formErrors?: { [key: string]: any };
  isOrderLocked: boolean;
  user: any;
  refetchReferenceData: () => void;
}

const OrderDetailsForm: React.FC<OrderDetailsFormProps> = ({
  formData,
  handleChange,
  orderTypes,
  orderClasses,
  warehouses,
  projects,
  carriers,
  carrierServices,
  contacts,
  addresses,
  formErrors,
  isOrderLocked,
  user,
  refetchReferenceData,
}) => {
  return (
    <>
      <BasicOrderInfoStep
        formData={formData}
        handleChange={handleChange}
        orderTypes={orderTypes}
        orderClasses={orderClasses}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked}
      />
      <LogisticsInfoStep
        formData={formData}
        handleChange={handleChange}
        warehouses={warehouses}
        projects={projects}
        carriers={carriers}
        carrierServices={carrierServices}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked}
      />
      <DeliveryInfoStep
        formData={formData}
        handleChange={handleChange}
        contacts={contacts}
        addresses={addresses}
        formErrors={formErrors}
        projects={projects}
        user={user}
        isOrderLocked={isOrderLocked}
        refetchReferenceData={refetchReferenceData}
      />
      <AdditionalInfoStep
        formData={formData}
        handleChange={handleChange}
        formErrors={formErrors}
      />
    </>
  );
};

export default OrderDetailsForm;
