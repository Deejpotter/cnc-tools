import Link from "next/link";
import React from "react";

// TileProps defines the props that can be passed to the Tile component and are required for TypeScript to work properly.
export interface TileProps {
  title: string; // Required: This is the title of the tile.
  description: string; // Required: This is the description of the tile.
  link: string; // Required: This is the link that the tile will redirect to.
  linkText: string; // Required: This is the text that will be displayed on the button.
  bgColorClass?: string; // Optional, as Bootstrap classes have default values
  textColorClass?: string; // Optional again
}

// React.FC is a generic type that is used to define a React Functional Component.
// It takes a type argument which is the type of the props that will be passed to the component.
// In this case, the props are of type TileProps and they are destructured in the function signature into their individual properties.
const Tile: React.FC<TileProps> = ({
  title,
  description,
  link,
  linkText,
  bgColorClass = "bg-light", // Default to bg-light if not provided
  textColorClass = "text-dark", // Default to text-dark if not provided
}) => {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      {/* Use the passed in props to set the content and styles */}
      <div className={`card h-100 shadow ${bgColorClass} ${textColorClass}`}>
        <div className="card-body">
          <h3 className="card-title">{title}</h3>
          <p className="card-text">{description}</p>
          <Link href={link} passHref>
            <button className="btn btn-outline-secondary">{linkText}</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Tile;
