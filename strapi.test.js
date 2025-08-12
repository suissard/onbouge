import { describe, it, expect, beforeEach, vi } from "vitest";

import StrapiApi from "./public/Core/StrapiApi.js"; // Chemin d'importation de votre classe StrapiApi

// On simule la fonction fetch globale
global.fetch = vi.fn();

// On simule le localStorage pour l'environnement de test (ex: Node.js)
const localStorageMock = (() => {
	let store = {};
	return {
		getItem: (key) => store[key] || null,
		setItem: (key, value) => {
			store[key] = value.toString();
		},
		removeItem: (key) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();
vi.spyOn(window, "localStorage", "get").mockImplementation(() => localStorageMock);

describe("StrapiApi avec Vitest", () => {
	const BASE_URL = "http://localhost:1337/api";
	let api;

	// Réinitialise les mocks avant chaque test
	beforeEach(() => {
		vi.clearAllMocks(); // Remplace fetch.mockClear()
		localStorageMock.clear();
		api = new StrapiApi(BASE_URL);
	});

	describe("Initialisation", () => {
		it("devrait créer une instance avec la bonne URL", () => {
			expect(api.baseUrl).toBe(BASE_URL);
		});

		// it('devrait charger un token depuis le localStorage lors de l\'initialisation', () => {
		//     localStorageMock.setItem('strapi_jwt_token', 'mon-vieux-token');
		//     const apiWithToken = new StrapiApi(BASE_URL);
		//     expect(apiWithToken.token).toBe('mon-vieux-token');q
		// });
	});

	describe("Authentification", () => {
		it("devrait définir un token et le sauvegarder dans le localStorage", () => {
			const fakeToken = "mon-nouveau-token-jwt";
			api.setAuthToken(fakeToken);
			expect(api.token).toBe(fakeToken);
			expect(localStorageMock.getItem("strapi_jwt_token")).toBe(fakeToken);
		});

		it("devrait supprimer le token lors de la déconnexion (logout)", () => {
			api.setAuthToken("un-token-a-supprimer");
			api.logout();
			expect(api.token).toBeNull();
			expect(localStorageMock.getItem("strapi_jwt_token")).toBeNull();
		});
	});

	describe("Méthodes CRUD", () => {
		it("GET devrait appeler fetch avec la bonne méthode et URL", async () => {
			const mockData = { data: [{ id: 1, title: "Article 1" }] };
			fetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => mockData,
			});

			const result = await api.get("articles");
			expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/articles`, expect.any(Object));
			expect(result).toEqual(mockData);
		});

		it("POST devrait appeler fetch avec le corps de requête correctement formaté", async () => {
			const articleData = { title: "Nouveau Titre" };
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: { id: 2, ...articleData } }),
			});

			await api.post("articles", articleData);
			expect(fetch).toHaveBeenCalledWith(
				`${BASE_URL}/articles`,
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ data: articleData }),
				})
			);
		});

		it("devrait inclure le header Authorization si un token est défini", async () => {
			const fakeToken = "mon-token-secret";
			api.setAuthToken(fakeToken);
			fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

			await api.get("/users/me");
			expect(fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: `Bearer ${fakeToken}`,
					}),
				})
			);
		});
	});

	describe("Gestion des erreurs", () => {
		it('devrait lever une erreur si la réponse de fetch n\'est pas "ok"', async () => {
			const errorResponse = { error: { message: "Article non trouvé" } };
			fetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: "Not Found",
				json: async () => errorResponse,
			});

			await expect(api.get("articles", "999")).rejects.toThrow("Article non trouvé");
		});
	});
});
