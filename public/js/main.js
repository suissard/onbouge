var api;

/**
 * Récupère la valeur d'un paramètre dans l'URL.
 * @param {string} name - Le nom du paramètre à récupérer.
 * @returns {string|null} - La valeur du paramètre ou null s'il n'est pas trouvé.
 */
function getURLParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Charge un script dynamiquement et retourne une promesse
 * qui se résout quand le script est chargé.
 * @param {string} url - L'URL du script à charger.
 * @returns {Promise<void>}
 */
function loadScript(url) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = url;
		script.async = true;

		script.onload = () => {
			console.log(`Script ${url} chargé avec succès.`);
			resolve();
		};

		script.onerror = () => {
			console.error(`Erreur de chargement du script ${url}.`);
			reject(new Error(`Impossible de charger le script : ${url}`));
		};

		document.head.appendChild(script);
	});
}


// On utilise une IIFE (Immediately Invoked Function Expression)
// pour exécuter notre code asynchrone immédiatement.
(async () => {
  try {
    console.log("🚀 Lancement du chargement de StrapiApi.js...");
    // Cette ligne s'exécute dès que main.js est lu par le navigateur.
    // await loadScript('./Core/StrapiApi.js');
    await loadScript('./Core/FakeStrapiApi.js');
    
    // À ce stade, la classe StrapiApi est définie. On peut l'instancier.
    api = new StrapiApi();
    console.log("✅ API initialisée avec succès (avant DOMContentLoaded).");

  } catch (error) {
    console.error("❌ Erreur critique lors de l'initialisation de l'API :", error);
  }
})();


// async function initializeApi() {
// 	try {
// 		await loadScript("./Core/StrapiApi.js");

// 		console.log("Code de StrapiApi.js chargé avec succès.");

// 		api = new StrapiApi();
// 	} catch (error) {
// 		console.error("Erreur lors de l'initialisation de l'API :", error);
// 	}
// }


async function initializeSidebar() {
	try {
		// --- ÉTAPE 1: Charger le template du panneau latéral ---
		const sidebarResponse = await fetch("/partials/sidebar.html");
		if (!sidebarResponse.ok) throw new Error("sidebar.html introuvable");
		const sidebarTemplate = await sidebarResponse.text();

		// Injecte la structure vide du panneau dans la page
		document.body.insertAdjacentHTML("afterbegin", sidebarTemplate);

		// --- ÉTAPE 2: Générer les liens et les insérer ---
		const menuData = await fetch("/data/menu.json").then(
			async (response) => await response.json()
		);

		// Cible le conteneur des liens qui est maintenant dans la page
		const linksContainer = document.getElementById("menu-links-container");
		if (!linksContainer) {
			console.error("#menu-links-container n'a pas été trouvé dans sidebar.html");
			return;
		}

		// Génère le HTML pour chaque lien
		const menuLinksHTML = menuData
			.map(
				(item) => `
            <li>
                <a href="${item.link}">
                    <i class="${item.icon}"></i>
                    <span>${item.name}</span>
                </a>
            </li>
        `
			)
			.join("");

		// Remplit le conteneur avec les liens
		linksContainer.innerHTML = menuLinksHTML;

		// --- ÉTAPE 3: Activer les boutons (comme avant) ---
		const sidebar = document.getElementById("lateral-menu");
		const overlay = document.getElementById("sidebar-overlay");
		const openBtn = document.getElementById("open-menu-btn");
		const closeBtn = document.getElementById("close-menu-btn");

		const openMenu = () => {
			sidebar.classList.add("is-open");
			overlay.classList.add("is-open");
		};

		const closeMenu = () => {
			sidebar.classList.remove("is-open");
			overlay.classList.remove("is-open");
		};

		if (openBtn) openBtn.addEventListener("click", openMenu);
		if (closeBtn) closeBtn.addEventListener("click", closeMenu);
		if (overlay) overlay.addEventListener("click", closeMenu);
	} catch (error) {
		console.error("Erreur lors de l'initialisation du menu :", error);
	}
}

function initializeHeader() {
	fetch("/partials/header.html") // Chemin vers votre fichier menu
		.then((response) => response.text())
		.then((data) => {
			document.body.insertAdjacentHTML("afterbegin", data);
		})
		.catch(console.error);
}

function initializeFooter() {
	fetch("/partials/footer.html")
		.then((res) => res.text())
		.then((data) => document.body.insertAdjacentHTML("beforeend", data))
		.catch(console.error);
}

function initializeNotifications() {
	fetch("/partials/notifications.html")
		.then((res) => res.text())
		.then((data) => document.body.insertAdjacentHTML("beforeend", data))
		.catch(console.error);

	/**
	 * Helper pour gérer un timer qui peut être mis en pause et repris.
	 * @param {function} callback - La fonction à appeler à la fin du timer.
	 * @param {number} delay - La durée totale en millisecondes.
	 */
	function Timer(callback, delay) {
		let timerId,
			start,
			remaining = delay;

		this.pause = function () {
			window.clearTimeout(timerId);
			timerId = null;
			remaining -= Date.now() - start;
		};

		this.resume = function () {
			if (timerId) return;
			start = Date.now();
			timerId = window.setTimeout(callback, remaining);
		};

		this.resume(); // Démarre le timer à l'initialisation
	}

	/**
	 * @description Fonction racine pour créer une notification avec toutes les options.
	 * @param {object} options - Options de la notification.
	 * @param {string} options.title - Le titre de la notification.
	 * @param {string} options.description - La description complète.
	 * @param {string} [options.type='info'] - Type (success, error, warning, info).
	 * @param {string} [options.icon] - Emoji ou classe d'icône.
	 * @param {string} [options.color] - Couleur de la bordure gauche (format CSS).
	 * @param {number} [options.duration=5000] - Durée en ms avant fermeture auto (0 pour désactiver).
	 */
	window.createNotification = function ({
		title,
		description,
		type = "info",
		icon,
		color,
		duration = 5000,
	}) {
		const notif = document.createElement("div");
		notif.className = "notification";
		notif.dataset.type = type;

		// Ajout du contenu HTML, incluant la barre de progression
		notif.innerHTML = `
                    <div class="notification-header">
                        <span class="notification-icon">${icon || ""}</span>
                        <strong class="notification-title">${title}</strong>
                        <button class="notification-close">&times;</button>
                    </div>
                    <div class="notification-description">
                        ${description}
                    </div>
                    ${duration > 0 ? '<div class="notification-progress-bar"></div>' : ""}
                `;

		// Application des styles personnalisés
		if (color) {
			notif.style.borderLeftColor = color;
			const progressBar = notif.querySelector(".notification-progress-bar");
			if (progressBar) {
				progressBar.style.backgroundColor = color;
			}
		}
		const notifContainer = document.getElementById("notification-container");

		notifContainer.appendChild(notif);

		const header = notif.querySelector(".notification-header");
		const closeButton = notif.querySelector(".notification-close");
		let timer = null;

		// --- Gestion du timer et de la barre de progression ---
		if (duration > 0) {
			const progressBar = notif.querySelector(".notification-progress-bar");
			progressBar.style.animationDuration = `${duration}ms`;

			// Crée un timer qui gère la suppression de l'élément
			timer = new Timer(() => notif.remove(), duration);

			// Pause au survol
			notif.addEventListener("mouseenter", () => timer.pause());

			// Reprise à la sortie du survol (sauf si déplié)
			notif.addEventListener("mouseleave", () => {
				if (!notif.classList.contains("expanded")) {
					timer.resume();
				}
			});
		}

		// --- Gestion des événements ---

		// Déplier / Replier au clic sur le header
		header.addEventListener("click", () => {
			notif.classList.toggle("expanded");
			if (timer) {
				// Si on déplie, on met en pause
				if (notif.classList.contains("expanded")) {
					timer.pause();
				} else {
					// Si on replie, on reprend (sauf si la souris est toujours dessus)
					if (!notif.matches(":hover")) {
						timer.resume();
					}
				}
			}
		});

		// Fermer au clic sur la croix
		closeButton.addEventListener("click", (e) => {
			e.stopPropagation(); // Empêche le dépliage lors du clic
			notif.remove();
		});
	};

	/**
	 * @description Fonction de base pour afficher les 4 types de notifications standards.
	 * @param {string} type - 'success', 'error', 'warning', ou 'info'.
	 * @param {string} title - Le titre de la notification.
	 * @param {string} description - La description complète.
	 */
	window.showNotification = function (type, title, description) {
		const presets = {
			success: { icon: "✅" },
			error: { icon: "❌" },
			warning: { icon: "⚠️" },
			info: { icon: "ℹ️" },
		};
		createNotification({
			type,
			title,
			description,
			icon: presets[type]?.icon || "ℹ️",
		});
	};

	// --- Notification de bienvenue ---
	// showNotification('info', 'Bienvenue !', 'Survolez ou cliquez sur une notification pour mettre le timer en pause.');
}

document.addEventListener("DOMContentLoaded", function () {
	// Fonction pour créer le HTML du panneau à partir des données
	// Dans votre fichier js/main.js

	// initializeApi(); // This function is not defined and the API is already initialized in the IIFE above
	initializeHeader();
	initializeFooter();
	initializeNotifications();
	initializeSidebar();
	document.body.classList.add("is-ready");

	// Le code pour le footer peut rester ici si vous le souhaitez
});
