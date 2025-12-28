import axios from 'axios';

export const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
export const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'admin@gmail.com';
export const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'Password123456789!';
export const APP_ADMIN_PASSWORD = process.env.STRAPI_APP_ADMIN_PASSWORD || 'UserPassword123!';

let cachedJwt = null;
let cachedAdminJwt = null;
let cachedStrapiAdminJwt = null;

const MAX_RETRIES = 10;
const RETRY_DELAY = 7000;

async function retryOperation(operation) {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            return await operation();
        } catch (e) {
            if (i === MAX_RETRIES - 1) throw e;
            const isRateLimit = e.response && e.response.status === 429;
            const delay = isRateLimit ? RETRY_DELAY * (i + 1) : RETRY_DELAY;
            console.warn(`Attempt ${i + 1} failed: ${e.message}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

export async function getJwt(email, password) {
    if (cachedJwt && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) return cachedJwt;
    
    return retryOperation(async () => {
        try {
            const response = await axios.post(`${STRAPI_URL}/api/auth/local`, {
                identifier: email,
                password: password
            });
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) cachedJwt = response.data.jwt;
            return response.data.jwt;
        } catch (error) {
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) cachedJwt = null;
            throw error;
        }
    });
}

export async function getAdminJwt() {
    return getJwt(ADMIN_EMAIL, ADMIN_PASSWORD);
}

export async function getStrapiAdminJwt() {
    if (cachedStrapiAdminJwt) return cachedStrapiAdminJwt;

    return retryOperation(async () => {
        try {
            const response = await axios.post(`${STRAPI_URL}/admin/login`, {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });
            cachedStrapiAdminJwt = response.data.data.token;
            return cachedStrapiAdminJwt;
        } catch (error) {
            cachedStrapiAdminJwt = null;
            // Try fallback
            try {
                const response = await axios.post(`${STRAPI_URL}/admin/login`, {
                    email: 'admin@example.com',
                    password: 'Password123!'
                });
                cachedStrapiAdminJwt = response.data.data.token;
                return cachedStrapiAdminJwt;
            } catch (e) {
                cachedStrapiAdminJwt = null; 
                throw new Error(`Strapi Admin login failed: ${error.response?.data?.error?.message || error.message}`);
            }
        }
    });
}

export async function publishAll(jwt, uid) {
    const res = await axios.get(`${STRAPI_URL}/content-manager/collection-types/${uid}?pageSize=100`, {
        headers: { Authorization: `Bearer ${jwt}` }
    });
    const entries = res.data.results || [];
    for (const entry of entries) {
        try {
            const documentId = entry.documentId || entry.id;
            // Unpublish then Publish to force state synchronization
            try {
                await axios.post(`${STRAPI_URL}/content-manager/collection-types/${uid}/${documentId}/actions/unpublish`, {}, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
            } catch (e) { /* ignore if already unpublished */ }

            await axios.post(`${STRAPI_URL}/content-manager/collection-types/${uid}/${documentId}/actions/publish`, {}, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
        } catch (e) {
            console.warn(`Failed to re-publish ${uid} ${entry.documentId || entry.id}: ${e.message}`);
        }
    }
}
