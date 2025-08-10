const StrapiApi = require("./StrapiApi");
const StrapiEntity = require("./StrapiEntity");
/**
 * --------------------------------------------------------------------
 * CLASSE 3 : StrapiCacheManager (Chef d'orchestre)
 * --------------------------------------------------------------------
 * Rôle : Gère une collection d'entités, les charge depuis l'API,
 * les instancie et maintient le cache à jour.
 */
class StrapiCacheManager {
	/**
	 *
	 * @param {StrapiApi} strapiApi
	 * @param {String} endpoint
	 */
	constructor(strapiApi, endpoint) {
		if (!strapiApi || !(strapiApi instanceof StrapiApi))
			throw new Error("Une instance valide de StrapiApi est requise.");
		if (!endpoint) throw new Error("Un endpoint est requis.");
		this.api = strapiApi;
		this.endpoint = endpoint;
		this.cache = []; // Le cache contiendra des instances de StrapiEntity
		this.isLoaded = false;
	}

	async getAll({ forceRefresh = false, params = {} } = {}) {
		if (!forceRefresh && this.isLoaded) {
			console.log(`CACHE HIT pour "${this.endpoint}".`);
			return this.cache;
		}

		console.log(`CACHE MISS pour "${this.endpoint}". Récupération depuis l'API.`);
		const response = await this.api.get(this.endpoint, params);

		// Transformer les données brutes en instances de StrapiEntity "cache-aware"
		this.cache = response.data.map(
			(item) => new StrapiEntity(item, this.endpoint, this.api, this)
		);

		this.isLoaded = true;
		return this.cache;
	}

	async create(data) {
		const response = await this.api.post(this.endpoint, data);
		const newEntity = new StrapiEntity(response.data, this.endpoint, this.api, this);
		this.cache.push(newEntity); // Ajoute la nouvelle entité directement au cache
		return newEntity;
	}

	// Méthodes internes appelées par StrapiEntity pour maintenir la cohérence du cache
	_updateInCache(entityInstance) {
		const index = this.cache.findIndex((item) => item.id === entityInstance.id);
		if (index !== -1) {
			this.cache[index] = entityInstance;
			console.log(`CACHE SYNC: Entité ${entityInstance.id} mise à jour dans le cache.`);
		}
	}

	_removeFromCache(entityId) {
		const initialLength = this.cache.length;
		this.cache = this.cache.filter((item) => item.id !== entityId);
		if (this.cache.length < initialLength) {
			console.log(`CACHE SYNC: Entité ${entityId} supprimée du cache.`);
		}
	}
}

module.exports = StrapiCacheManager;
