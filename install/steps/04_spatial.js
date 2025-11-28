const { runCommand } = require('../utils');

async function main() {
  try {
    console.log('\n=== Setting up Spatial Data ===');
    const sqlCommands = [
        "ALTER TABLE pois ADD COLUMN location POINT;",
        "UPDATE pois SET location = ST_GeomFromText('POINT(0 0)') WHERE location IS NULL;",
        "ALTER TABLE pois MODIFY location POINT NOT NULL DEFAULT (POINT(0,0));",
        "ALTER TABLE pois ADD SPATIAL INDEX(location);"
    ];

    for (const sql of sqlCommands) {
        try {
             await runCommand('docker', [
                'exec', 'mysql', 'mysql', '-u', 'strapi', '-pstrapi', 'strapi', '-e', `"${sql}"`
            ]);
        } catch (e) {
            console.log(`Note: Command "${sql}" failed (likely already exists). Continuing...`);
        }
    }
    process.exit(0);
  } catch (e) {
    console.error('\n❌ Spatial setup failed:', e.message);
    process.exit(1);
  }
}

main();
