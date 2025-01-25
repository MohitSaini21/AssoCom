// Function to show the information message (Blue color scheme)
function showMessage(message) {
  document.getElementById("custom-popup-123").style.display = "flex";
  document.getElementById("popup-content-123").className =
    "custom-popup-content-123 info-popup-123"; // Blue color scheme
  document.getElementById("popup-title").textContent = "Knock Knock";
  document.getElementById("popup-message").textContent = message;

  // Set a timer to close the popup after 5 seconds (5000 ms)
  setTimeout(function () {
    closeCustomPopup();
  }, 5000);
}

// Function to show the error message (Red color scheme)
function showError(message) {
  document.getElementById("custom-popup-123").style.display = "flex";
  document.getElementById("popup-content-123").className =
    "custom-popup-content-123 error-popup-123"; // Red color scheme
  document.getElementById("popup-title").textContent = "Error";
  document.getElementById("popup-message").textContent = message;

  // Set a timer to close the popup after 5 seconds (5000 ms)
  setTimeout(function () {
    closeCustomPopup();
  }, 5000);
}

// Close the popup with unique ID
function closeCustomPopup() {
  document.getElementById("custom-popup-123").style.display = "none";
}


  