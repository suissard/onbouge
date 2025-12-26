const { runCommand } = require("../utils");
const fs = require("fs");
const os = require("os");

async function main() {
	try {
		console.log("\n=== System Verification ===");

		// 1. Check Node Version
		const nodeVersion = process.version;
		console.log(`Node.js version: ${nodeVersion}`);
		const major = parseInt(nodeVersion.substring(1).split(".")[0], 10);
		if (major < 24) {
			throw new Error(
				`Node.js version must be >= 24. Current: ${nodeVersion}. Please upgrade Node.js.`
			);
		}

		// 2. Check Docker availability
		try {
			// Just catching error if command fails
			await runCommand("docker", ["--version"], { stdio: "ignore" });
		} catch (e) {
			throw new Error(
				"Docker is not installed or not accessible. Please install Docker."
			);
		}

		// 3. Check Docker Compose availability
		try {
			await runCommand("docker", ["compose", "version"], { stdio: "ignore" });
		} catch (e) {
			throw new Error(
				"Docker Compose is not available. Please install the Docker Compose plugin."
			);
		}

		// 4. Check Write Permissions
		try {
			// Check if we can write to the current directory
			fs.accessSync(".", fs.constants.W_OK);
			// Also check if we can write to a test file
			const testFile = ".perm_test";
			fs.writeFileSync(testFile, "test");
			fs.unlinkSync(testFile);
		} catch (e) {
			throw new Error(
				"Current directory is not writable. Please run with appropriate permissions (try sudo)."
			);
		}

		// 5. Check Linux/OS specific (Optional but good for debug)
		console.log(`OS: ${os.type()} ${os.release()} ${os.arch()}`);

		console.log("✅ System verification passed.");
	} catch (e) {
		console.error("\n❌ System verification failed:", e.message);
		process.exit(1);
	}
}

main();
