"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Deprecated20SeriesPage() {
	const router = useRouter();
	useEffect(() => {
		router.replace("/extrusions-calculator");
	}, [router]);
	return null;
}
