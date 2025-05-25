import React from "react";

// Defining an interface for the component's props
// Interface in TypeScript is used to define the shape of an object
interface LayoutContainerProps {
  // children is a prop of type React.ReactNode
  // React.ReactNode allows any type of React child elements (string, number, JSX, etc.)
  children: React.ReactNode;
}

// Functional component declaration with destructured props
// LayoutContainer is a React Functional Component
// It accepts props that conform to the LayoutContainerProps interface
const LayoutContainer = ({ children }: LayoutContainerProps) => {
  return (
    <div className="container">
      {/* 'container' class from Bootstrap for a fixed-width container */}
      <div className="row">
        {/* 'row' class from Bootstrap to place elements in a single row */}
        <div className="col">
          {/* 'col' class from Bootstrap for column styling */}
          {/* This will create a single, full-width column at all screen sizes */}
          {/* Rendering children elements */}
          {/* Whatever is passed within this component will be rendered here */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default LayoutContainer;
