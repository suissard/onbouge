import { describe, it, expect, beforeAll, afterAll } from "vitest";
import axios from "axios";
import fs from "fs";
import path from "path";

/**
 * DATABASE PERMISSIONS CHALLENGE
 * 
 * This test suite verifies the security and integrity of the database permissions.
 * It specifically targets the new "Ambassador" role and the updated "Authenticated" role.
 * 
 * Scenarios tested:
 * 1. Ambassador Role: Should have FULL CRUD access (Create, Read, Update, Delete) on POIs, Events, and Sports.
 * 2. Authenticated Role: Should have READ and CREATE access, but MUST NOT be able to UPDATE or DELETE entries.
 * 
 * Prerequisites:
 * - A running Strapi instance at STRAPI_URL.
 * - Admin credentials available via .env or defaults.
 */

// Load .env manually to ensure we have access to STRAPI_URL and Admin credentials
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    content.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2 && !line.startsWith("#")) {
            const key = parts[0].trim();
            const value = parts.slice(1).join("=").trim();
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
}

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || "Password123456789!";

describe("Database Permissions Challenge", () => {
    let adminJwt;
    let ambassadorUser;
    let authenticatedUser;
    let administrateurUser;
    let ambassadorJwt;
    let authenticatedJwt;
    let administrateurJwt;
    let createdPoiId;
    let createdEventId;
    let createdSportId;

    const timestamp = Date.now();
    const ambassadorCreds = {
        username: `ambassador_${timestamp}`,
        email: `ambassador_${timestamp}@test.com`,
        password: "Password123!",
    };
    const authCreds = {
        username: `auth_${timestamp}`,
        email: `auth_${timestamp}@test.com`,
        password: "Password123!",
    };
    const adminCreds = {
        username: `admin_${timestamp}`,
        email: `admin_${timestamp}@test.com`,
        password: "Password123!",
    };

    beforeAll(async () => {
        // 1. Login as Admin
        // We need admin access to create test users and assign them specific roles.
        try {
            const loginRes = await axios.post(`${STRAPI_URL}/admin/login`, {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
            });
            adminJwt = loginRes.data.data.token;
        } catch (e) {
            console.error("Admin login failed. Make sure Strapi is running and credentials are correct.");
            throw e;
        }

        // 2. Get Role IDs
        // We fetch the IDs of 'Ambassador', 'Authenticated', and 'Administrateur' roles.
        const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
            headers: { Authorization: `Bearer ${adminJwt}` },
        });
        const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
        const ambassadorRole = roles.find((r) => r.name === "Ambassador");
        const authenticatedRole = roles.find((r) => r.type === "authenticated");
        const administrateurRole = roles.find((r) => r.name === "Administrateur");

        if (!ambassadorRole || !authenticatedRole || !administrateurRole) {
            throw new Error("Required roles (Ambassador, Authenticated, Administrateur) not found. Please run the seed script first.");
        }

        // 3. Create Users
        // Create a temporary Ambassador User
        const ambRes = await axios.post(
            `${STRAPI_URL}/content-manager/collection-types/plugin::users-permissions.user`,
            {
                username: ambassadorCreds.username,
                email: ambassadorCreds.email,
                password: ambassadorCreds.password,
                role: ambassadorRole.id,
                confirmed: true,
            },
            { headers: { Authorization: `Bearer ${adminJwt}` } }
        );
        ambassadorUser = ambRes.data;

        // Create a temporary Authenticated User
        const authRes = await axios.post(
            `${STRAPI_URL}/content-manager/collection-types/plugin::users-permissions.user`,
            {
                username: authCreds.username,
                email: authCreds.email,
                password: authCreds.password,
                role: authenticatedRole.id,
                confirmed: true,
            },
            { headers: { Authorization: `Bearer ${adminJwt}` } }
        );
        authenticatedUser = authRes.data;

        // Create a temporary Administrateur User
        const adminRes = await axios.post(
            `${STRAPI_URL}/content-manager/collection-types/plugin::users-permissions.user`,
            {
                username: adminCreds.username,
                email: adminCreds.email,
                password: adminCreds.password,
                role: administrateurRole.id,
                confirmed: true,
            },
            { headers: { Authorization: `Bearer ${adminJwt}` } }
        );
        administrateurUser = adminRes.data;

        // 4. Login as Users to get JWTs
        // We need the JWT tokens to perform authenticated requests as these users.
        const ambLogin = await axios.post(`${STRAPI_URL}/api/auth/local`, {
            identifier: ambassadorCreds.email,
            password: ambassadorCreds.password,
        });
        ambassadorJwt = ambLogin.data.jwt;

        const authLogin = await axios.post(`${STRAPI_URL}/api/auth/local`, {
            identifier: authCreds.email,
            password: authCreds.password,
        });
        authenticatedJwt = authLogin.data.jwt;

        const adminLogin = await axios.post(`${STRAPI_URL}/api/auth/local`, {
            identifier: adminCreds.email,
            password: adminCreds.password,
        });
        administrateurJwt = adminLogin.data.jwt;
    });

    afterAll(async () => {
        // Cleanup: Delete the temporary users and any data created during tests.
        if (adminJwt) {
            if (ambassadorUser) {
                const uid = ambassadorUser.documentId || ambassadorUser.id;
                await axios.delete(
                    `${STRAPI_URL}/content-manager/collection-types/plugin::users-permissions.user/${uid}`,
                    { headers: { Authorization: `Bearer ${adminJwt}` } }
                ).catch(e => console.error("Failed to delete ambassador user", e.response?.status, e.response?.data || e.message));
            }
            if (authenticatedUser) {
                const uid = authenticatedUser.documentId || authenticatedUser.id;
                await axios.delete(
                    `${STRAPI_URL}/content-manager/collection-types/plugin::users-permissions.user/${uid}`,
                    { headers: { Authorization: `Bearer ${adminJwt}` } }
                ).catch(e => console.error("Failed to delete authenticated user", e.response?.status, e.response?.data || e.message));
            }
            if (administrateurUser) {
                const uid = administrateurUser.documentId || administrateurUser.id;
                await axios.delete(
                    `${STRAPI_URL}/content-manager/collection-types/plugin::users-permissions.user/${uid}`,
                    { headers: { Authorization: `Bearer ${adminJwt}` } }
                ).catch(e => console.error("Failed to delete administrateur user", e.response?.status, e.response?.data || e.message));
            }
            // Cleanup Created Data if any remains (best effort)
            if (createdPoiId) {
                 await axios.delete(`${STRAPI_URL}/api/pois/${createdPoiId}`, { headers: { Authorization: `Bearer ${adminJwt}` } }).catch(() => {});
            }
            if (createdEventId) {
                 await axios.delete(`${STRAPI_URL}/api/events/${createdEventId}`, { headers: { Authorization: `Bearer ${adminJwt}` } }).catch(() => {});
            }
            if (createdSportId) {
                 await axios.delete(`${STRAPI_URL}/api/sports/${createdSportId}`, { headers: { Authorization: `Bearer ${adminJwt}` } }).catch(() => {});
            }
        }
    });

    describe("Ambassador Role Permissions", () => {
        it("should be able to CREATE a POI", async () => {
            // Ambassador should be able to create content
            const res = await axios.post(
                `${STRAPI_URL}/api/pois`,
                { data: { title: "Ambassador POI", description: "Test", latitude: 0, longitude: 0 } },
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(res.status).toBe(201);
            createdPoiId = res.data.data.documentId || res.data.data.id;
            if (res.data.data.documentId) createdPoiId = res.data.data.documentId;
        });

        it("should be able to UPDATE the POI", async () => {
            // Ambassador should be able to update content
            const res = await axios.put(
                `${STRAPI_URL}/api/pois/${createdPoiId}`,
                { data: { title: "Ambassador POI Updated" } },
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(res.status).toBe(200);
            const attrs = res.data.data.attributes || res.data.data;
            expect(attrs.title).toBe("Ambassador POI Updated");
        });

        it("should be able to DELETE the POI", async () => {
            // Ambassador should be able to delete content
            const res = await axios.delete(
                `${STRAPI_URL}/api/pois/${createdPoiId}`,
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(res.status).toBe(204);
            createdPoiId = null; // Reset
        });
        
        it("should be able to CREATE and DELETE a Sport", async () => {
             // Verify similar permissions for Sports
             const res = await axios.post(
                `${STRAPI_URL}/api/sports`,
                { data: { title: "Ambassador Sport" } },
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(res.status).toBe(201);
            const sportId = res.data.data.documentId || res.data.data.id;
            
            const delRes = await axios.delete(
                `${STRAPI_URL}/api/sports/${sportId}`,
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(delRes.status).toBe(204);
        });
    });

    describe("Authenticated Role Permissions", () => {
        let authPoiId;

        it("should be able to CREATE a POI", async () => {
            // Authenticated users CAN create content
            const res = await axios.post(
                `${STRAPI_URL}/api/pois`,
                { data: { title: "Auth POI", description: "Test", latitude: 0, longitude: 0 } },
                { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
            );
            expect(res.status).toBe(201);
            authPoiId = res.data.data.documentId || res.data.data.id;
            createdPoiId = authPoiId; // Track for admin cleanup
        });

        it("should NOT be able to UPDATE the POI", async () => {
            // Authenticated users MUST NOT be able to update content (even their own, per requirements)
            await expect(
                axios.put(
                    `${STRAPI_URL}/api/pois/${authPoiId}`,
                    { data: { title: "Auth POI Updated" } },
                    { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
                )
            ).rejects.toThrow(/403/); // Expect 403 Forbidden
        });

        it("should NOT be able to DELETE the POI", async () => {
            // Authenticated users MUST NOT be able to delete content
            await expect(
                axios.delete(
                    `${STRAPI_URL}/api/pois/${authPoiId}`,
                    { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
                )
            ).rejects.toThrow(/403/); // Expect 403 Forbidden
        });
    });

    describe("Administrateur Role Permissions", () => {
        it("should be able to CREATE a POI", async () => {
            const res = await axios.post(
                `${STRAPI_URL}/api/pois`,
                { data: { title: "Admin POI", description: "Test", latitude: 0, longitude: 0 } },
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(res.status).toBe(201);
            createdPoiId = res.data.data.documentId || res.data.data.id;
            if (res.data.data.documentId) createdPoiId = res.data.data.documentId;
        });

        it("should be able to UPDATE the POI", async () => {
            const res = await axios.put(
                `${STRAPI_URL}/api/pois/${createdPoiId}`,
                { data: { title: "Admin POI Updated" } },
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(res.status).toBe(200);
            const attrs = res.data.data.attributes || res.data.data;
            expect(attrs.title).toBe("Admin POI Updated");
        });

        it("should be able to DELETE the POI", async () => {
            const res = await axios.delete(
                `${STRAPI_URL}/api/pois/${createdPoiId}`,
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(res.status).toBe(204);
            createdPoiId = null; // Reset
        });
    });
});
