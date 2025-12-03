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
    let createdActivityId;
    let ambassadorProfile;
    let authenticatedProfile;
    let administrateurProfile;

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

        // 3.5 Create Profiles for Users
        const createProfile = async (user, name) => {
            const res = await axios.post(
                `${STRAPI_URL}/content-manager/collection-types/api::profile.profile`,
                {
                    username: name,
                    user: user.id,
                    description: `Profile for ${name}`
                },
                { headers: { Authorization: `Bearer ${adminJwt}` } }
            );
            return res.data;
        };

        ambassadorProfile = await createProfile(ambassadorUser, ambassadorCreds.username);
        authenticatedProfile = await createProfile(authenticatedUser, authCreds.username);
        administrateurProfile = await createProfile(administrateurUser, adminCreds.username);

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

            // Cleanup profiles
            const deleteProfile = async (profile) => {
                if (profile) {
                    const uid = profile.documentId || profile.id;
                    await axios.delete(
                        `${STRAPI_URL}/content-manager/collection-types/api::profile.profile/${uid}`,
                        { headers: { Authorization: `Bearer ${adminJwt}` } }
                    ).catch(() => {});
                }
            };
            await deleteProfile(ambassadorProfile);
            await deleteProfile(authenticatedProfile);
            await deleteProfile(administrateurProfile);

            // Cleanup data
            if (createdPoiId) await axios.delete(`${STRAPI_URL}/api/pois/${createdPoiId}`, { headers: { Authorization: `Bearer ${adminJwt}` } }).catch(() => {});
            if (createdEventId) await axios.delete(`${STRAPI_URL}/api/events/${createdEventId}`, { headers: { Authorization: `Bearer ${adminJwt}` } }).catch(() => {});
            if (createdActivityId) await axios.delete(`${STRAPI_URL}/api/activities/${createdActivityId}`, { headers: { Authorization: `Bearer ${adminJwt}` } }).catch(() => {});
        }
    });

    describe("Ambassador Role", () => {
        it("should be able to CREATE, UPDATE, DELETE POI", async () => {
            // Create
            const res = await axios.post(
                `${STRAPI_URL}/api/pois`,
                { data: { title: `Ambassador POI ${Date.now()}`, description: "Test", latitude: 0, longitude: 0 } },
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

        it("should be able to CREATE, UPDATE, DELETE Event", async () => {
            // Create
            const res = await axios.post(
                `${STRAPI_URL}/api/events`,
                { data: { title: `Ambassador Event ${Date.now()}`, description: "Test", date: new Date().toISOString() } },
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(res.status).toBe(201);
            createdEventId = res.data.data.documentId || res.data.data.id;

            // Update
            const updateRes = await axios.put(
                `${STRAPI_URL}/api/events/${createdEventId}`,
                { data: { title: `Ambassador Event Updated ${Date.now()}` } },
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(updateRes.status).toBe(200);

            // Delete
            const delRes = await axios.delete(
                `${STRAPI_URL}/api/events/${createdEventId}`,
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(delRes.status).toBe(204);
            createdEventId = null;
        });

        it("should be able to CREATE, UPDATE, DELETE Activity", async () => {
            // Create
            const res = await axios.post(
                `${STRAPI_URL}/api/activities`,
                { data: { title: `Ambassador Activity ${Date.now()}`, description: "Test" } },
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(res.status).toBe(201);
            createdActivityId = res.data.data.documentId || res.data.data.id;

            // Update
            const updateRes = await axios.put(
                `${STRAPI_URL}/api/activities/${createdActivityId}`,
                { data: { title: `Ambassador Activity Updated ${Date.now()}` } },
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(updateRes.status).toBe(200);

            // Delete
            const delRes = await axios.delete(
                `${STRAPI_URL}/api/activities/${createdActivityId}`,
                { headers: { Authorization: `Bearer ${ambassadorJwt}` } }
            );
            expect(delRes.status).toBe(204);
            createdActivityId = null;
        });
    });

    describe("Authenticated Role", () => {
        let authPoiId;
        let authEventId;
        let authActivityId;

        it("should be able to CREATE but NOT UPDATE/DELETE POI", async () => {
            // Create
            const res = await axios.post(
                `${STRAPI_URL}/api/pois`,
                { data: { title: `Auth POI ${Date.now()}`, description: "Test", latitude: 0, longitude: 0 } },
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

        it("should be able to CREATE but NOT UPDATE/DELETE Event", async () => {
            // Create
            const res = await axios.post(
                `${STRAPI_URL}/api/events`,
                { data: { title: `Auth Event ${Date.now()}`, description: "Test", date: new Date().toISOString() } },
                { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
            );
            expect(res.status).toBe(201);
            authEventId = res.data.data.documentId || res.data.data.id;
            createdEventId = authEventId; // For cleanup

            // Update (Fail)
            await expect(
                axios.put(
                    `${STRAPI_URL}/api/events/${authEventId}`,
                    { data: { title: "Auth Event Updated" } },
                    { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
                )
            ).rejects.toThrow(/403/);

            // Delete (Fail)
            await expect(
                axios.delete(
                    `${STRAPI_URL}/api/events/${authEventId}`,
                    { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
                )
            ).rejects.toThrow(/403/);
        });

        it("should be able to CREATE but NOT UPDATE/DELETE Activity", async () => {
            // Create
            const res = await axios.post(
                `${STRAPI_URL}/api/activities`,
                { data: { title: `Auth Activity ${Date.now()}`, description: "Test" } },
                { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
            );
            expect(res.status).toBe(201);
            authActivityId = res.data.data.documentId || res.data.data.id;
            createdActivityId = authActivityId; // For cleanup

            // Update (Fail)
            await expect(
                axios.put(
                    `${STRAPI_URL}/api/activities/${authActivityId}`,
                    { data: { title: "Auth Activity Updated" } },
                    { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
                )
            ).rejects.toThrow(/403/);

            // Delete (Fail)
            await expect(
                axios.delete(
                    `${STRAPI_URL}/api/activities/${authActivityId}`,
                    { headers: { Authorization: `Bearer ${authenticatedJwt}` } }
                )
            ).rejects.toThrow(/403/);
        });
    });

    describe("Administrateur Role", () => {
        it("should have FULL CRUD", async () => {
             // Create POI
             const res = await axios.post(
                `${STRAPI_URL}/api/pois`,
                { data: { title: `Admin POI ${Date.now()}`, description: "Test", latitude: 0, longitude: 0 } },
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(res.status).toBe(201);
            createdPoiId = res.data.data.documentId || res.data.data.id;

            // Update POI
            const updateRes = await axios.put(
                `${STRAPI_URL}/api/pois/${createdPoiId}`,
                { data: { title: `Admin POI Updated ${Date.now()}` } },
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(updateRes.status).toBe(200);

            // Delete POI
            const delRes = await axios.delete(
                `${STRAPI_URL}/api/pois/${createdPoiId}`,
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(delRes.status).toBe(204);
            createdPoiId = null;

            // Create Event
            const resEvent = await axios.post(
                `${STRAPI_URL}/api/events`,
                { data: { title: `Admin Event ${Date.now()}`, description: "Test", date: new Date().toISOString() } },
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(resEvent.status).toBe(201);
            createdEventId = resEvent.data.data.documentId || resEvent.data.data.id;

            // Update Event
            const updateResEvent = await axios.put(
                `${STRAPI_URL}/api/events/${createdEventId}`,
                { data: { title: `Admin Event Updated ${Date.now()}` } },
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(updateResEvent.status).toBe(200);

            // Delete Event
            const delResEvent = await axios.delete(
                `${STRAPI_URL}/api/events/${createdEventId}`,
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(delResEvent.status).toBe(204);
            createdEventId = null;

            // Create Activity
            const resActivity = await axios.post(
                `${STRAPI_URL}/api/activities`,
                { data: { title: `Admin Activity ${Date.now()}`, description: "Test" } },
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(resActivity.status).toBe(201);
            createdActivityId = resActivity.data.data.documentId || resActivity.data.data.id;

            // Update Activity
            const updateResActivity = await axios.put(
                `${STRAPI_URL}/api/activities/${createdActivityId}`,
                { data: { title: `Admin Activity Updated ${Date.now()}` } },
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(updateResActivity.status).toBe(200);

            // Delete Activity
            const delResActivity = await axios.delete(
                `${STRAPI_URL}/api/activities/${createdActivityId}`,
                { headers: { Authorization: `Bearer ${administrateurJwt}` } }
            );
            expect(delResActivity.status).toBe(204);
            createdActivityId = null;
        });
    });
});
