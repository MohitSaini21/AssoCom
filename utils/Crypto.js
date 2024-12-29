import crypto from "crypto";

// Configuration
const algorithm = "aes-256-cbc"; // Symmetric encryption algorithm
const key = crypto.randomBytes(32); // 256-bit key (Save securely in a real app)
const iv = crypto.randomBytes(16); // 128-bit IV (Save securely in a real app)

// Function to encrypt data
export const encrypt = (data) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// Function to decrypt data
export const decryptData = (encryptedData) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
