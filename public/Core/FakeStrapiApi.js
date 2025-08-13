/**
 * Classe FAKE pour interagir avec une API Strapi v4.
 * Elle utilise des fichiers JSON locaux au lieu d'un backend réel.
 */
class StrapiApi {
	constructor() {
		console.log("🤖 FakeStrapiApi initialized");
		this.dataCache = new Map(); // Cache pour éviter de re-fetcher les JSON
	}

	/**
	 * Charge les données depuis un fichier JSON local.
	 * Met en cache les résultats pour éviter les lectures multiples.
	 * @private
	 * @param {string} endpoint - Le nom du fichier de données (sans .json).
	 * @returns {Promise<any>}
	 */
	async _loadData(endpoint) {
		if (this.dataCache.has(endpoint)) {
			return this.dataCache.get(endpoint);
		}

		// Adapte le chemin pour les endpoints spéciaux comme 'users/me'
		const filePath = endpoint.startsWith("users") ? "users" : endpoint;

		const response = await fetch(`/data/${filePath}.json`);
		if (!response.ok) {
			throw new Error(`Failed to load data for ${endpoint}`);
		}
		const data = await response.json();
		this.dataCache.set(endpoint, data);
		return data;
	}

	// --- Méthodes CRUD pour les contenus ---

	async get(endpoint, id, params = {}) {
		console.log(`[FakeStrapiApi] GET request for endpoint: ${endpoint}, id: ${id}`);
		try {
			const rawData = await this._loadData(endpoint);

			// Strapi enveloppe souvent les collections dans un objet { data: [...] }
			// On vérifie si la structure est celle-ci ou un simple tableau.
			const collection = Array.isArray(rawData.data)
				? rawData.data
				: Array.isArray(rawData)
				? rawData
				: [];

			if (id) {
				// Cas spécial pour 'users/me'
				if (endpoint === "users" && id === "me") {
					// On retourne le premier utilisateur comme "me" pour la démo
					// Dans une vraie app, il faudrait gérer l'utilisateur connecté.
					const meUser = collection.length > 0 ? collection[0] : null;
					// Strapi enveloppe la réponse simple dans { data: ... }
					return meUser ? { data: meUser } : null;
				}

				const numericId = parseInt(id, 10);
				const item = collection.find((d) => d.id === numericId);

				// Strapi enveloppe la réponse simple dans { data: ... }
				return item ? { data: item } : null;
			}

			// Pour une collection, on retourne la structure que Strapi utilise
			// (soit l'objet original avec sa propriété 'data', soit on l'enveloppe nous-mêmes)
			if (Array.isArray(rawData.data)) {
				return rawData; // La structure est déjà { data: [...] }
			} else {
				return { data: rawData }; // On enveloppe le tableau simple
			}
		} catch (error) {
			console.error(`[FakeStrapiApi] Error in get():`, error);
			return Promise.reject(error);
		}
	}

	async post(endpoint, data) {
		console.log(`[FakeStrapiApi] POST request to ${endpoint} with data:`, data);
		// Simule une création réussie en retournant les données envoyées
		// avec un ID factice, enveloppé dans la structure Strapi.
		const fakeId = Math.floor(Math.random() * 1000);
		return Promise.resolve({ data: { id: fakeId, attributes: data } });
	}

	async put(endpoint, id, data) {
		console.log(`[FakeStrapiApi] PUT request to ${endpoint}/${id} with data:`, data);
		// Simule une mise à jour réussie
		return Promise.resolve({
			data: { id: parseInt(id, 10), attributes: data },
		});
	}

async delete(endpoint, id) {
    console.log(`[FakeStrapiApi] DELETE request to ${endpoint}/${id}`);
    // Simule une suppression réussie
    const numericId = parseInt(id, 10);

    // Charger les données actuelles
    const rawData = await this._loadData(endpoint);
    const collection = Array.isArray(rawData.data) ? rawData.data : Array.isArray(rawData) ? rawData : [];

    // Filtrer pour "supprimer" l'élément
    const updatedCollection = collection.filter(item => item.id !== numericId);

    // Mettre à jour le cache (important pour la cohérence de la session)
    if (Array.isArray(rawData.data)) {
        this.dataCache.set(endpoint, { ...rawData, data: updatedCollection });
    } else {
        this.dataCache.set(endpoint, updatedCollection);
    }

    console.log(`[FakeStrapiApi] Item ${id} "deleted" from ${endpoint}. New count: ${updatedCollection.length}`);

    // Retourner l'élément supprimé, comme le fait souvent Strapi
    const deletedItem = collection.find(item => item.id === numericId);
    return Promise.resolve({ data: deletedItem || { id: numericId } });
}


	// --- Méthodes d'authentification (factices) ---

	async login(identifier, password) {
		console.log(`[FakeStrapiApi] Login attempt for: ${identifier}`);
		try {
			const usersData = await this._loadData("users");
			const users = usersData.data || usersData;
			// Simule une connexion réussie avec le premier utilisateur
			const user = users.length > 0 ? users[0] : null;
			if (user) {
				return Promise.resolve({
					jwt: "fake-jwt-token",
					user: user.attributes || user, // Gère les deux structures
				});
			}
			return Promise.reject(new Error("Invalid identifier or password"));
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async register(username, email, password) {
		console.log(`[FakeStrapiApi] Registration for: ${username}`);
		// Simule une inscription réussie
		const fakeUser = {
			id: Math.floor(Math.random() * 1000),
			username,
			email,
		};
		return Promise.resolve({
			jwt: "fake-jwt-token-for-new-user",
			user: fakeUser,
		});
	}

	logout() {
		console.log("[FakeStrapiApi] Logout");
		// Rien à faire ici car il n'y a pas de vrai état de connexion
	}

	async getMeUser() {
		console.log("[FakeStrapiApi] getMeUser");
		return this.get("users", "me");
	}
}

if (typeof window.StrapiApi === 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StrapiApi;
  } else {
    window.StrapiApi = StrapiApi;
  }
}
