// This component is now redundant because Clerk's built-in UI components (SignInButton, SignUpButton, UserButton, SignedIn, SignedOut) provide all required authentication functionality and UI.
// If you want to customize the auth UI further, you can do so directly where you use these Clerk components (e.g., in Navbar.tsx).
// For now, this file is deprecated and can be safely removed from the codebase.
// See codeupdates.md for details.

"use client";
import React from "react";
import Gravatar from "./Gravatar";
import {
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
	useUser,
} from "@clerk/nextjs";

const Auth = () => {
	const { user, isSignedIn } = useUser();

	return (
		<div className="navbar-nav">
			<SignedIn>
				<div className="nav-item d-flex align-items-center">
					{/* Clerk user object: use primaryEmailAddress or username as fallback */}
					<Gravatar
						email={
							user?.primaryEmailAddress?.emailAddress || user?.username || ""
						}
						className="rounded-circle mx-1 shadow"
					/>
					<UserButton afterSignOutUrl="/" />
				</div>
			</SignedIn>
			<SignedOut>
				<div className="nav-item">
					<SignInButton mode="modal">
						<button className="btn btn-sm btn-outline-secondary shadow mx-1">
							Login
						</button>
					</SignInButton>
					<SignUpButton mode="modal">
						<button className="btn btn-sm btn-outline-secondary shadow">
							Sign up
						</button>
					</SignUpButton>
				</div>
			</SignedOut>
		</div>
	);
};

export default Auth;
