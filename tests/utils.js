import axios from 'axios';

export const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
export const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || 'admin@gmail.com';
export const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || 'Password123456789!';

export async function getJwt(email, password) {
    try {
        const response = await axios.post(`${STRAPI_URL}/api/auth/local`, {
            identifier: email,
            password: password
        });
        return response.data.jwt;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        return null;
    }
}

export async function getAdminJwt() {
    return getJwt(ADMIN_EMAIL, ADMIN_PASSWORD);
}
