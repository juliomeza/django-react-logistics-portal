import React from 'react';
import { createFilterOptions } from '@mui/material/Autocomplete';

/**
 * Interfaz para direcciones usadas en componentes
 */
export interface AddressDisplay {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  id: number | string;
  address_type?: string;
  [key: string]: unknown;
}

/**
 * Interfaz para contactos
 */
export interface ContactOption {
  id: number | string;
  company_name?: string;
  contact_name?: string;
  addresses?: (number | string)[];
  label?: string;
  isAddOption?: boolean;
  [key: string]: unknown;
}

/**
 * Formatea una fecha para mostrarla en un campo de entrada de tipo date
 * @param dateString Fecha a formatear
 * @returns Fecha formateada como YYYY-MM-DD o cadena vacía si es inválida
 */
export const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
};

/**
 * Formatea una dirección para mostrarla
 * @param address Objeto de dirección a formatear
 * @returns Elemento React con la dirección formateada
 */
export const formatAddress = (address: AddressDisplay | null | undefined): React.ReactNode => {
  if (!address) return 'No address selected';
  return (
    <>
      {address.address_line_1}
      <br />
      {address.address_line_2 && (
        <>
          {address.address_line_2}
          <br />
        </>
      )}
      {address.city}, {address.state} {address.postal_code}
      <br />
      {address.country}
    </>
  );
};

/**
 * Construye opciones de contacto para componentes de selección
 * @param contacts Lista de contactos
 * @param addresses Lista de direcciones
 * @returns Lista de opciones de contacto con información de dirección
 */
export const buildContactOptions = (
  contacts: ContactOption[], 
  addresses: AddressDisplay[]
): ContactOption[] => {
  return contacts.map((contact) => {
    const shippingAddress = addresses.find(
      (addr) => 
        contact.addresses?.includes(addr.id) && 
        addr.address_type === 'shipping'
    );
    const city = shippingAddress ? shippingAddress.city : '';
    const displayName = contact.company_name || contact.contact_name || 'Unnamed Contact';
    return { 
      ...contact, 
      label: city ? `${displayName} - ${city}` : displayName,
      isAddOption: false
    };
  });
};

/**
 * Tipo para opciones filtradas con posible opción de añadir
 */
export interface FilteredOption extends ContactOption {
  inputValue?: string;
  isAddOption?: boolean;
}

/**
 * Crea opciones de filtrado personalizadas para autocomplete
 * @returns Función de filtrado personalizada
 */
export const createCustomFilterOptions = () => {
  const filterOptions = createFilterOptions<FilteredOption>({
    matchFrom: 'any',
    stringify: (option) => option.label || '',
  });

  return (options: FilteredOption[], params: any): FilteredOption[] => {
    const filtered = filterOptions(options, params);
    
    // Siempre agregar la opción "Add New Contact" al final
    const addOption: FilteredOption = {
      id: 'new',
      inputValue: params.inputValue,
      label: 'Add New Contact',
      isAddOption: true,
    };
    
    filtered.push(addOption);
    
    return filtered;
  };
};