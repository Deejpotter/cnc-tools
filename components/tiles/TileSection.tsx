import React from "react";
import Tile, { TileProps } from "./Tile";

// TileSectionProps defines the props that can be passed to the TileSection component and are required for TypeScript to work properly.
interface TileSectionProps {
  title: string;
  tiles: TileProps[];
}

/**
 * The TileSection component is used to render a section of tiles. The tiles are passed as props to the component then rendered using the map function.
 * Bootstrap and flexbox are used to render the tiles in a grid.
 * @param title The title of the section.
 * @param tiles The tiles to render in the section.
 */
const TileSection: React.FC<TileSectionProps> = ({ title, tiles }) => {
  return (
    <section className="py-5">
      {/* Then, the props are used to set the content of the component. */}
      <div className="container">
        <h2 className="text-center mb-4">{title}</h2>
              <div className="row">
            {/* The tiles are rendered using the map function which modifies each element in the array and returns a new array. 
            When rendering in react, each element in the array should have a unique key prop. In this case, the index of the element is used as the key. */}
          {tiles.map((tile, index) => (
            // The ... is the spread operator which is used to spread the properties of the tile object into the Tile component.
            // so any properties that are not explicitly set will be passed to the Tile component.
            <Tile key={index} {...tile} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TileSection;
