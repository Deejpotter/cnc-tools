/**
 * Basic application tests
 * Updated: 25/05/25
 * Author: Deej Potter
 */

import { app } from "./app";
import supertest from "supertest";

const request = supertest(app);

describe("API Endpoints", () => {
	describe("GET /", () => {
		it("should redirect to /swagger", async () => {
			const response = await request.get("/");
			expect(response.status).toBe(302); // HTTP redirect status
			expect(response.headers.location).toBe("/swagger");
		});
	});

	describe("GET /spec", () => {
		it("should return the Swagger specification", async () => {
			const response = await request.get("/spec");
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("info");
			expect(response.body.info).toHaveProperty("title");
		});
	});
});
