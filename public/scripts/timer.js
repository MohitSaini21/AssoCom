const projects = JSON.parse("<%- JSON.stringify(projects) %>");

console.log("Parsed projects:", projects);

// Function to calculate and update the remaining time
function updateTimer(expirationTime, projectId) {
  const timerElement = document.getElementById(`timer-${projectId}`);
  const currentTime = new Date().getTime();
  const remainingTime = expirationTime - currentTime;

  if (remainingTime <= 0) {
    timerElement.innerHTML = "This project has expired.";
    // window.location="/worker/GetProjectPage"
    return;
  }

  const seconds = Math.floor((remainingTime / 1000) % 60);
  const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
  const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

  timerElement.innerHTML = `Expires in ${days}d ${hours}h ${minutes}m ${seconds}s`;

  // Update the timer every second
  setTimeout(() => updateTimer(expirationTime, projectId), 1000);
}

// Initialize the timers for all projects
projects.forEach((project) => {
  const expirationTime = new Date(project.expiresAt).getTime();
  updateTimer(expirationTime, project._id);
});
