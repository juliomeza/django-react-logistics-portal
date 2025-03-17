import React, { useState, useContext, useReducer, useEffect, ChangeEvent, FormEvent } from 'react';
import { Container, Typography, Snackbar, Alert } from '@mui/material';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import AuthContext from '../../auth/AuthContext';
import OrderDetailsForm from '../components/OrderDetails/OrderDetailsForm';
import MaterialSelectionStep from '../components/Materials/MaterialSelectionStep';
import OrderSummary from '../components/OrderSummary/OrderSummary';
import StepperHeader from '../components/common/StepperHeader';
import { formReducer, initialFormState, FormState } from '../reducers/formReducer';
import useReferenceData from '../hooks/useReferenceData';
import useInventoriesAndMaterials from '../hooks/useInventoriesAndMaterials';
import { saveOrderLines } from '../utils/apiUtils';
import { validateOrderDetails } from '../utils/OrderValidation';
import OrderStepActions from '../components/common/OrderStepActions';
import { saveOrderDetails, submitOrder, loadOrderData } from '../utils/OrderSubmission';

const renderStepContent = (
  step: number,
  formData: FormState,
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void,
  referenceData: any,
  inventoriesAndMaterials: any,
  formErrors: any,
  isOrderLocked: boolean,
  user: any,
  refetchReferenceData: any,
  dispatch: React.Dispatch<any>
): React.ReactNode => {
  switch (step) {
    case 0:
      return (
        <OrderDetailsForm
          formData={formData}
          handleChange={handleChange}
          orderTypes={referenceData.orderTypes}
          orderClasses={referenceData.orderClasses}
          warehouses={referenceData.warehouses}
          projects={referenceData.projects}
          carriers={referenceData.carriers}
          carrierServices={referenceData.carrierServices}
          contacts={referenceData.contacts}
          addresses={referenceData.addresses}
          formErrors={formErrors}
          isOrderLocked={isOrderLocked}
          user={user}
          refetchReferenceData={refetchReferenceData}
        />
      );
    case 1:
      return (
        <MaterialSelectionStep
          formData={formData}
          setFormData={(inventories: any) =>
            dispatch({ type: 'SET_INVENTORIES', inventories })
          }
          inventories={inventoriesAndMaterials.inventories}
          materials={inventoriesAndMaterials.materials}
          loading={inventoriesAndMaterials.loading}
        />
      );
    case 2:
      return (
        <OrderSummary
          orderData={formData}
          referenceData={referenceData}
          materials={inventoriesAndMaterials.materials}
          materialItems={formData.selectedInventories}
          isReviewMode={true}
        />
      );
    default:
      return null;
  }
};

const MultiStepCreateOrder: React.FC = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is undefined");
  }
  const { user, loading: authLoading } = authContext;
  const navigate = useNavigate();
  const { orderId: orderIdFromParams } = useParams<{ orderId: string }>();

  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const { data: referenceData, refetchReferenceData } = useReferenceData(user);
  const inventoriesAndMaterials = useInventoriesAndMaterials(user, formData.warehouse);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<any>({});
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  const steps: string[] = ['Order Details', 'Materials', 'Review'];
  const isOrderLocked = !!(orderId || orderIdFromParams);

  useEffect(() => {
    if (orderIdFromParams && user) {
      loadOrderData(
        orderIdFromParams,
        user,
        dispatch as React.Dispatch<any>,
        setOrderId,
        setError,
        setOpenSnackbar
      );
    }
  }, [orderIdFromParams, user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', field: name as keyof FormState, value });
    setFormErrors((prev: any) => ({ ...prev, [name]: false }));
  };

  const handleOrderDetailsNext = async (): Promise<void> => {
    const newErrors = validateOrderDetails(formData);

    if (Object.keys(newErrors).length > 0) {
      setError('Please fill in all required fields before proceeding.');
      setFormErrors(newErrors);
      setOpenSnackbar(true);
      return;
    }

    const success = await saveOrderDetails(
      formData,
      orderId,
      orderIdFromParams,
      setOrderId,
      dispatch as React.Dispatch<any>,
      setError,
      setOpenSnackbar
    );

    if (success) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleMaterialsNext = async (): Promise<void> => {
    const success = await saveOrderLines(
      formData,
      orderId || (formData as any).id,
      setError,
      setOpenSnackbar
    );
    if (success) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleNext = (): void => {
    if (currentStep === 0) {
      handleOrderDetailsNext();
    } else if (currentStep === 1) {
      handleMaterialsNext();
    }
  };

  const handleBack = (): void => {
    setError('');
    setFormErrors({});
    setCurrentStep((prev) => prev - 1);
  };

  const handleSave = async (): Promise<void> => {
    if (currentStep === 1) {
      await saveOrderLines(
        formData,
        orderId || (formData as any).id,
        setError,
        setOpenSnackbar
      );
    }
  };

  // El parámetro 'e' es opcional para que funcione también con OrderStepActions
  const handleSubmit = async (e?: FormEvent<HTMLFormElement>): Promise<void> => {
    if (e) e.preventDefault();
    if (currentStep !== steps.length - 1) return;
    await submitOrder(formData, orderId, navigate, setError, setOpenSnackbar);
  };

  if (authLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <StepperHeader activeStep={currentStep} steps={steps} />
      <Container sx={{ mt: 12, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          {renderStepContent(
            currentStep,
            formData,
            handleChange,
            referenceData,
            inventoriesAndMaterials,
            formErrors,
            isOrderLocked,
            user,
            refetchReferenceData,
            dispatch as React.Dispatch<any>
          )}

          <OrderStepActions
            currentStep={currentStep}
            totalSteps={steps.length}
            onBack={handleBack}
            onNext={handleNext}
            onSave={handleSave}
            onSubmit={handleSubmit}
            disableSubmit={
              !formData.selectedInventories ||
              formData.selectedInventories.length === 0
            }
            disableSave={inventoriesAndMaterials.loading}
          />
        </form>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={
            error.includes('Failed') ||
            error.includes('Please fill in all required fields') ||
            error.includes('Please select at least one material')
              ? 'error'
              : 'success'
          }
          onClose={() => setOpenSnackbar(false)}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MultiStepCreateOrder;
