import { strapi as createStrapiClient } from '@strapi/client';

const strapiUrl = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

class StrapiWrapper {
  constructor() {
    this.client = createStrapiClient({ baseURL: `${strapiUrl}/api` });
    this.jwt = null;
  }

  setAuth(jwt) {
    this.jwt = jwt;
  }

  removeAuth() {
    this.jwt = null;
  }

  getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (this.jwt) {
      headers['Authorization'] = `Bearer ${this.jwt}`;
    }
    return headers;
  }

  async _fetch(path, options) {
    const res = await this.client.fetch(path, options);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error.message);
    }
    return res.json();
  }

  async login(identifier, password) {
    return this._fetch('/auth/local', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ identifier, password }),
    });
  }

  async register(username, email, password) {
    return this._fetch('/auth/local/register', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, email, password }),
    });
  }

  async get(path) {
    return this._fetch(`/${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }
}

const strapi = new StrapiWrapper();

export default strapi;
