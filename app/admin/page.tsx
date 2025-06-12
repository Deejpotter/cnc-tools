"use client";
import React, { useState, useEffect, useCallback } from "react";
import LayoutContainer from "@/components/LayoutContainer";
import {
	Settings,
	Users,
	ShieldAlert,
	Trash2,
	CheckCircle,
	XCircle,
	RefreshCw,
} from "lucide-react";
import { useUser, useAuth } from "@clerk/nextjs";

interface UserFromApi {
	id: string;
	firstName: string | null;
	lastName: string | null;
	emailAddress: string;
	isAdmin: boolean;
}

/**
 * Admin page for CNC Tools
 * Provides access to administrative functionalities based on user roles.
 * - Admins (publicMetadata.isAdmin: true) can access general admin tools.
 * - Master Admin (publicMetadata.isMaster: true and specific user ID) can access user management.
 */
const AdminPage: React.FC = () => {
	const { user, isSignedIn } = useUser();
	const { getToken } = useAuth(); // For making authenticated API calls

	const [users, setUsers] = useState<UserFromApi[]>([]);
	const [isLoadingUsers, setIsLoadingUsers] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

	// Retrieve admin and master flags from Clerk's publicMetadata
	const isAdmin = user?.publicMetadata?.isAdmin === true;
	const isMaster =
		user?.publicMetadata?.isMaster === true &&
		user?.id === "user_2yFautivzaceEYXXlepE2IMUsEE"; // Ensure this matches your Master Admin User ID

	const fetchUsers = useCallback(async () => {
		if (!isMaster) return;
		setIsLoadingUsers(true);
		setError(null);
		try {
			const token = await getToken();
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/users/list-users`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to fetch users");
			}
			const data = await response.json();
			setUsers(data.users || []);
		} catch (err: any) {
			setError(err.message);
			console.error("Error fetching users:", err);
		} finally {
			setIsLoadingUsers(false);
		}
	}, [getToken, isMaster]);

	useEffect(() => {
		if (isMaster) {
			fetchUsers();
		}
	}, [isMaster, fetchUsers]);

	const handleRoleChange = async (
		userIdToUpdate: string,
		newIsAdminStatus: boolean
	) => {
		if (!isMaster) return;
		setUpdatingUserId(userIdToUpdate);
		setError(null);
		try {
			const token = await getToken();
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/users/update-user-role`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						userIdToUpdate,
						isAdmin: newIsAdminStatus,
					}),
				}
			);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to update user role");
			}
			// Refresh user list to show the change
			await fetchUsers();
		} catch (err: any) {
			setError(err.message);
			console.error("Error updating user role:", err);
		} finally {
			setUpdatingUserId(null);
		}
	};

	// Ensure the user is signed in and user data is loaded
	if (!isSignedIn || !user) {
		return (
			<LayoutContainer>
				<div className="container py-4 text-center">
					<p>Loading user information or user not signed in...</p>
				</div>
			</LayoutContainer>
		);
	}

	return (
		<LayoutContainer>
			<div className="container py-4">
				<div className="row">
					<div className="col-12">
						<h1 className="display-5 fw-bold text-primary mb-4">
							<Settings className="me-2" />
							Admin Panel
						</h1>

						{/* Conditional rendering based on user roles */}
						{!isAdmin && !isMaster && (
							<div className="alert alert-warning" role="alert">
								<ShieldAlert className="me-2" />
								You do not have sufficient permissions to access this page.
							</div>
						)}

						{(isAdmin || isMaster) && (
							<div className="card mb-4">
								<div className="card-header">
									<h5 className="card-title mb-0">General Admin Tools</h5>
								</div>
								<div className="card-body">
									<p className="card-text">
										Welcome to the admin area. Here you can manage various
										aspects of the application.
									</p>
									{/* Placeholder for general admin functionalities */}
									<button className="btn btn-danger">
										<Trash2 className="me-2" /> Delete Items (Example)
									</button>
									{/* More admin tools can be added here */}
								</div>
							</div>
						)}

						{isMaster && (
							<div className="card">
								<div className="card-header">
									<h5 className="card-title mb-0">
										<Users className="me-2" /> User Management (Master Admin)
									</h5>
								</div>
								<div className="card-body">
									<p className="card-text">
										As a Master Admin, you can manage user roles and
										permissions.
									</p>
									{isLoadingUsers && (
										<div className="d-flex justify-content-center my-3">
											<div className="spinner-border" role="status">
												<span className="visually-hidden">
													Loading users...
												</span>
											</div>
										</div>
									)}
									{error && (
										<div className="alert alert-danger" role="alert">
											{error}
										</div>
									)}
									{!isLoadingUsers && !error && users.length === 0 && (
										<p>No users found or unable to load users.</p>
									)}
									{!isLoadingUsers && users.length > 0 && (
										<div className="table-responsive">
											<table className="table table-striped table-hover">
												<thead>
													<tr>
														<th>Name</th>
														<th>Email</th>
														<th>Admin Status</th>
														<th>Actions</th>
													</tr>
												</thead>
												<tbody>
													{users.map((u) => (
														<tr key={u.id}>
															<td>
																{u.firstName || "N/A"} {u.lastName || ""}
															</td>
															<td>{u.emailAddress}</td>
															<td>
																{u.isAdmin ? (
																	<CheckCircle className="text-success" />
																) : (
																	<XCircle className="text-danger" />
																)}
															</td>
															<td>
																{/* Prevent Master Admin from demoting themselves */}
																{user && u.id !== user.id && (
																	<button
																		className={`btn btn-sm ${
																			u.isAdmin ? "btn-warning" : "btn-success"
																		}`}
																		onClick={() =>
																			handleRoleChange(u.id, !u.isAdmin)
																		}
																		disabled={updatingUserId === u.id}
																	>
																		{updatingUserId === u.id ? (
																			<RefreshCw
																				className="animate-spin me-1"
																				size={16}
																			/>
																		) : null}
																		{u.isAdmin
																			? "Demote to User"
																			: "Promote to Admin"}
																	</button>
																)}
																{user && u.id === user.id && (
																	<span className="text-muted fst-italic">
																		Cannot change own role
																	</span>
																)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
									<button
										className="btn btn-secondary mt-3"
										onClick={fetchUsers}
										disabled={isLoadingUsers}
									>
										<RefreshCw
											className={`me-2 ${isLoadingUsers ? "animate-spin" : ""}`}
											size={16}
										/>{" "}
										Refresh User List
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</LayoutContainer>
	);
};

export default AdminPage;
