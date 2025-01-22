// public/js/firebase.js

// Import the Firebase SDK

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-analytics.js";
import {
  getMessaging,
  getToken,
  onMessage,
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

// Cookie utility functions
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
}

// Function to request notification permission and get FCM token
async function getFcmToken() {
  // Check if the "notifPermissionPageLoaded" cookie is set (indicating the page has been loaded previously)
  const isPermissionRequested = getCookie("notifPermissionPageLoaded");

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
          // Send token to the server
          sendTokenToServer(token);
        } else {
          console.error("No FCM token received.");
        }
      } else {
        console.log("Notification permission denied.");
      }

      // Mark the page as loaded by setting the "notifPermissionPageLoaded" cookie
      setCookie("notifPermissionPageLoaded", "true", 365); // Cookie expires in 1 year
    } catch (error) {
      console.error("Error fetching FCM token:", error);
    }
  } else {
    console.log(
      "Page has been loaded previously, no need to ask for permission again."
    );
  }
}

// Function to send FCM token to the server
async function sendTokenToServer(token) {
  try {
    // Send the token to the backend
    const response = await fetch("/CWS/api/save-fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }),
    });

    // Check if the response status is OK (i.e., 200-299)
    if (!response.ok) {
      // If the server returned an error status, throw an error
      const errorData = await response.json();
      throw new Error(`Server error: ${errorData.message || "Unknown error"}`);
    }

    // Parse the successful response
    const data = await response.json();
    console.log("Token saved successfully:", data);
  } catch (error) {
    // Handle both network and server errors
    console.error("Error sending token to server:", error.message || error);
  }
}

// Check if service workers are supported and then register
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(function (registration) {
      console.log("Service Worker registered with scope: ", registration.scope);
      getFcmToken();
    })
    .catch(function (err) {
      console.log("Service Worker registration failed: ", err);
    });
}
// onMessage(messaging, (payload) => {
//   console.log("Foreground message received:", payload);

//   // Check if the payload has the expected properties
//   if (payload && payload.notification) {
//     const { title, body } = payload.notification;
//     alert(`New message: ${title} - ${body}`);
//   } else {
//     alert("Message received, but no notification data found.");
//   }
// });
