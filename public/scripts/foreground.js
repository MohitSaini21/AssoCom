// Listen for messages when the app is in the foreground
import { onMessage } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-messaging.js";

onMessage(messaging, (payload) => {
  console.log("Foreground message received:", payload);

  // Check if the payload has the expected properties
  if (payload && payload.notification) {
    const { title, body } = payload.notification;
    alert(`New message: ${title} - ${body}`);
  } else {
    alert("Message received, but no notification data found.");
  }
});
