/**
 * Sample Shipping Items
 * Updated: 07/05/25
 * Author: Deej Potter
 * Description: Provides sample shipping items for initializing the Box Shipping Calculator database
 * Used to ensure users always have some sample data to work with
 */

import ShippingItem from "@/interfaces/box-shipping-calculator/ShippingItem";

/**
 * Sample shipping items to initialize the database
 * Used when the database is empty to provide starter data
 */
export const SAMPLE_ITEMS: Omit<ShippingItem, "_id">[] = [
  {
    name: "V-Slot Extrusion 2020 - 1.5m",
    sku: "LR-2020-S-1500",
    length: 1500,
    width: 20,
    height: 20,
    weight: 1500,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "V-Slot Extrusion 2040 - 1.5m",
    sku: "LR-2040-S-1500",
    length: 1500,
    width: 40,
    height: 20,
    weight: 3000,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "V-Slot Extrusion 2080 - 1.0m",
    sku: "LR-2080-S-1000",
    length: 1000,
    width: 80,
    height: 20,
    weight: 4000,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "Arduino Mega 2560",
    sku: "ARD-MEGA2560",
    length: 101.6,
    width: 53.3,
    height: 15,
    weight: 37,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    name: "Nema 17 Stepper Motor",
    sku: "LS-NEMA17",
    length: 42,
    width: 42,
    height: 40,
    weight: 280,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }
];