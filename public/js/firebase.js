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
  // Check if permission has already been asked (in localStorage)
  const isPermissionRequested = localStorage.getItem("permissionRequested");

  if (!isPermissionRequested) {
    try {
      // Request permission to send notifications
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        // Get FCM Token if permission is granted
        const token = await getToken(messaging, {
          vapidKey:
            "BEfELZh-xCNBDhw1Qn7bdthyhgARsG8WPz88H0X9_IW7K4VqlAJHo8oZ_rTCTwFaeI35tXuE1ZkyDxH7FQRncVc",
        });

        if (token) {
          console.log("FCM Token:", token);
          // Optionally, send the token to your server
          // sendTokenToServer(token);
        } else {
          console.error("No FCM token received.");
        }
      } else {
        console.log("Notification permission denied.");
      }

      // Mark the permission as requested in localStorage to prevent asking again
      localStorage.setItem("permissionRequested", "true");
    } catch (error) {
      console.error("Error fetching FCM token:", error);
    }
  } else {
    console.log("Permission already requested previously. Not asking again.");
  }
}

// Function to send FCM token to the server
// Uncomment and modify this if you're sending the token to your server
/*
async function sendTokenToServer(token) {
  try {
    // Send the token to the backend
    const response = await fetch("/api/save-fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }),
    });
    const data = await response.json();
    console.log("Token saved:", data);
  } catch (error) {
    console.error("Error sending token to server:", error);
  }
}
*/

// Check if service workers are supported and then register
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(function (registration) {
      console.log("Service Worker registered with scope: ", registration.scope);
    })
    .catch(function (err) {
      console.log("Service Worker registration failed: ", err);
    });
}

// Call the function to get FCM token
getFcmToken();

// Optional: Listen for messages when the app is in the foreground
onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  // Customize how you handle the notification
});
