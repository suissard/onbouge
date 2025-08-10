const StrapiApi = require("./StrapiApi");
const StrapiCacheManager = require("./StrapiCache");

/**
 * --------------------------------------------------------------------
 * CLASSE 2 : StrapiEntity (Modèle de données)
 * --------------------------------------------------------------------
 * Rôle : Représente une seule entrée. Contient la logique métier
 * et notifie son cache parent lors des modifications.
 */
class StrapiEntity {
	/**
	 *
	 * @param {Object} initialData
	 * @param {String} collectionEndpoint
	 * @param {StrapiApi} api
	 * @param {StrapiCacheManager} cacheManager
	 */
	constructor(initialData, collectionEndpoint, api, cacheManager = null) {
		if (!initialData || !initialData.id)
			throw new Error("Les données initiales avec un ID sont requises.");
		if (!collectionEndpoint) throw new Error("Le endpoint de la collection est requis.");
		if (!api) throw new Error("Une instance de StrapiApi est requise.");

		this.id = initialData.id;
		this.api = api;
		this.endpoint = `${collectionEndpoint}/${this.id}`;
		this.collectionEndpoint = collectionEndpoint;
		this.cacheManager = cacheManager; // Référence au cache parent

		this._applyData(initialData);
	}

	_applyData(rawData) {
		if (!rawData || !rawData.attributes) return;
		this._attributeKeys = Object.keys(rawData.attributes);
		Object.assign(this, rawData.attributes);
	}

	_buildPayload() {
		const payload = {};
		for (const key of this._attributeKeys) {
			if (this[key] !== undefined) payload[key] = this[key];
		}
		return payload;
	}

	async update() {
		const payload = this._buildPayload();
		const response = await this.api.put(this.endpoint, payload);
		this._applyData(response.data);

		// Notifier le cache parent de la mise à jour
		if (this.cacheManager) {
			this.cacheManager._updateInCache(this);
		}
		return this;
	}

	async delete() {
		await this.api.delete(this.endpoint);

		// Notifier le cache parent de la suppression
		if (this.cacheManager) {
			this.cacheManager._removeFromCache(this.id);
		}
		Object.freeze(this);
	}
}

module.exports = StrapiEntity;
