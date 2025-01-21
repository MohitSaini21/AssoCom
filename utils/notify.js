import admin from "firebase-admin";
import serviceAccount from "../mywebapp-d7222-firebase-adminsdk-fbsvc-f23ae68714.json" assert { type: "json" };

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to send notification to client
export function sendNotificationToClient(clientToken, message) {
  const messagePayload = {
    notification: {
      title: "You Got a New Offer",
      body: message,
    },
    token: clientToken, // The token you stored in the database
  };

  admin
    .messaging()
    .send(messagePayload)
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}

// Function to send notification to worker
export function sendNotificationToWorker(workerToken, message) {
  const messagePayload = {
    notification: {
      title: "Offer Status Update",
      body: message,
    },
    token: workerToken, // The token you stored in the database
  };

  admin
    .messaging()
    .send(messagePayload)
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}
