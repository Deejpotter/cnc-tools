import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({ usePathname: () => "/" }));

jest.mock("@deejpotter/ui-components", () => ({
	AuthButton: () => <div data-testid="auth-button" />,
	useAuth: jest.fn(),
}));

import Navbar from "./Navbar";
import { useAuth } from "@deejpotter/ui-components";

describe("Navbar", () => {
	it("shows Admin link when user is admin", () => {
		(useAuth as jest.Mock).mockReturnValue({
			user: { publicMetadata: { isAdmin: true } },
		});

		render(<Navbar brand={"Brand"} navItems={[]} />);

		expect(screen.getByText("Admin")).toBeInTheDocument();
	});

	it("does not show Admin link when user is not admin", () => {
		(useAuth as jest.Mock).mockReturnValue({ user: { publicMetadata: {} } });

		render(<Navbar brand={"Brand"} navItems={[]} />);

		expect(screen.queryByText("Admin")).not.toBeInTheDocument();
	});
});
