import React from "react";
import LayoutContainer from "../components/LayoutContainer";
import TileSection from "../components/TileSection";
import { TileProps } from "../components/Tile";


export default function Home() {
  // Defining tile data using the TileProps interface for TypeScript type checking
  const tilesData: TileProps[] = [
    {
      title: "Box Shipping Calculator",
      description:
        "Calculate the optimal shipping configuration for your boxes.",
      link: "/box-shipping-calculator",
      linkText: "Go to Calculator",
      // Using Bootstrap classes for styling
      bgColorClass: "bg-light",
      textColorClass: "text-dark",
    },
    {
      title: "CNC Calibration Tool",
      description: "Calibrate your CNC machine for precise manufacturing.",
      link: "/cnc-calibration-tool",
      linkText: "Calibrate CNC",
      bgColorClass: "bg-light",
      textColorClass: "text-dark",
    },
    {
      title: "Enclosure Calculator",
      description: "Calculate the size of an enclosure.",
      link: "/enclosure-calculator",
      linkText: "Enclosure Calculator",
      bgColorClass: "bg-light",
      textColorClass: "text-dark",
    },
    {
      title: "40 Series Extrusion",
      description: "Calculate 40 Series Extrusion cuts.",
      link: "/40-series-extrusions",
      linkText: "40 Series Extrusion",
      bgColorClass: "bg-light",
      textColorClass: "text-dark",
    },
    {
      title: "20 Series Extrusion",
      description: "Calculate 20 Series Extrusion cuts.",
      link: "/20-series-extrusions",
      linkText: "20 Series Extrusion",
      bgColorClass: "bg-light",
      textColorClass: "text-dark",
    },
    {
      title: "CNC Technical AI",
      description: "An AI chatbot that can answer technical questions.",
      link: "/cnc-technical-ai",
      linkText: "CNC Technical AI",
      bgColorClass: "bg-light",
      textColorClass: "text-dark",
    },
    // More tiles can be added here
  ];

  return (
    <>
      {/* Hero Section: Full-width section to welcome users */}
      <section className="hero-section text-center bg-dark text-white py-5 ">
        <h1>Welcome to CNC</h1>
        <p>
          Explore our tools and calculators designed to assist you with your
          maker projects.
        </p>
      </section>

      {/* Features Section: Utilizing the LayoutContainer for consistent styling */}
      <LayoutContainer>
        {/* TileSection: Displays a collection of tiles based on the tilesData array */}
        <TileSection title="Our Tools" tiles={tilesData} />
      </LayoutContainer>
    </>
  );
}
