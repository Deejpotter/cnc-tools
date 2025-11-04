"use client";

import { AuthProvider as AuthProviderBase } from "@deejpotter/ui-components";
import { ReactNode } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
	return <AuthProviderBase>{children}</AuthProviderBase>;
}
