/**
 * Classe pour interagir avec une API Strapi v4.
 * Version corrigée avec une gestion distincte pour les requêtes d'authentification.
 */
class StrapiApi {
	constructor(
		baseUrl = "http://localhost:1337/api/",
		token = null,
		localStorageKeyToken = "strapi_jwt_token",
		localStorageKeyUser = "strapi_user"
	) {
		if (!baseUrl) throw new Error("L'URL de base de l'API est requise.");
		this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
		this.localStorageKeyToken = localStorageKeyToken;
		this.localStorageKeyUser = localStorageKeyUser;
		this.token = token || this._loadTokenFromStorage();
	}

	// --- Méthodes de gestion du stockage local ---

	/**
	 * Charge le token d'authentification depuis le stockage local.
	 * Si le stockage local n'est pas disponible (ex: dans un environnement Node.js),
	 * il retourne null.
	 * @private
	 * @returns {String|null} - Le token d'authentification ou null si non trouvé.
	 */
	_loadTokenFromStorage() {
		if (typeof window !== "undefined" && window.localStorage) {
			return window.localStorage.getItem(this.localStorageKeyToken);
		}
		return null;
	}

	/**
	 * Sauvegarde le token d'authentification dans le stockage local.
	 * Si le token est null, il supprime le token du stockage local.
	 * @private
	 * @param {String} token
	 */
	_saveTokenToStorage(token) {
		if (typeof window !== "undefined" && window.localStorage) {
			if (token) window.localStorage.setItem(this.localStorageKeyToken, token);
			else window.localStorage.removeItem(this.localStorageKeyToken);
		}
	}

	/**
	 * Charge les informations de l'utilisateur depuis le stockage local.
	 * Si le stockage local n'est pas disponible (ex: dans un environnement Node.js),
	 * il retourne null.
	 * @private
	 * @returns {String|null} - Le token d'authentification ou null si non trouvé.
	 */
	_loadUserMeFromStorage() {
		if (typeof window !== "undefined" && window.localStorage) {
			return window.localStorage.getItem(this.localStorageKeyUser);
		}
		return null;
	}

	/**
	 * Sauvegarde les informations de l'utilisateur dans le stockage local.
	 * Si l'utilisateur est null, il supprime les informations de l'utilisateur du stockage local
	 * @private
	 * @param {Object} user
	 */
	_saveUserToStorage(user) {
		if (typeof window !== "undefined" && window.localStorage) {
			if (user)
				window.localStorage.setItem(this.localStorageKeyUser, JSON.stringify(user));
			else window.localStorage.removeItem(this.localStorageKeyUser);
		}
	}

	// --- Méthodes d'authentification ---

	/**
	 * Définit le token d'authentification et le sauvegarde dans le stockage local.
	 * Si le token est null, il supprime le token du stockage local.
	 * @param {String} token
	 */
	setAuthToken(token) {
		this.token = token;
		this._saveTokenToStorage(token);
	}

	/**
	 * Connecte un utilisateur et sauvegarde son token et ses informations.
	 * @param {string} identifier - L'email ou le nom d'utilisateur.
	 * @param {string} password - Le mot de passe.
	 * @returns {Promise<object>} - L'objet utilisateur.
	 */
	async login(identifier, password) {
		// On utilise une requête POST "brute" sans l'encapsulation { data: ... }
		const response = await this._rawRequest("/auth/local", {
			method: "POST",
			body: JSON.stringify({ identifier, password }),
		});

		this.setAuthToken(response.jwt);
		this._saveUserToStorage(response.user);
		return response.user;
	}

	/**
	 * Inscrit un nouvel utilisateur et le connecte.
	 * @param {string} username - Le nom d'utilisateur.
	 * @param {string} email - L'email.
	 * @param {string} password - Le mot de passe.
	 * @returns {Promise<object>} - L'objet utilisateur.
	 */
	async register(username, email, password) {
		const response = await this._rawRequest("/auth/local/register", {
			method: "POST",
			body: JSON.stringify({ username, email, password }),
		});

		this.setAuthToken(response.jwt);
		this._saveUserToStorage(response.user);
		return response.user;
	}

	/**
	 * Déconnecte l'utilisateur en supprimant le token et les informations de l'utilisateur.
	 */
	logout() {
		this.setAuthToken(null);
		this._saveUserToStorage(null);
	}

	/**
	 * Recuperer les donnée de l'utilisateur connecté
	 * @returns {Promise<object>} - L'objet utilisateur connecté.
	 */
	async getMeUser() {
		const user = await this.get("users", "me");
		this._saveUserToStorage(user);
		return user;
	}

	/**
	 * Supprime le compte de l'utilisateur actuelle
	 * @returns
	 */
	async unregister() {
		await this.delete("users", this._loadUserMeFromStorage().id);
		this.logout();
	}
	// --- Méthodes de requêtes génériques ---

	/**
	 * Requête générique pour les contenus (articles, etc.)
	 * Encapsule automatiquement le corps des requêtes POST/PUT dans { "data": ... }
	 * @private
	 * @param {String} endpoint
	 * @param {Object} options
	 * @returns
	 */
	async _request(endpoint, options = {}) {
		let config = { ...options };
		if (config.body && (config.method === "POST" || config.method === "PUT")) {
			config.body = JSON.stringify({ data: config.body });
		}
		return this._rawRequest("/" + endpoint, config);
	}

	getHeader(optionsHeader = {}) {
		const defaultHeaders = {
			"Content-Type": "application/json",
			Accept: "application/json",
			"Access-Control-Allow-Origin": "*",
		};
		if (this.token) {
			defaultHeaders["Authorization"] = `Bearer ${this.token}`;
		}

		return { ...defaultHeaders, ...optionsHeader };
	}

	/**
	 * Requête de base qui envoie les données telles quelles.
	 * Utilisée par toutes les autres méthodes.
	 * @private
	 * @param {String} endpoint
	 * @param {Object} options
	 * @returns
	 */
	async _rawRequest(endpoint, options = {}) {
		const fullUrl = `${this.baseUrl}${endpoint}`;
		const config = { ...options, headers: this.getHeader(options.headers) };

		try {
			const response = await fetch(fullUrl, config);
			let jsonResponse = {};

			//Verifie  qu'on peut obtenir qune json dans la reponse
			try {
				jsonResponse = await response.json();
			} catch (e) {}

			if (!response.ok) {
				throw new Error(
					`Erreur ${options.method}-${fullUrl} ${response.status}: ${
						jsonResponse?.error?.message || response.statusText
					}`
				);
			}
			return jsonResponse;
		} catch (error) {
			console.error("Erreur de requête API:", error);
			throw error;
		}
	}

	// --- Méthodes CRUD pour les contenus ---

	get(endpoint, id, params = {}) {
		const queryString = new URLSearchParams(params).toString();
		const fullEndpoint = queryString
			? `${endpoint}${id ? "/" + id : ""}?${queryString}`
			: `${endpoint}${id ? "/" + id : ""}`;
		return this._request(fullEndpoint, { method: "GET" });
	}

	post(endpoint, data) {
		return this._request(endpoint, { method: "POST", body: data });
	}

	put(endpoint, id, data) {
		return this._request(`${endpoint}/${id}`, { method: "PUT", body: data });
	}

	delete(endpoint, id) {
		return this._request(`${endpoint}/${id}`, { method: "DELETE" });
	}
}

if (typeof window.StrapiApi === 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StrapiApi;
  } else {
    window.StrapiApi = StrapiApi;
  }
}
