"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import netlifyIdentity from "netlify-identity-widget";

// The AuthContextType interface defines the shape of the context object for authentication.
interface AuthContextType {
  user: netlifyIdentity.User | null; // Represents the current user object or null if no user is logged in.
  login: () => void; // Function to initiate the login process.
  signup: () => void; // Function to initiate the signup process.
  logout: () => void; // Function to log out the current user.
}

// The default value for the AuthContext, used when initializing the context.
const defaultAuthContextValue: AuthContextType = {
  user: null,
  login: () => {},
  signup: () => {},
  logout: () => {},
};

// Creating the AuthContext with the default value.
export const AuthContext = createContext<AuthContextType>(
  defaultAuthContextValue
);

// AuthProvider component that will wrap the application components and provide authentication context.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<netlifyIdentity.User | null>(null);

  useEffect(() => {
		netlifyIdentity.init(); // Initialize Netlify Identity.

		// Set the initial user state based on the existing session. currentUser() returns null if no session exists.
		const currentUser = netlifyIdentity.currentUser();
		setUser(currentUser); // Set the user state

		// Event listener for successful login.
		netlifyIdentity.on("login", (user) => {
			setUser(user); // Update the user state on successful login.
			netlifyIdentity.close(); // Close the Netlify Identity modal.
		});

		// Event listener for logout action.
		netlifyIdentity.on("logout", () => {
			setUser(null); // Clear the user state on logout.
		});

		// Cleanup event listeners on component unmount.
		return () => {
			netlifyIdentity.off("login");
			netlifyIdentity.off("logout");
		};
	}, []);

  // Function to open the Netlify Identity login modal.
  const login = () => netlifyIdentity.open("login");
  // Function to open the Netlify Identity signup modal.
  const signup = () => netlifyIdentity.open("signup");
  // Function to log out the current user.
  const logout = () => netlifyIdentity.logout();

  // Providing the authentication context to the children components.
  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context in components.
export const useAuth = () => useContext(AuthContext);
