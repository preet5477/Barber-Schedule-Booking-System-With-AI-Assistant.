const Groq = require('groq-sdk');

let groq = null;

const getGroqClient = () => {
  if (groq) {
    return groq;
  }

  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  return groq;
};

module.exports = {
  getGroqClient
};
