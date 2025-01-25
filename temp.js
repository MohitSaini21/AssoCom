import { generateWorkerMessage } from "./utils/GenereteMesg.js";

// Example usage:
// Sample data
const worker = { userName: "Rohit" };
const client = { userName: "MohitSaini" };
const project = { assignment_title: "Web Development" };
const status = "rejected"; // This could be dynamic, like "rejected", etc.

console.log(generateWorkerMessage(worker, client, project, status));
