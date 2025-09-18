import { describe, it, expect, beforeEach, vi } from "vitest";
import StrapiApi from "./public/Core/StrapiApi.js"; // Ce chemin sera intercepté par le mock

describe("StrapiApi avec Mock", () => {
	const BASE_URL = "http://localhost:1337/api";
	let api;

	beforeEach(() => {
		// Pas besoin de mocks globaux, Vitest gère le remplacement du module
		api = new StrapiApi(BASE_URL);
	});

	describe("Initialisation", () => {
		it("devrait créer une instance avec la bonne URL", () => {
			expect(api.baseUrl).toBe(BASE_URL);
		});
	});

	describe("Authentification", () => {
		it("devrait définir un token sur l'instance", () => {
			const fakeToken = "mon-nouveau-token-jwt";
			api.setAuthToken(fakeToken);
			expect(api.token).toBe(fakeToken);
		});

		it("devrait supprimer le token lors de la déconnexion (logout)", () => {
			api.setAuthToken("un-token-a-supprimer");
			api.logout();
			expect(api.token).toBeNull();
		});
	});

	describe("Méthodes CRUD", () => {
		it("GET devrait retourner une liste d'articles depuis le mock", async () => {
			const result = await api.get("articles");
			// Vérifie la structure que le mock est censé retourner
			expect(result).toHaveProperty("data");
            expect(result).toHaveProperty("meta");
			expect(Array.isArray(result.data)).toBe(true);
			expect(result.data[0].attributes.title).toBe('Test Article');
		});

		it("POST devrait ajouter un article à la base de données mockée", async () => {
			const articleData = { title: "Nouveau Titre" };
			const result = await api.post("articles", articleData);

            expect(result.data.attributes.title).toBe("Nouveau Titre");

            // Vérifions qu'il a bien été ajouté
            const allArticles = await api.get("articles");
            expect(allArticles.data.length).toBe(2);
		});

		it("devrait retourner les informations de l'utilisateur avec get 'users/me'", async () => {
            // On simule une connexion
            await api.login('testuser_1754166436219@example.com', 'Password123!');

            const result = await api.get("users/me");
			expect(result.data.email).toBe('testuser_1754166436219@example.com');
		});
	});

	describe("Gestion des erreurs", () => {
		it('devrait lever une erreur si l\'élément n\'est pas trouvé', async () => {
			// On s'attend à ce que le mock rejette la promesse avec 'Not found'
			await expect(api.get("articles", "999")).rejects.toThrow("Not found");
		});

        it('devrait lever une erreur si le endpoint n\'existe pas', async () => {
			await expect(api.get("nonexistent-endpoint")).rejects.toThrow("Endpoint nonexistent-endpoint not found in mock DB");
        });
	});
});
