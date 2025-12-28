const { getJwt, getAuthenticatedApi, STRAPI_URL, logProgress } = require('../utils');
const axios = require('axios');

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

async function retryOperation(operation, name) {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            return await operation();
        } catch (e) {
            console.warn(`Attempt ${i + 1}/${MAX_RETRIES} failed for ${name}: ${e.message}`);
            if (i === MAX_RETRIES - 1) throw e;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
}

async function main() {
  try {
    const jwt = await getJwt();
    const api = await getAuthenticatedApi();
    if (!jwt) {
        console.error('Failed to get JWT');
        process.exit(1);
    }

    // -----------------------------------------------------------------------
    // 1. Update Public Permissions
    // -----------------------------------------------------------------------
    try {
        logProgress(1, 3, 'Updating Public Permissions');
        await retryOperation(async () => {
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
                    if (!permissions[apiName]) throw new Error(`Permission group ${apiName} not found. Strapi might be loading.`);
                    if (!permissions[apiName].controllers[controllerName]) throw new Error(`Controller ${controllerName} not found in ${apiName}.`);
                    permissions[apiName].controllers[controllerName].find.enabled = true;
                    permissions[apiName].controllers[controllerName].findOne.enabled = true;
                };

                enableRead('api::activity', 'activity');
                enableRead('api::poi', 'poi');
                enableRead('api::profile', 'profile');
                enableRead('api::event', 'event');

                if (permissions['plugin::users-permissions'] && permissions['plugin::users-permissions'].controllers['user']) {
                    permissions['plugin::users-permissions'].controllers['user'].me.enabled = true;
                }

                await axios.put(`${STRAPI_URL}/users-permissions/roles/${publicRole.id}`, {
                    permissions: permissions
                }, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
            } else {
                throw new Error('Public role not found. Strapi might still be bootstrapping.');
            }
        }, 'Public Permissions');
    } catch (e) {
        console.error('Error updating Public permissions:', e.message);
        throw e;
    }

    // -----------------------------------------------------------------------
    // 2. Update Ambassador Permissions
    // -----------------------------------------------------------------------
    try {
        logProgress(2, 3, 'Updating Ambassador Permissions');
        await retryOperation(async () => {
            const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
            let ambassadorRole = roles.find(r => r.name === 'Ambassador');

            if (!ambassadorRole) {
                try {
                    const createRoleRes = await axios.post(`${STRAPI_URL}/users-permissions/roles`, {
                        name: 'Ambassador',
                        description: 'Ambassador with full rights on POI, Event, and Activities',
                        type: 'ambassador'
                    }, {
                        headers: { Authorization: `Bearer ${jwt}` }
                    });
                    ambassadorRole = createRoleRes.data.role;
                } catch (err) {
                    console.error('Failed to create Ambassador role:', err.response?.data || err.message);
                    throw err;
                }
            }

            if (ambassadorRole) {
                const roleDetailsRes = await axios.get(`${STRAPI_URL}/users-permissions/roles/${ambassadorRole.id}`, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
                
                const roleData = roleDetailsRes.data.role;
                const permissions = roleData.permissions;

                const enableFullCRUD = (apiName, controllerName) => {
                    if (!permissions[apiName]) throw new Error(`Permission group ${apiName} not found. Strapi might be loading.`);
                    if (!permissions[apiName].controllers[controllerName]) throw new Error(`Controller ${controllerName} not found in ${apiName}.`);
                    permissions[apiName].controllers[controllerName].find.enabled = true;
                    permissions[apiName].controllers[controllerName].findOne.enabled = true;
                    permissions[apiName].controllers[controllerName].create.enabled = true;
                    permissions[apiName].controllers[controllerName].update.enabled = true;
                    permissions[apiName].controllers[controllerName].delete.enabled = true;
                };

                enableFullCRUD('api::activity', 'activity');
                enableFullCRUD('api::poi', 'poi');
                enableFullCRUD('api::event', 'event');
                
                if (permissions['api::profile'] && permissions['api::profile'].controllers['profile']) {
                     permissions['api::profile'].controllers['profile'].find.enabled = true;
                     permissions['api::profile'].controllers['profile'].findOne.enabled = true;
                }

                if (permissions['plugin::users-permissions'] && permissions['plugin::users-permissions'].controllers['user']) {
                    permissions['plugin::users-permissions'].controllers['user'].find.enabled = true;
                    permissions['plugin::users-permissions'].controllers['user'].findOne.enabled = true;
                    permissions['plugin::users-permissions'].controllers['user'].me.enabled = true;
                }

                if (permissions['plugin::upload'] && permissions['plugin::upload'].controllers['content-api']) {
                    permissions['plugin::upload'].controllers['content-api'].upload.enabled = true;
                }

                await axios.put(`${STRAPI_URL}/users-permissions/roles/${ambassadorRole.id}`, {
                    permissions: permissions
                }, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
            }
        }, 'Ambassador Permissions');
    } catch (e) {
        console.error('Error updating Ambassador permissions:', e.message);
        throw e;
    }

    // -----------------------------------------------------------------------
    // 3. Update Administrateur Permissions
    // -----------------------------------------------------------------------
    try {
        logProgress(2.5, 3, 'Updating Administrateur Permissions');
        await retryOperation(async () => {
            const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
            let adminRole = roles.find(r => r.name === 'Administrateur');

            if (!adminRole) {
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
                    throw err;
                }
            }

            if (adminRole) {
                const roleDetailsRes = await axios.get(`${STRAPI_URL}/users-permissions/roles/${adminRole.id}`, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
                
                const roleData = roleDetailsRes.data.role;
                const permissions = roleData.permissions;

                let updatedCount = 0;
                Object.keys(permissions).forEach(permissionKey => {
                    if (permissionKey === 'plugin::users-permissions') return;

                    const permissionGroup = permissions[permissionKey];
                    if (permissionGroup.controllers) {
                        Object.keys(permissionGroup.controllers).forEach(controllerKey => {
                            const controller = permissionGroup.controllers[controllerKey];
                            Object.keys(controller).forEach(actionKey => {
                                if (controller[actionKey] && typeof controller[actionKey].enabled !== 'undefined') {
                                    controller[actionKey].enabled = true;
                                    updatedCount++;
                                }
                            });
                        });
                    }
                });

                if (permissions['plugin::users-permissions']) {
                    const upControllers = permissions['plugin::users-permissions'].controllers;
                    if (upControllers['user']) {
                        ['find', 'findOne', 'me', 'count', 'create', 'update', 'destroy'].forEach(action => {
                            if (upControllers['user'][action]) upControllers['user'][action].enabled = true;
                        });
                    }
                    if (upControllers['role']) {
                         ['find', 'findOne'].forEach(action => {
                            if (upControllers['role'][action]) upControllers['role'][action].enabled = true;
                        });
                    }
                }

                console.log(`Enabling ${updatedCount} permissions for Administrateur...`);

                await axios.put(`${STRAPI_URL}/users-permissions/roles/${adminRole.id}`, {
                    permissions: permissions
                }, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
            }
        }, 'Administrateur Permissions');
    } catch (e) {
        console.error('Error updating Administrateur permissions:', e.message);
        throw e;
    }

    // -----------------------------------------------------------------------
    // 4. Update Authenticated Permissions
    // -----------------------------------------------------------------------
    try {
        logProgress(3, 3, 'Updating Authenticated Permissions');
        await retryOperation(async () => {
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
                    if (!permissions[apiName]) throw new Error(`Permission group ${apiName} not found. Strapi might be loading.`);
                    if (!permissions[apiName].controllers[controllerName]) throw new Error(`Controller ${controllerName} not found in ${apiName}.`);
                    permissions[apiName].controllers[controllerName].find.enabled = true;
                    permissions[apiName].controllers[controllerName].findOne.enabled = true;
                    permissions[apiName].controllers[controllerName].create.enabled = true;
                    permissions[apiName].controllers[controllerName].update.enabled = false;
                    permissions[apiName].controllers[controllerName].delete.enabled = false;
                };

                const enableFullCRUD = (apiName, controllerName) => {
                     if (!permissions[apiName]) throw new Error(`Permission group ${apiName} not found. Strapi might be loading.`);
                     if (!permissions[apiName].controllers[controllerName]) throw new Error(`Controller ${controllerName} not found in ${apiName}.`);
                    permissions[apiName].controllers[controllerName].find.enabled = true;
                    permissions[apiName].controllers[controllerName].findOne.enabled = true;
                    permissions[apiName].controllers[controllerName].create.enabled = true;
                    permissions[apiName].controllers[controllerName].update.enabled = true;
                    permissions[apiName].controllers[controllerName].delete.enabled = true;
                };

                enableReadCreate('api::activity', 'activity');
                enableReadCreate('api::poi', 'poi');
                enableReadCreate('api::event', 'event');
                enableFullCRUD('api::profile', 'profile');

                if (permissions['plugin::users-permissions'] && permissions['plugin::users-permissions'].controllers['user']) {
                    permissions['plugin::users-permissions'].controllers['user'].me.enabled = true;
                }

                if (permissions['plugin::upload'] && permissions['plugin::upload'].controllers['content-api']) {
                    permissions['plugin::upload'].controllers['content-api'].upload.enabled = true;
                }

                await axios.put(`${STRAPI_URL}/users-permissions/roles/${authRole.id}`, {
                    permissions: permissions
                }, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
            } else {
                throw new Error('Authenticated role not found. Strapi might still be bootstrapping.');
            }
        }, 'Authenticated Permissions');
    } catch (e) {
        console.error('Error updating Authenticated permissions:', e.message);
        throw e;
    }

    // -----------------------------------------------------------------------
    // 5. Assign Administrateur Role to Admin User
    // -----------------------------------------------------------------------
    try {
        logProgress(3.5, 3, 'Assigning Administrateur Role to Admin User');
        await retryOperation(async () => {
            const adminEmail = process.env.STRAPI_ADMIN_EMAIL || 'admin@gmail.com';
            
            // 1. Get the Administrateur Role
            const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
            const adminRole = roles.find(r => r.name === 'Administrateur');

            if (!adminRole) {
                throw new Error('Administrateur role not found even after creation step.');
            }

            // 2. Find the Admin User using CM API
            const usersRes = await api.get(`/plugin::users-permissions.user?filters[email][$eq]=${encodeURIComponent(adminEmail)}`);
            
            const users = usersRes.data.results || [];
            const adminUser = users[0];

            if (adminUser) {
                // 3. Update the user's role using CM API
                const uid = adminUser.documentId || adminUser.id;
                await api.put(`/plugin::users-permissions.user/${uid}`, {
                    role: adminRole.id
                });
                console.log(`Successfully assigned 'Administrateur' role to user ${adminEmail}`);
            } else {
                console.warn(`Admin user ${adminEmail} not found. Skipping role assignment.`);
            }
        }, 'Assign Admin Role');
    } catch (e) {
        console.error('Error assigning Administrateur role to Admin user:', e.message);
    }

    // -----------------------------------------------------------------------
    // 6. Assign Ambassador Role to Ambassador User
    // -----------------------------------------------------------------------
    try {
        logProgress(3.8, 3, 'Assigning Ambassador Role to Ambassador User');
        await retryOperation(async () => {
            const ambassadorEmail = process.env.STRAPI_AMBASSADOR_EMAIL || 'ambassador@onbouge.ch';
            
            // 1. Get the Ambassador Role
            const rolesRes = await axios.get(`${STRAPI_URL}/users-permissions/roles`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            const roles = rolesRes.data.roles || rolesRes.data.results || rolesRes.data || [];
            const ambassadorRole = roles.find(r => r.name === 'Ambassador');

            if (!ambassadorRole) {
                throw new Error('Ambassador role not found even after creation step.');
            }

            // 2. Find the Ambassador User using CM API
            const usersRes = await api.get(`/plugin::users-permissions.user?filters[email][$eq]=${encodeURIComponent(ambassadorEmail)}`);
            
            const users = usersRes.data.results || [];
            const ambassadorUser = users[0];

            if (ambassadorUser) {
                // 3. Update the user's role using CM API
                const uid = ambassadorUser.documentId || ambassadorUser.id;
                await api.put(`/plugin::users-permissions.user/${uid}`, {
                    role: ambassadorRole.id
                });
                console.log(`Successfully assigned 'Ambassador' role to user ${ambassadorEmail}`);
            } else {
                console.warn(`Ambassador user ${ambassadorEmail} not found. Skipping role assignment.`);
            }
        }, 'Assign Ambassador Role');
    } catch (e) {
        console.error('Error assigning Ambassador role to Ambassador user:', e.message);
    }

    console.log(JSON.stringify({}));
    process.exit(0);
  } catch (e) {
    console.error('\n❌ Permission update failed:', e.message);
    process.exit(1);
  }
}

main();
