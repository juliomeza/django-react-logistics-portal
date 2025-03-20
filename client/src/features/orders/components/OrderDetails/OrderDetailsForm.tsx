import React from 'react';
import BasicOrderInfoStep from './BasicOrderInfoStep';
import LogisticsInfoStep from './LogisticsInfoStep';
import DeliveryInfoStep from './DeliveryInfoStep';
import AdditionalInfoStep from './AdditionalInfoStep';
import { OrderFormData, OrderType, OrderClass } from '../../../../types/orders';
import { Project } from '../../../../types/enterprise';
import { Warehouse, Carrier, CarrierService, Contact, Address } from '../../../../types/logistics';

interface OrderDetailsFormProps {
  formData: OrderFormData;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  orderTypes?: OrderType[];
  orderClasses?: OrderClass[];
  warehouses?: Warehouse[];
  projects?: Project[];
  carriers?: Carrier[];
  carrierServices?: CarrierService[];
  contacts?: Contact[];
  addresses?: Address[];
  formErrors?: Record<string, boolean>;
  isOrderLocked: boolean;
  user: {
    id: number;
    username: string;
    [key: string]: any;
  };
  refetchReferenceData: () => void;
}

const OrderDetailsForm: React.FC<OrderDetailsFormProps> = ({
  formData,
  handleChange,
  orderTypes = [],
  orderClasses = [],
  warehouses = [],
  projects = [],
  carriers = [],
  carrierServices = [],
  contacts = [],
  addresses = [],
  formErrors = {},
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