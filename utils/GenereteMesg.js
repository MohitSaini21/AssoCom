// Array 1: Fun adjectives for the bid
const array1 = [
  "exciting",
  "fantastic",
  "awesome",
  "incredible",
  "amazing",
  "special",
  "impressive",
  "cool",
];

// Array 2: Different verbs to describe the worker's bid/offer
const array2 = [
  "has made",
  "just pitched",
  "has thrown out",
  "has dropped",
  "just sent",
  "has offered",
  "has proposed",
];

// Array 3: Fun terms related to offers or bids
const array3 = [
  "a proposal",
  "an offer",
  "a deal",
  "something amazing",
  "an opportunity",
  "a suggestion",
  "a cool deal",
];

// Array 4: Call-to-action phrases to make the message engaging
const array4 = [
  "Check it out!",
  "Go see it!",
  "Take a look now!",
  "You should take a peek!",
  "Don’t miss out!",
  "Have a look at it!",
  "Take a glance when you get a chance!",
];

// Array 5: Emojis to make the message more engaging
const array5 = ["✨", "🔥", "🎉", "💥", "😉", "😎", "💫"];

// Function to get a random index from an array
function getRandomIndex(array) {
  return Math.floor(Math.random() * array.length);
}

// Function to generate a fresh and unique message for the client
export const generateUniqueMessage = (payload) => {
  // Select random elements from each array
  const adjective = array1[getRandomIndex(array1)];
  const action = array2[getRandomIndex(array2)];
  const term = array3[getRandomIndex(array3)];
  const callToAction = array4[getRandomIndex(array4)];
  const emoji = array5[getRandomIndex(array5)];

  // Get current date and time
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString(); // You can customize the date format if needed

  // Construct the message with both worker's and client's names, plus the project title and current date/time
  const message = `${emoji} Hey ${payload.client}, ${payload.worker} ${action} ${adjective} ${term} for "${payload.assignment_title}"... ${callToAction};`;

  // Return the generated message
  return message;
};

// Array 1: Fun adjectives for project status (celebration for accepted)
const array1Accepted = [
  "awesome",
  "fantastic",
  "amazing",
  "incredible",
  "outstanding",
  "remarkable",
  "brilliant",
  "extraordinary",
];

// Array 2: Verbs related to offer status (accepted)
const array2Accepted = [
  "has been accepted",
  "has been confirmed",
  "has been approved",
  "has been given the green light",
  "is now yours",
  "has been finalized",
  "has been secured",
];

// Array 3: Call-to-action phrases for celebration
const array3Accepted = [
  "Time to celebrate! 🎉",
  "Get ready for success! 💥",
  "You're on fire! 🔥",
  "Big congratulations! 🎊",
  "Let’s make it happen! 🌟",
];

// Array 4: Emojis for celebration
const array4Accepted = ["🎉", "🔥", "💥", "✨", "🎊", "💫"];

// Array 1: Fun adjectives for rejection (supportive message)
const array1Rejected = [
  "challenging",
  "tough",
  "a bit difficult",
  "a learning experience",
  "a tough break",
  "a setback",
  "a challenge",
  "a stepping stone",
];

// Array 2: Verbs related to offer rejection
const array2Rejected = [
  "has been declined",
  "has not been accepted",
  "has been turned down",
  "wasn't the right fit",
  "has been rejected",
  "wasn't selected",
];

// Array 3: Call-to-action phrases for rejection (supportive tone)
const array3Rejected = [
  "Don’t worry, you’ll get the next one! 💪",
  "Keep going, success is around the corner! 🌟",
  "Every step is progress, keep it up! 🚀",
  "Better luck next time, stay motivated! 💫",
  "Keep pushing forward, you’re almost there! ✨",
];

const array4Rejected = [
  "💪",
  "🌟",
  "🚀",
  "✨",
  "💫",
  "🙂",
  "😔",
  "😞",
  "😢",
  "😿",
  "😓",
  "🥺",
  "😭",
  "😩",
  "😖",
  "😣",
  "😤",
  "🤧",
  "😬",
  "😫",
  "🥲",
  "😵",
  "😷",
  "🤕",
  "🫣",
];

// Function to generate a message for the worker based on the offer status
export const generateWorkerMessage = (worker, client, project, status) => {
  // Get the current date and time
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString(); // You can customize the format if needed

  let message = "";

  // If the status is accepted, create a celebratory message
  if (status === "accepted") {
    const adjective = array1Accepted[getRandomIndex(array1Accepted)];
    const verb = array2Accepted[getRandomIndex(array2Accepted)];
    const callToAction = array3Accepted[getRandomIndex(array3Accepted)];
    const emoji = array4Accepted[getRandomIndex(array4Accepted)];

    // Construct the celebratory message for the worker
    message = `${emoji} Congratulations ${worker.userName}, your offer for the project "${project.assignment_title}" ${verb} by ${client.userName}. ${callToAction} You're encouraged to stay active on social media, as the client may reach out to you anytime! 🌟`;
  }

  // If the status is rejected, create a supportive rejection message
  if (status === "rejected") {
    const adjective = array1Rejected[getRandomIndex(array1Rejected)];
    const verb = array2Rejected[getRandomIndex(array2Rejected)];
    const callToAction = array3Rejected[getRandomIndex(array3Rejected)];
    const emoji = array4Rejected[getRandomIndex(array4Rejected)];

    // Construct the supportive rejection message for the worker
    message = `${emoji} Hey ${worker.userName}, unfortunately, your offer for the project "${project.assignment_title}" ${verb} by ${client.userName}. ${callToAction} Don't give up! You can always bid again at a price the client finds suitable. You’ve got this! 💪`;
  }

  // Return the generated message
  return message;
};
