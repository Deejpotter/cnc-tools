"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";

// The Item interface is used to define the shape of the data that will be stored in the context.
// That means the shape of the items array in the context value.
interface Item {
  id: number;
  name: string;
  weightPerMeter: number;
}

// The ItemContextType interface is used to define the shape of the context object which will be used to provide the context to the components.
// That is, it defines the shape of the value prop of the Provider component.
interface ItemContextType {
  // items is an array of Item objects.
  items: Item[];
  // setItems uses React.Dispatch to set the items array in the context value.
  // React.Dispatch is a generic type that takes a type argument which is the type of the action that will be dispatched.
  // In this case, the action is a React.SetStateAction which is a generic type that takes a type argument which is the type of the state.
  // The atual state is an array of Item objects.
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

// The defaultContextValue is used to define the default value of the context when setting up the state in React.
const defaultContextValue: ItemContextType = {
  // Initialize the items array to an empty array.
  items: [],
  // Initialize the setItems function to an empty function.
  setItems: () => {},
};

// The createContext function is used to create the actual context object that will be used to provide the context to the components.
// The context object is a React component that provides the context to the child components.
export const ItemContext = createContext<ItemContextType>(defaultContextValue);

// The ItemProvider component is the actual React component that will be used to provide the context to the components.
// It takes the children prop which is the child components that will be wrapped by the context provider.
export const ItemProvider = ({ children }: { children: ReactNode }) => {

  // The useState hook is used to set up the state in React for the context provider.
  // The state is an array of Item objects and the setItems function is used to set the state.
  const [items, setItems] = useState<Item[]>([]);

  // The useEffect hook is used to set up the side effects in React. It runs every time the component is rendered.
  useEffect(() => {
    // The mockItems array is used to initialize the items 
    const mockItems: Item[] = [
      { id: 1, name: "2080 Extrusion", weightPerMeter: 1.52 },
    ];
    setItems(mockItems);
  }, []);

  return (
    <ItemContext.Provider value={{ items, setItems }}>
      {children}
    </ItemContext.Provider>
  );
};
