import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({ usePathname: () => "/" }));

jest.mock("@clerk/nextjs", () => ({
	SignInButton: ({ children }: { children: React.ReactNode }) => <div data-testid="sign-in-button">{children}</div>,
	SignUpButton: ({ children }: { children: React.ReactNode }) => <div data-testid="sign-up-button">{children}</div>,
	UserButton: () => <div data-testid="user-button" />,
	SignedIn: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-in">{children}</div>,
	SignedOut: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-out">{children}</div>,
	useUser: jest.fn(),
}));

import Navbar from "./Navbar";
import { useUser } from "@clerk/nextjs";

describe("Navbar", () => {
	it("shows Admin link when user is admin", () => {
		(useUser as jest.Mock).mockReturnValue({
			user: { publicMetadata: { isAdmin: true } },
		});

		render(<Navbar brand={"Brand"} navItems={[]} />);

		expect(screen.getByText("Admin")).toBeInTheDocument();
	});

	it("does not show Admin link when user is not admin", () => {
		(useUser as jest.Mock).mockReturnValue({ user: { publicMetadata: {} } });

		render(<Navbar brand={"Brand"} navItems={[]} />);

		expect(screen.queryByText("Admin")).not.toBeInTheDocument();
	});
});
