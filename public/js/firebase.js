// public/js/firebase.js

// Import the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-analytics.js";
import {
  getMessaging,
  getToken,
} from "https://www.gstatic.com/firebasejs/9.0.2/firebase-messaging.js";

// Firebase config (your configuration keys)
const firebaseConfig = {
  apiKey: "AIzaSyDfyHneVzjGlqXkrwomNsHTVUx5hTJ4kaw",
  authDomain: "mywebapp-d7222.firebaseapp.com",
  projectId: "mywebapp-d7222",
  storageBucket: "mywebapp-d7222.firebasestorage.app",
  messagingSenderId: "37563411529",
  appId: "1:37563411529:web:6c3209e5613ad72603a398",
  measurementId: "G-TTGWTY9B2J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Messaging
const messaging = getMessaging(app);

// Function to request notification permission and get FCM token
async function getFcmToken() {
  try {
    // Request permission to send notifications
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Get FCM Token
      const token = await getToken(messaging, {
        vapidKey:
          "BEfELZh-xCNBDhw1Qn7bdthyhgARsG8WPz88H0X9_IW7K4VqlAJHo8oZ_rTCTwFaeI35tXuE1ZkyDxH7FQRncVc",
      });

      if (token) {
        console.log("FCM Token:", token);
        sendTokenToServer(token); // Send the token to your server
      } else {
        console.error("No FCM token received.");
      }
    } else {
      console.log("Notification permission denied.");
    }
  } catch (error) {
    console.error("Error fetching FCM token:", error);
  }
}

// Function to send FCM token to the server
// async function sendTokenToServer(token) {
//   try {
//     // Send the token to the backend
//     const response = await fetch("/api/save-fcm-token", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ token: token }),
//     });
//     const data = await response.json();
//     console.log("Token saved:", data);
//   } catch (error) {
//     console.error("Error sending token to server:", error);
//   }
// }
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered:", registration);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

// Call the function to get FCM token
getFcmToken();
