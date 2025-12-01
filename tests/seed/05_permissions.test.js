import { describe, it, expect, beforeAll, afterAll } from "vitest";
import axios from "axios";
import { STRAPI_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils';

describe("05_permissions", () => {
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
        const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
            headers: { Authorization: `Bearer ${adminJwt}` },
        });
        const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
        const ambassadorRole = roles.find((r) => r.name === "Ambassador");
        const authenticatedRole = roles.find((r) => r.type === "authenticated");
        const administrateurRole = roles.find((r) => r.name === "Administrateur");

        if (!ambassadorRole || !authenticatedRole || !administrateurRole) {
            throw new Error("Required roles (Ambassador, Authenticated, Administrateur) not found.");
        }

        // 3. Create Users
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

        // 4. Login as Users
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
        if (adminJwt) {
            // Cleanup users
            const deleteUser = async (user) => {
                if (user) {
                    const uid = user.documentId || user.id;
                    await axios.delete(
                        `${STRAPI_URL}/content-manager/collection-types/plugin::users-permissions.user/${uid}`,
                        { headers: { Authorization: `Bearer ${adminJwt}` } }
                    ).catch(() => {});
                }
            };
            await deleteUser(ambassadorUser);
            await deleteUser(authenticatedUser);
            await deleteUser(administrateurUser);

            // Cleanup data
            if (createdPoiId) await axios.delete(`${STRAPI_URL}/api/pois/${createdPoiId}`, { headers: { Authorization: `Bearer ${adminJwt}` } }).catch(() => {});
            if (createdEventId) await axios.delete(`${STRAPI_URL}/api/events/${createdEventId}`, { headers: { Authorization: `Bearer ${adminJwt}` } }).catch(() => {});
            if (createdSportId) await axios.delete(`${STRAPI_URL}/api/sports/${createdSportId}`, { headers: { Authorization: `Bearer ${adminJwt}` } }).catch(() => {});
        }
    });

    describe("Ambassador Role", () => {
        it("should be able to CREATE, UPDATE, DELETE POI", async () => {
            // Create
            const res = await axios.post(
                `${STRAPI_URL}/api/pois`,
                { data: { title: "Ambassador POI", description: "Test", latitude: 0, longitude: 0 } },
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(res.status).toBe(201);
            createdPoiId = res.data.data.documentId || res.data.data.id;

            // Update
            const updateRes = await axios.put(
                `${STRAPI_URL}/api/pois/${createdPoiId}`,
                { data: { title: "Ambassador POI Updated" } },
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(updateRes.status).toBe(200);

            // Delete
            const delRes = await axios.delete(
                `${STRAPI_URL}/api/pois/${createdPoiId}`,
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(delRes.status).toBe(204);
            createdPoiId = null;
        });
    });

    describe("Authenticated Role", () => {
        let authPoiId;
        it("should be able to CREATE but NOT UPDATE/DELETE POI", async () => {
            // Create
            const res = await axios.post(
                `${STRAPI_URL}/api/pois`,
                { data: { title: "Auth POI", description: "Test", latitude: 0, longitude: 0 } },
                { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
            );
            expect(res.status).toBe(201);
            authPoiId = res.data.data.documentId || res.data.data.id;
            createdPoiId = authPoiId; // For cleanup

            // Update (Fail)
            await expect(
                axios.put(
                    `${STRAPI_URL}/api/pois/${authPoiId}`,
                    { data: { title: "Auth POI Updated" } },
                    { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
                )
            ).rejects.toThrow(/403/);

            // Delete (Fail)
            await expect(
                axios.delete(
                    `${STRAPI_URL}/api/pois/${authPoiId}`,
                    { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
                )
            ).rejects.toThrow(/403/);
        });
    });

    describe("Administrateur Role", () => {
        it("should have FULL CRUD", async () => {
             // Create
             const res = await axios.post(
                `${STRAPI_URL}/api/pois`,
                { data: { title: "Admin POI", description: "Test", latitude: 0, longitude: 0 } },
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(res.status).toBe(201);
            createdPoiId = res.data.data.documentId || res.data.data.id;

            // Update
            const updateRes = await axios.put(
                `${STRAPI_URL}/api/pois/${createdPoiId}`,
                { data: { title: "Admin POI Updated" } },
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(updateRes.status).toBe(200);

            // Delete
            const delRes = await axios.delete(
                `${STRAPI_URL}/api/pois/${createdPoiId}`,
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(delRes.status).toBe(204);
            createdPoiId = null;
        });
    });
});
