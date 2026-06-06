const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const extractBarberDetails = async (message) => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `
Extract barber details from text.

Return ONLY JSON:

{
  "name": "Raj",
  "specialty": "Fade cuts",
  "experience": "5 years"
}
`
        },
        {
          role: 'user',
          content: message
        }
      ]
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = { extractBarberDetails };