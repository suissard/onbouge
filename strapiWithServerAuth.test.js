import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import StrapiApi from "./public/Core/StrapiApi.js"; // Chemin d'importation de votre classe StrapiApi

describe.sequential("Tests d'intégration de l'authentification Strapi", () => {
	// ⚠️ Assurez-vous que cette URL correspond à votre instance Strapi locale
	const STRAPI_INSTANCE_URL = "http://localhost:1337/api";
	// On génère un email unique pour chaque série de tests pour éviter les conflits
	const testTimestamp = Date.now();
	const oldEmailRegisteretUser = "testuser_1754166436219@example.com";
	const testUserEmail = `testuser_${testTimestamp}@example.com`;
	const testUserName = `testuser_${testTimestamp}`;
	const testUserPassword = "Password123!";
	const STRAPI_PRIVATE_COLLECTION_ENDPOINT = "test-api-privates";
	let api, createdArticleId, otherUserId; // Pour stocker l'ID de l'article créé

	const newData = {
		titre: `Nouvel article - ${testTimestamp}`,
		data: "Contenu de l'article de test",
	};
	const testTimestamp2 = testTimestamp / 2;
	const testUserName2 = `testuser_${testTimestamp2}`;
	const testUserEmail2 = `testuser_${testTimestamp2}@example.com`;

	beforeAll(() => {
		api = new StrapiApi(STRAPI_INSTANCE_URL);
	});

	it("devrait inscrire un nouvel utilisateur avec succès (register)", async () => {
		const user = await api.register(testUserName, testUserEmail, testUserPassword);

		// On vérifie que la réponse de l'API contient un utilisateur avec les bonnes infos
		expect(user).toBeTypeOf("object");
		expect(user.id).toBeTypeOf("number");
		expect(user.email).toBe(testUserEmail);
		expect(user.username).toBe(testUserName);

		// On vérifie que le token a bien été stocké dans l'instance de la classe
		expect(api.token).toBeTypeOf("string");
		expect(api.token.length).toBeGreaterThan(20);
		api.logout(); // On déconnecte l'utilisateur après chaque test
	});

	it("devrait connecter un utilisateur ancien avec succès (login)", async () => {
		const user = await api.login(oldEmailRegisteretUser, testUserPassword);

		expect(user).toBeTypeOf("object");
		expect(user.email).toBe(oldEmailRegisteretUser);
		expect(api.token).toBeTypeOf("string");
		api.logout(); // On déconnecte l'utilisateur après chaque test
	});

	it("devrait recuperre ses donnée utilisateur (getMeUser)", async () => {
		await api.login(oldEmailRegisteretUser, testUserPassword);
		const user = await api.getMeUser();

		expect(user).toBeTypeOf("object");
		expect(user.email).toBe(oldEmailRegisteretUser);
		expect(user.username).toBe("testuser_1754166436219");
		api.logout(); // On déconnecte l'utilisateur après chaque test
	});

	it("devrait connecter un utilisateur recement registered avec succès (login)", async () => {
		const user = await api.login(testUserEmail, testUserPassword);

		expect(user).toBeTypeOf("object");
		expect(user.email).toBe(testUserEmail);
		expect(api.token).toBeTypeOf("string");
		api.logout(); // On déconnecte l'utilisateur après chaque test
	});

	it("devrait échouer à connecter un utilisateur avec un mauvais mot de passe", async () => {
		// On s'attend à ce que cet appel API rejette la promesse
		await expect(api.login(testUserEmail, "mauvais_mot_de_passe")).rejects.toThrow(
			"Invalid identifier or password"
		); // Strapi retourne ce message d'erreur spécifique
	});

	it("devrait échouer à inscrire un utilisateur si l'email est déjà pris", async () => {
		// On essaie de ré-inscrire le même utilisateur
		await expect(
			api.register(testUserName, testUserEmail, testUserPassword)
		).rejects.toThrow("Email or Username are already taken");
	});

	it("devrait pouvoir faire une requête POST en tant qu'utilisateur connecté", async () => {
		const user = await api.register(testUserName2, testUserEmail2, testUserPassword);
		otherUserId = user.id; // On stocke l'ID de l'autre utilisateur pour les tests suivants
		const response = await api.post(STRAPI_PRIVATE_COLLECTION_ENDPOINT, newData);

		expect(response).toBeTypeOf("object");
		expect(response.data).toHaveProperty("id");
		expect(response.data.attributes.title).toBe(newData.title);
		createdArticleId = response.data.id;
	});

	it("devrait pouvoir faire une requête GET en tant qu'utilisateur connecté", async () => {
		const response = await api.get(STRAPI_PRIVATE_COLLECTION_ENDPOINT, createdArticleId);

		expect(response).toBeTypeOf("object");
		expect(response.data).toBeTypeOf("object");
		expect(response.data.attributes.title).toBe(newData.title);
	});

	it("devrait pouvoir supprimer un article existant (DELETE)", async () => {
		// Ce test dépend du test de création
		if (!createdArticleId) {
			throw new Error(
				"L'ID de l'article créé n'est pas disponible. Exécutez d'abord le test de création."
			);
		}

		const response = await api.delete(
			STRAPI_PRIVATE_COLLECTION_ENDPOINT,
			createdArticleId
		);

		expect(response).toHaveProperty("data");
		expect(response.data.id).toBe(createdArticleId);
		await expect(
			api.get(STRAPI_PRIVATE_COLLECTION_ENDPOINT, createdArticleId)
		).rejects.toThrow();
	});

	it("ne devrait pas pouvoir supprimer un autre utilisateur", async () => {
		api.logout(); // On s'assure d'être déconnecté avant de tester
		await api.login(testUserEmail, testUserPassword);
		const user = await api.getMeUser();
		expect(user).toBeTypeOf("object");
		expect(user.email).toBe(testUserEmail);
		expect(user.username).toBe(testUserName);
		expect(user.id).not.toBe(otherUserId);

		await expect(api.delete("users", otherUserId)).rejects.toThrow();
	});

	it.skip("devrait pouvoir se supprimer (unregister)", async () => {
		const user = await api.getMeUser();
		expect(user).toBeTypeOf("object");
		expect(user.email).toBe(testUserEmail);
		expect(user.username).toBe(testUserName);

		await api.unregister();
		await expect(api.login(testUserEmail, testUserPassword)).rejects.toThrow(); // Strapi retourne ce message d'erreur spécifique
		await expect(
			api.get(STRAPI_PRIVATE_COLLECTION_ENDPOINT, createdArticleId)
		).rejects.toThrow();
	});
});
