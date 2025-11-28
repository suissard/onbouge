const { getJwt, STRAPI_URL, logProgress } = require('../utils');
const axios = require('axios');

async function main() {
  try {
    const jwt = await getJwt();
    if (!jwt) process.exit(1);

    // Update Public Permissions
    try {
        logProgress(1, 2, 'Updating Public Permissions');
        const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
        const publicRole = roles.find(r => r.type === 'public');

        if (publicRole) {
            const roleDetailsRes = await axios.get(`${STRAPI_URL}/users-permissions/roles/${publicRole.id}`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            
            const roleData = roleDetailsRes.data.role;
            const permissions = roleData.permissions;

            const enableRead = (apiName, controllerName) => {
                if (permissions[apiName] && permissions[apiName].controllers[controllerName]) {
                    permissions[apiName].controllers[controllerName].find.enabled = true;
                    permissions[apiName].controllers[controllerName].findOne.enabled = true;
                }
            };

            enableRead('api::sport', 'sport');
            enableRead('api::poi', 'poi');
            enableRead('api::profile', 'profile');
            enableRead('api::event', 'event');

            await axios.put(`${STRAPI_URL}/users-permissions/roles/${publicRole.id}`, {
                permissions: permissions
            }, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
        }
    } catch (e) {}

    // Update Authenticated Permissions
    try {
        logProgress(2, 2, 'Updating Authenticated Permissions');
        const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
        const authRole = roles.find(r => r.type === 'authenticated');

        if (authRole) {
            const roleDetailsRes = await axios.get(`${STRAPI_URL}/users-permissions/roles/${authRole.id}`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            
            const roleData = roleDetailsRes.data.role;
            const permissions = roleData.permissions;

            const enableCRUD = (apiName, controllerName) => {
                if (permissions[apiName] && permissions[apiName].controllers[controllerName]) {
                    permissions[apiName].controllers[controllerName].find.enabled = true;
                    permissions[apiName].controllers[controllerName].findOne.enabled = true;
                    permissions[apiName].controllers[controllerName].create.enabled = true;
                    permissions[apiName].controllers[controllerName].update.enabled = true;
                    permissions[apiName].controllers[controllerName].delete.enabled = true;
                }
            };

            enableCRUD('api::sport', 'sport');
            enableCRUD('api::poi', 'poi');
            enableCRUD('api::profile', 'profile');
            enableCRUD('api::event', 'event');

            await axios.put(`${STRAPI_URL}/users-permissions/roles/${authRole.id}`, {
                permissions: permissions
            }, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
        }
    } catch (e) {}

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
