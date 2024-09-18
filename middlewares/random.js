const crypto = require('crypto');

function generateRandomSecretKey(length) {
  const randomBytes = crypto.randomBytes(length);
  const secretKey = randomBytes.toString('hex');
  return secretKey;
}

const secretKeyLength = 32; // Adjust the length as needed
const randomSecretKey = generateRandomSecretKey(secretKeyLength);
console.log(randomSecretKey);