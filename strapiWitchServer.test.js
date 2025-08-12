import { describe, it, expect, beforeAll, vi } from "vitest";

import StrapiApi from "./public/Core/StrapiApi.js"; // Chemin d'importation de votre classe StrapiApi

describe("Tests d'intégration de l'API Strapi", () => {
	// ⚠️ Assurez-vous que cette URL correspond à votre instance Strapi locale
	const STRAPI_INSTANCE_URL = "http://localhost:1337/api";
	const STRAPI_COLLECTION_ENDPOINT = "test-apis";
	const STRAPI_TOKEN =
		"5c5ae660ed42864d38ac44feb91ca42388271d023cbf95eae16222728546b0feec9e5b98ee6f23087d780f01da1517a47a804772fe1b812e3e25e9333332af9431d084e763a0d98672dc5bf6e5c883be26c3788b71310398f8f0f8cd8655e09d7b058da35760e2d25c69743178eca9482da178c196c27f2401db394f71c24937"; // Remplacez par un token valide si nécessaire
	const newArticle = {
		titre: `Article de test - ${Date.now()}`,
		data: { test: "test de POST" },
	};

	// const URL = 'http://localhost:1337/api';
	let api;
	let createdArticleId = null; // Pour stocker l'ID de l'article créé

	beforeAll(() => {
		api = new StrapiApi(STRAPI_INSTANCE_URL, STRAPI_TOKEN);
	});

	it("devrait pouvoir se connecter à l'API et récupérer des articles (GET)", async () => {
		const response = await api.get(STRAPI_COLLECTION_ENDPOINT);

		// On s'attend à recevoir un objet avec une clé 'data' (qui est un tableau) et une clé 'meta'
		expect(response).toBeTypeOf("object");
		expect(response).toHaveProperty("data");
		expect(response).toHaveProperty("meta");
		expect(Array.isArray(response.data)).toBe(true);
	});

	it("devrait pouvoir créer un nouvel article (POST)", async () => {
		const response = await api.post(STRAPI_COLLECTION_ENDPOINT, newArticle);

		expect(response).toHaveProperty("data");
		expect(response.data.id).toBeTypeOf("number");
		expect(response.data.attributes.title).toBe(newArticle.title);

		// On sauvegarde l'ID pour les tests suivants
		createdArticleId = response.data.id;
		console.log(`Article créé avec l'ID : ${createdArticleId}`);
	});

	it("devrait pouvoir mettre à jour un article existant (PUT)", async () => {
		// Ce test dépend du test de création
		if (!createdArticleId) {
			throw new Error(
				"L'ID de l'article créé n'est pas disponible. Exécutez d'abord le test de création."
			);
		}

		const updatedData = {
			titre: `Titre mis à jour - ${Date.now()}`,
		};
		const response = await api.put(
			STRAPI_COLLECTION_ENDPOINT,
			createdArticleId,
			updatedData
		);

		expect(response).toHaveProperty("data");
		expect(response.data.id).toBe(createdArticleId);
		expect(response.data.attributes.titre).toBe(updatedData.titre);
	});

	it("devrait pouvoir supprimer un article existant (DELETE)", async () => {
		// Ce test dépend du test de création
		if (!createdArticleId) {
			throw new Error(
				"L'ID de l'article créé n'est pas disponible. Exécutez d'abord le test de création."
			);
		}

		const response = await api.delete(STRAPI_COLLECTION_ENDPOINT, createdArticleId);

		// Une suppression réussie retourne souvent l'objet supprimé
		expect(response).toHaveProperty("data");
		expect(response.data.id).toBe(createdArticleId);

		// On peut vérifier qu'il n'existe plus en essayant de le récupérer
		await expect(
			api.get(STRAPI_COLLECTION_ENDPOINT + `/${createdArticleId}`)
		).rejects.toThrow();
	});
});
