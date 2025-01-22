// Listen for messages when the app is in the foreground
import { onMessage } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-messaging.js";

onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  // Customize how you handle the notification
  showMessage(payload);
});
