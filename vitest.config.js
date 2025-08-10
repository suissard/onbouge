import { defineConfig } from "vite";

export default defineConfig({
	test: {
		environment: "jsdom", // <-- C'est la ligne la plus importante !
		include: ["test/*.test.js"],
	},
});
