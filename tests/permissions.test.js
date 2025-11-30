import { describe, it, expect, beforeAll } from "vitest";
import axios from "axios";

const STRAPI_URL = "http://localhost:1337/api";
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Password123456789!";

describe("Permissions Integration Tests", () => {
    let jwt;
    let adminUser;

    beforeAll(async () => {
        // Login as Admin
        try {
            const response = await axios.post(`${STRAPI_URL}/auth/local`, {
                identifier: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });
            jwt = response.data.jwt;
            adminUser = response.data.user;
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            throw error;
        }
    });

    it("should allow Admin to access users/me", async () => {
        const response = await axios.get(`${STRAPI_URL}/users/me`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        expect(response.status).toBe(200);
        expect(response.data.email).toBe(ADMIN_EMAIL);
    });

    it("should allow Admin to list files (upload permission)", async () => {
        const response = await axios.get(`${STRAPI_URL}/upload/files`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
    });

    it("should allow Admin to create and delete a POI", async () => {
        // Create POI
        const poiData = {
            data: {
                title: "Test POI for Delete",
                description: "To be deleted",
                latitude: 0,
                longitude: 0
            }
        };
        const createRes = await axios.post(`${STRAPI_URL}/pois`, poiData, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        expect(createRes.status).toBe(201);
        const poiId = createRes.data.data.documentId;

        // Delete POI
        const deleteRes = await axios.delete(`${STRAPI_URL}/pois/${poiId}`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        expect(deleteRes.status).toBe(204);
    });
});
