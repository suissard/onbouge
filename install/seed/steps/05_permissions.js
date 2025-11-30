const { getJwt, STRAPI_URL, logProgress } = require('../utils');
const axios = require('axios');

async function main() {
  try {
    const jwt = await getJwt();
    if (!jwt) process.exit(1);

    // Update Public Permissions
    try {
        logProgress(1, 3, 'Updating Public Permissions');
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

            // Enable 'me' for Public (often needed for initial auth checks or limited profile views)
            if (permissions['plugin::users-permissions'] && permissions['plugin::users-permissions'].controllers['user']) {
                permissions['plugin::users-permissions'].controllers['user'].me.enabled = true;
            }

            await axios.put(`${STRAPI_URL}/users-permissions/roles/${publicRole.id}`, {
                permissions: permissions
            }, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
        }
    } catch (e) {}

    // Update Ambassador Permissions
    try {
        logProgress(2, 3, 'Updating Ambassador Permissions');
        const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
        let ambassadorRole = roles.find(r => r.name === 'Ambassador');

        if (!ambassadorRole) {
            // Create Ambassador role if it doesn't exist
            try {
                const createRoleRes = await axios.post(`${STRAPI_URL}/users-permissions/roles`, {
                    name: 'Ambassador',
                    description: 'Ambassador with full rights on POI, Event, and Sports',
                    type: 'ambassador'
                }, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
                ambassadorRole = createRoleRes.data.role;
            } catch (err) {
                console.error('Failed to create Ambassador role:', err.response?.data || err.message);
            }
        }

        if (ambassadorRole) {
            const roleDetailsRes = await axios.get(`${STRAPI_URL}/users-permissions/roles/${ambassadorRole.id}`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            
            const roleData = roleDetailsRes.data.role;
            const permissions = roleData.permissions;

            const enableFullCRUD = (apiName, controllerName) => {
                if (permissions[apiName] && permissions[apiName].controllers[controllerName]) {
                    permissions[apiName].controllers[controllerName].find.enabled = true;
                    permissions[apiName].controllers[controllerName].findOne.enabled = true;
                    permissions[apiName].controllers[controllerName].create.enabled = true;
                    permissions[apiName].controllers[controllerName].update.enabled = true;
                    permissions[apiName].controllers[controllerName].delete.enabled = true;
                }
            };

            enableFullCRUD('api::sport', 'sport');
            enableFullCRUD('api::poi', 'poi');
            enableFullCRUD('api::event', 'event');
            // Ambassador can also read profiles, maybe? Assuming yes for now, similar to public/auth
            if (permissions['api::profile'] && permissions['api::profile'].controllers['profile']) {
                 permissions['api::profile'].controllers['profile'].find.enabled = true;
                 permissions['api::profile'].controllers['profile'].findOne.enabled = true;
            }

            // Ambassador needs to find users to assign authors (or at least see them)
            if (permissions['plugin::users-permissions'] && permissions['plugin::users-permissions'].controllers['user']) {
                permissions['plugin::users-permissions'].controllers['user'].find.enabled = true;
                permissions['plugin::users-permissions'].controllers['user'].findOne.enabled = true;
                permissions['plugin::users-permissions'].controllers['user'].me.enabled = true;
            }

            // Enable upload for Ambassador
            if (permissions['plugin::upload'] && permissions['plugin::upload'].controllers['content-api']) {
                permissions['plugin::upload'].controllers['content-api'].upload.enabled = true;
            }

            await axios.put(`${STRAPI_URL}/users-permissions/roles/${ambassadorRole.id}`, {
                permissions: permissions
            }, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
        }
    } catch (e) {
        console.error('Error updating Ambassador permissions:', e);
    }

    // Update Administrateur Permissions
    try {
        logProgress(2.5, 3, 'Updating Administrateur Permissions');
        const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
            headers: { Authorization: `Bearer ${jwt}` }
        });
        const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
        let adminRole = roles.find(r => r.name === 'Administrateur');

        if (!adminRole) {
            // Create Administrateur role if it doesn't exist
            try {
                const createRoleRes = await axios.post(`${STRAPI_URL}/users-permissions/roles`, {
                    name: 'Administrateur',
                    description: 'Administrator with full rights on ALL content types',
                    type: 'administrateur'
                }, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
                adminRole = createRoleRes.data.role;
            } catch (err) {
                console.error('Failed to create Administrateur role:', err.response?.data || err.message);
            }
        }

        if (adminRole) {
            const roleDetailsRes = await axios.get(`${STRAPI_URL}/users-permissions/roles/${adminRole.id}`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            
            const roleData = roleDetailsRes.data.role;
            const permissions = roleData.permissions;

            // Grant ALL permissions to Administrateur
            Object.keys(permissions).forEach(permissionKey => {
                const permissionGroup = permissions[permissionKey];
                if (permissionGroup.controllers) {
                    Object.keys(permissionGroup.controllers).forEach(controllerKey => {
                        const controller = permissionGroup.controllers[controllerKey];
                        Object.keys(controller).forEach(actionKey => {
                            if (controller[actionKey] && typeof controller[actionKey].enabled !== 'undefined') {
                                controller[actionKey].enabled = true;
                            }
                        });
                    });
                }
            });



            await axios.put(`${STRAPI_URL}/users-permissions/roles/${adminRole.id}`, {
                permissions: permissions
            }, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
        }
    } catch (e) {
        console.error('Error updating Administrateur permissions:', e);
    }

    // Update Authenticated Permissions
    try {
        logProgress(3, 3, 'Updating Authenticated Permissions');
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

            const enableReadCreate = (apiName, controllerName) => {
                if (permissions[apiName] && permissions[apiName].controllers[controllerName]) {
                    permissions[apiName].controllers[controllerName].find.enabled = true;
                    permissions[apiName].controllers[controllerName].findOne.enabled = true;
                    permissions[apiName].controllers[controllerName].create.enabled = true;
                    // Explicitly disable update and delete
                    permissions[apiName].controllers[controllerName].update.enabled = false;
                    permissions[apiName].controllers[controllerName].delete.enabled = false;
                }
            };

            const enableFullCRUD = (apiName, controllerName) => {
                 if (permissions[apiName] && permissions[apiName].controllers[controllerName]) {
                    permissions[apiName].controllers[controllerName].find.enabled = true;
                    permissions[apiName].controllers[controllerName].findOne.enabled = true;
                    permissions[apiName].controllers[controllerName].create.enabled = true;
                    permissions[apiName].controllers[controllerName].update.enabled = true;
                    permissions[apiName].controllers[controllerName].delete.enabled = true;
                }
            };

            enableReadCreate('api::sport', 'sport');
            enableReadCreate('api::poi', 'poi');
            enableReadCreate('api::event', 'event');
            
            // Keep full access for own profile
            enableFullCRUD('api::profile', 'profile');

            // Enable 'me' endpoint for Authenticated users
            if (permissions['plugin::users-permissions'] && permissions['plugin::users-permissions'].controllers['user']) {
                permissions['plugin::users-permissions'].controllers['user'].me.enabled = true;
            }

            // Enable upload for Authenticated users
            if (permissions['plugin::upload'] && permissions['plugin::upload'].controllers['content-api']) {
                permissions['plugin::upload'].controllers['content-api'].upload.enabled = true;
            }

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
