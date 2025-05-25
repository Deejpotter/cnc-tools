/**
 * Next.js Root Layout
 * Updated: 14/05/2025
 * Author: Deej Potter
 * Description: This is the root layout component for the Next.js application.
 * This component wraps the entire application and provides a consistent layout and styling. 
 * It can be overridden by creating a new layout file in the relevant directory.
 */
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.scss";
import "bootstrap-icons/font/bootstrap-icons.css";

import { ItemProvider } from "../contexts/ItemContext";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

// Uses next/font to load the Nunito Sans font from Google Fonts.
const nunito = Nunito({ subsets: ["latin"] });

// The metadata object is built-in to Next.js and is used to provide metadata to the page.
export const metadata: Metadata = {
	title: "CNC Calculations",
	description: "Calculation tool for CNC stuff.",
};

// The RootLayout component is the root component that is used to wrap the pages.
// It takes the children prop which is the child components that will be wrapped by the context provider.
// The ReactNode type is a type that represents any valid React child element.
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			{/* The head element is built-in to Next.js and is used to provide metadata to the page.*/}
			{/* The AuthProvider component is used to provide the authentication context to the components. */}
			<AuthProvider>
				{/* The ItemProvider component is used to provide the item context to the components. */}
				<ItemProvider>
					<body className={nunito.className}>
						{/* Render the Navbar component then render the children components. */}
						<Navbar />
						<main>{children}</main>
						{/* Add Footer component at the bottom of the page */}
						<Footer />
					</body>
				</ItemProvider>
			</AuthProvider>
		</html>
	);
}
