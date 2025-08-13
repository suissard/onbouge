import 'whatwg-fetch';
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const publicDir = path.resolve(__dirname, 'public');

const excludedFiles = [
    'example.html',
    'footer.html',
    'header.html',
    'sidebar.html',
    'settings.html',
    'testAuthGoogle.html'
];

// Fonction pour récupérer tous les fichiers HTML du répertoire public
function getHtmlFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (path.basename(fullPath) !== 'partials') { // Exclude partials directory
        files = files.concat(getHtmlFiles(fullPath));
      }
    } else if (fullPath.endsWith('.html') && !excludedFiles.includes(path.basename(fullPath))) {
      files.push(fullPath);
    }
  }
  return files;
}

const htmlFiles = getHtmlFiles(publicDir);

const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    }
  };
})();

// Custom fetch to handle local files
const createCustomFetch = (base) => async (url, options) => {
  const resolvedUrl = new URL(url, base);
  const filePath = path.resolve(publicDir, resolvedUrl.pathname.substring(1));
  const isJson = filePath.endsWith('.json');

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const headers = { 'Content-Type': isJson ? 'application/json' : 'text/html' };
    return new Response(data, { status: 200, headers });
  } catch (error) {
    const data = isJson ? '[]' : 'Not found'; // Return empty array for missing JSON
    const status = 404;
    const headers = { 'Content-Type': isJson ? 'application/json' : 'text/plain' };
    return new Response(data, { status, headers });
  }
};


describe('Vérification de la structure des pages HTML', () => {
  htmlFiles.forEach(file => {
    const fileName = path.basename(file);

    it(`la page ${fileName} devrait avoir un header et un footer après l'exécution du JS`, async () => {
      const fileUrl = `file://${file}`;
      const htmlContent = fs.readFileSync(file, 'utf-8');
      const dom = new JSDOM(htmlContent, {
        runScripts: "dangerously",
        resources: "usable",
        url: fileUrl
      });

      Object.defineProperty(dom.window, 'localStorage', { value: localStorageMock });
      dom.window.fetch = createCustomFetch(fileUrl);

      await new Promise(resolve => {
        dom.window.addEventListener('DOMContentLoaded', () => {
          setTimeout(resolve, 200); // Increased timeout just in case
        });
      });

      const header = dom.window.document.querySelector('header');
      const footer = dom.window.document.querySelector('footer');

      expect(header, `Header manquant dans ${fileName}`).not.toBeNull();
      expect(footer, `Footer manquant dans ${fileName}`).not.toBeNull();
    });
  });
});
