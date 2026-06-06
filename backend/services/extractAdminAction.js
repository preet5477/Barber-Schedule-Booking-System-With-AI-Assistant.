const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const extractAdminAction = async (message) => {

  try {

    const completion =
      await groq.chat.completions.create({

        model: 'llama-3.3-70b-versatile',

        messages: [

          {
            role: 'system',
            content: `
Extract admin action from message.

Return ONLY JSON.

Examples:

{
  "action": "add_barber",
  "name": "Raj",
  "email": "raj@gmail.com",
  "phone": "9876543210"
}

{
  "action": "add_service",
  "name": "Hair Cut",
  "price": 100,
  "duration": 30
}
`
          },

          {
            role: 'user',
            content: message
          }

        ]

      });

    const text =
      completion.choices[0].message.content;

    return JSON.parse(text);

  } catch (error) {

    console.log(error);

    return null;

  }

};

module.exports = {
  extractAdminAction
};