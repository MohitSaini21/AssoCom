export const filterBody = (req, res, next) => {
  // Define the list of offensive words manually (add more as needed)
  const offensiveWords = [
    "chut",
    "gandu",
    "lund",
    "bhenchod", // Add more words as needed
    "gf",
    "bf",
    "Randi",
    "lawde",
    "chod",
    "Gaand",
  ];

  // Get all values from req.body (assuming it contains form data, JSON, etc.)
  const values = Object.values(req.body); // Extract values from the object

  // Join the values into a single string, separated by spaces
  const concatenatedString = values.join(" ");

  console.log("Concatenated string of values:", concatenatedString);

  // Function to detect offensive words
  function detectOffensiveWords(input) {
    const detectedWords = [];

    // Loop through each offensive word and check if it's in the input
    offensiveWords.forEach((word) => {
      // Check if the word is in the string, case insensitive
      if (input.toLowerCase().includes(word.toLowerCase())) {
        detectedWords.push(word); // Add the word to detected list
      }
    });

    return detectedWords;
  }

  // Detect offensive words in the user input
  const detectedWords = detectOffensiveWords(concatenatedString);

  // If there are offensive words, send the error response
  if (detectedWords.length > 0) {
    const message = `⚠️ Warning! You have used inappropriate language such as "${detectedWords.join(
      ", "
    )}". 
    If you continue to use offensive language, we will take strict actions including restricting your access or even deleting your account. 
    We take this matter VERY seriously🚫`;

    return res.status(400).json({
      errors: [message],
    });
  } else {
    // If no offensive words are detected, continue to the next middleware
    next();
  }
};
