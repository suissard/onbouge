const fs = require('fs');
const path = require('path');

// Path to the Strapi src/api directory (relative to this script)
// We assume this script is run from install/strapi/
const STRAPI_API_DIR = path.resolve(__dirname, '../../data_strapi/strapi/src/api');
const SCHEMAS_DIR = path.join(__dirname, 'schemas');

if (!fs.existsSync(STRAPI_API_DIR)) {
  console.error(`Error: Strapi API directory not found at ${STRAPI_API_DIR}`);
  console.error('Make sure you are running this script from the install/strapi directory and that the data_strapi folder exists.');
  process.exit(1);
}

const schemas = fs.readdirSync(SCHEMAS_DIR).filter(file => file.endsWith('.json'));

schemas.forEach(schemaFile => {
  const schemaName = path.basename(schemaFile, '.json');
  // Strapi expects singular name for directory usually, but let's check standard
  // Standard: src/api/[api-name]/content-types/[content-type-name]/schema.json
  // We'll use the schemaName as the api-name.
  
  const apiDir = path.join(STRAPI_API_DIR, schemaName);
  const contentTypesDir = path.join(apiDir, 'content-types', schemaName);

  console.log(`Installing schema for ${schemaName}...`);

  // Create directories
  fs.mkdirSync(contentTypesDir, { recursive: true });

  // Read and write schema
  const schemaContent = fs.readFileSync(path.join(SCHEMAS_DIR, schemaFile), 'utf8');
  fs.writeFileSync(path.join(contentTypesDir, 'schema.json'), schemaContent);

  // Create basic controller if not exists
  const controllerDir = path.join(apiDir, 'controllers');
  if (!fs.existsSync(controllerDir)) {
      fs.mkdirSync(controllerDir, { recursive: true });
      const controllerContent = `'use strict';

/**
 * ${schemaName} controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::${schemaName}.${schemaName}');
`;
      fs.writeFileSync(path.join(controllerDir, `${schemaName}.js`), controllerContent);
  }

  // Create basic service if not exists
  const serviceDir = path.join(apiDir, 'services');
  if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
      const serviceContent = `'use strict';

/**
 * ${schemaName} service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::${schemaName}.${schemaName}');
`;
      fs.writeFileSync(path.join(serviceDir, `${schemaName}.js`), serviceContent);
  }

  // Create basic router if not exists
  const routerDir = path.join(apiDir, 'routes');
  if (!fs.existsSync(routerDir)) {
      fs.mkdirSync(routerDir, { recursive: true });
      const routerContent = `'use strict';

/**
 * ${schemaName} router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::${schemaName}.${schemaName}');
`;
      fs.writeFileSync(path.join(routerDir, `${schemaName}.js`), routerContent);
  }
});

console.log('Schemas installed successfully.');
console.log('Please restart your Strapi container to apply changes: docker compose restart strapi');
