"use client";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Gravatar from "./Gravatar";

const Auth = () => {
	const { user, login, signup, logout } = useAuth();

	return (
		<div className="navbar-nav">
			{user ? (
				<div className="nav-item d-flex align-items-center">
					<Gravatar email={user.email} className="rounded-circle mx-1 shadow" />
					<button
						onClick={logout}
						className="btn btn-sm btn-outline-danger shadow"
					>
						Logout
					</button>
				</div>
			) : (
				<div className="nav-item">
					<button
						onClick={login}
						className="btn btn-sm btn-outline-secondary shadow mx-1"
					>
						Login
					</button>
					<button
						onClick={signup}
						className="btn btn-sm btn-outline-secondary shadow"
					>
						Sign up
					</button>
				</div>
			)}
		</div>
	);
};

export default Auth;
