import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let clientSocket = null;

wss.on("connection", (ws) => {
  console.log("Client WebSocket connecté");
  clientSocket = ws;

  ws.on("close", () => {
    console.log("Client déconnecté");
    clientSocket = null;
  });
});

app.all("/auth/riot/callback", async (req, res) => {
  if (!clientSocket || clientSocket.readyState !== 1) {
    return res.status(503).send("Client non connecté");
  }

  // Préparer les données de la requête à transmettre
  const requestData = {
    method: req.method,
    path: req.originalUrl,
    headers: req.headers,
    body: await getRawBody(req),
  };

  // Envoyer la requête au client via WebSocket
  clientSocket.send(JSON.stringify(requestData));

  // Attendre la réponse
  const response = await new Promise((resolve) => {
    clientSocket.once("message", (data) => {
      resolve(JSON.parse(data));
    });
  });

  res.status(response.statusCode).set(response.headers).send(response.body);
});

// Utilitaire pour lire le corps brut
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const PORT = 3328;
server.listen(PORT, () => {
  console.log(`Serveur HTTP+WS en ligne sur port ${PORT}`);
});
