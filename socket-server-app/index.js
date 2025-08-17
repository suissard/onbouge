const { Server } = require("socket.io");
const axios = require("axios");

const STRAPI_API_URL = "http://strapi:1337/api";

const io = new Server(3001, {
  cors: {
    origin: "*",
  },
});

console.log("🚀 Le serveur Socket.IO est en écoute sur le port 3001...");

// Middleware d'authentification
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: Token manquant"));
  }
  try {
    const response = await axios.get(`${STRAPI_API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    socket.user = response.data; // Attacher les infos de l'utilisateur au socket
    next();
  } catch (error) {
    console.error("Erreur d'authentification Socket:", error.message);
    return next(new Error("Authentication error: Token invalide"));
  }
});

const typingUsers = {};

io.on("connection", (socket) => {
  console.log(`✅ Un client vient de se connecter: ${socket.user.username} (ID: ${socket.id})`);

  socket.on("new_topic", async (data) => {
    console.log("Nouveau sujet reçu:", data.title);
    try {
      const response = await axios.get(`${STRAPI_API_URL}/forum?populate=deep`);
      const forumData = response.data.data;

      const newTopic = {
        __component: 'discussion.topic',
        title: data.title,
        messages: [],
        author: socket.user.username, // Ajout de l'auteur du sujet
      };

      const updatedTopics = [...(forumData.attributes.topics || []), newTopic];

      const updateResponse = await axios.put(`${STRAPI_API_URL}/forum`, {
        data: { topics: updatedTopics },
      });

      const createdTopic = updateResponse.data.data.attributes.topics.slice(-1)[0];

      console.log("Sujet créé dans Strapi:", createdTopic);
      io.emit("new_topic", createdTopic);

    } catch (error) {
      console.error("Erreur lors de la création du sujet:", error.response ? error.response.data : error.message);
      socket.emit("error_creating_topic", { message: "Impossible de créer le sujet." });
    }
  });

  socket.on("join_topic", (topicId) => {
    socket.join(topicId);
    console.log(`Client ${socket.user.username} a rejoint le sujet ${topicId}`);
    if (typingUsers[topicId]) {
      socket.emit("typing_users_update", Object.values(typingUsers[topicId]));
    }
  });

  socket.on("new_message", async ({ topicId, message }) => {
    console.log(`Nouveau message de ${socket.user.username} pour le sujet ${topicId}:`, message.text);
    try {
        const response = await axios.get(`${STRAPI_API_URL}/forum?populate=deep`);
        const forumData = response.data.data;
        const topics = forumData.attributes.topics;

        const topicIndex = topics.findIndex(t => t.id == topicId);
        if (topicIndex === -1) {
            return socket.emit("error_creating_message", { message: "Sujet non trouvé." });
        }

        const newMessage = {
            __component: 'discussion.message',
            author: socket.user.username,
            text: message.text,
            date: new Date().toISOString(),
        };

        topics[topicIndex].messages.push(newMessage);

        await axios.put(`${STRAPI_API_URL}/forum`, {
            data: { topics: topics },
        });

        console.log("Message ajouté pour le sujet:", topicId);
        io.to(topicId).emit("new_message", { ...newMessage, topicId: topicId });

    } catch (error) {
        console.error("Erreur lors de la création du message:", error.response ? error.response.data.error : error.message);
        socket.emit("error_creating_message", { message: "Impossible d'envoyer le message." });
    }
  });

  socket.on("typing", ({ topicId }) => {
    if (!typingUsers[topicId]) {
      typingUsers[topicId] = {};
    }
    typingUsers[topicId][socket.user.id] = socket.user.username;
    io.to(topicId).emit("typing_users_update", Object.values(typingUsers[topicId]));
  });

  socket.on("stop_typing", ({ topicId }) => {
    if (typingUsers[topicId]) {
      delete typingUsers[topicId][socket.user.id];
      if (Object.keys(typingUsers[topicId]).length === 0) {
        delete typingUsers[topicId];
      }
    }
    io.to(topicId).emit("typing_users_update", typingUsers[topicId] ? Object.values(typingUsers[topicId]) : []);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client déconnecté: ${socket.user.username} (ID: ${socket.id})`);
    for (const topicId in typingUsers) {
      if (typingUsers[topicId][socket.user.id]) {
        delete typingUsers[topicId][socket.user.id];
        io.to(topicId).emit("typing_users_update", Object.values(typingUsers[topicId]));
      }
    }
  });
});
