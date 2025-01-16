// // Function to display the error popup
// function showErrorPopup(message) {
//   errorMessage.textContent = message; // Set the error message
//   errorPopup.style.display = "block"; // Show the error popup
//   overlay.style.display = "block"; // Show the overlay
// }

// // Function to close the error popup
// function closePopup() {
//   errorPopup.style.display = "none"; // Hide the error popup
//   overlay.style.display = "none"; // Hide the overlay
// }
// // custom - logoutBtn - unique;
// // Get modal and button elements using unique IDs
// var modal = document.getElementById("custom-logoutModal");
// var logoutBtn = document.getElementById("logout123");
// var closeBtn = document.getElementsByClassName("custom-close")[0];
// var confirmLogout = document.getElementById("custom-confirmLogout-unique");
// var cancelLogout = document.getElementById("custom-cancelLogout-unique");

// // When the user clicks the logout button, show the modal
// logoutBtn.onclick = function () {
//   modal.style.display = "block";
// };

// function customFunction() {
//   modal.style.display = "block";
// }

// // When the user clicks on <span> (x), close the modal
// closeBtn.onclick = function () {
//   modal.style.display = "none";
// };

// // When the user clicks "Yes" to confirm logout
// confirmLogout.onclick = function () {
//   modal.style.display = "none";
//   window.location.href = "/CWS/logout";
// };

// // When the user clicks "No" to cancel logout
// cancelLogout.onclick = function () {
//   modal.style.display = "none";
// };

// // Close the modal if the user clicks anywhere outside the modal
// window.onclick = function (event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// };
