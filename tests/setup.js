import { vi } from 'vitest';

// Mocker le module StrapiApi pour qu'il utilise notre mock à la place de l'original.
// Le chemin vers le module original doit être relatif au fichier qui l'importe,
// mais ici on utilise un chemin absolu depuis la racine du projet pour plus de clarté.
vi.mock('../public/Core/StrapiApi.js', async () => {
  // Importer la classe de mock que nous avons créée.
  const MockStrapiApi = await import('./mocks/strapiApi.js');
  // Le mock doit retourner un objet avec `default` étant la classe mockée.
  return {
    default: MockStrapiApi.default
  };
});
