/**
 * ItemAddFormWrapper
 * This is a server component that wraps the client ItemAddForm component
 * and handles the item addition logic
 */

import React from 'react';
import ItemAddForm from './ItemAddFormClient';
import ShippingItem from '../../../types/interfaces/box-shipping-calculator/ShippingItem';

type ItemAddFormWrapperProps = {
  onAddItem: (item: ShippingItem) => void;
};

export default function ItemAddFormWrapper({ onAddItem }: ItemAddFormWrapperProps) {
  return <ItemAddForm onAddItemSubmit={onAddItem} />;
}
