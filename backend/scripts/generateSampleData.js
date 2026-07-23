// Generates a sample-logs.json file with 10,000 fake audit log records
// you can use to test the bulk upload endpoint / UI.
const fs = require("fs");
const path = require("path");

const actors = [
  "priya.nair@company.com",
  "arjun.mehta@company.com",
  "sara.khan@company.com",
  "liam.oconnor@company.com",
  "wei.zhang@company.com",
];
const roles = ["admin", "editor", "viewer", "auditor"];
const actions = [
  "DELETE_USER",
  "CREATE_USER",
  "UPDATE_ROLE",
  "LOGIN_FAILED",
  "EXPORT_DATA",
  "RESET_PASSWORD",
  "ACCESS_DENIED",
];
const resourceTypes = ["USER", "REPORT", "SETTINGS", "BILLING", "API_KEY"];
const regions = ["ap-south-1", "us-east-1", "eu-west-1", "ap-southeast-2"];
const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const statuses = ["Unresolved", "Investigating", "Resolved"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIp() {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function randomTimestamp() {
  const start = new Date("2025-01-01T00:00:00Z").getTime();
  const end = new Date("2025-12-31T23:59:59Z").getTime();
  return new Date(start + Math.random() * (end - start)).toISOString();
}

const COUNT = 10000;
const logs = [];

for (let i = 0; i < COUNT; i++) {
  const resourceType = randomItem(resourceTypes);
  logs.push({
    actor: randomItem(actors),
    role: randomItem(roles),
    action: randomItem(actions),
    resource: `/api/${resourceType.toLowerCase()}s/${Math.floor(Math.random() * 1000)}`,
    resourceType,
    ipAddress: randomIp(),
    region: randomItem(regions),
    severity: randomItem(severities),
    status: randomItem(statuses),
    timestamp: randomTimestamp(),
  });
}

const outPath = path.join(__dirname, "sample-logs.json");
fs.writeFileSync(outPath, JSON.stringify({ logs }, null, 2));
console.log(`Wrote ${COUNT} sample logs to ${outPath}`);
