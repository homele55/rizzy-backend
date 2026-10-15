const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use('/suggest', rateLimit({ windowMs: 60 * 1000, max: 10 }));

app.get('/', (req, res) => res.send('Rizzy server chal raha hai'));

app.post('/suggest', async (req, res) => {
  const chat = (req.body.chat || '').slice(-1500);

  // Key na ho to dummy replies bhejo (testing ke liye)
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ suggestions: ["reply 1", "reply 2", "reply 3"] });
  }

  const prompt =
    'Neeche ek chat screen ka text hai. Last message ka reply dene ke liye 3 short, ' +
    'natural reply suggestions do. Sirf JSON array do, jaise ["a","b","c"], aur kuch nahi.\n\n' + chat;

  try {
    const r = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
        process.env.GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, responseMimeType: 'application/json' }
        })
      }
    );
    const data = await r.json();
    const text = data.candidates[0].content.parts[0].text;
    res.json({ suggestions: JSON.parse(text) });
  } catch (e) {
    console.log('AI error:', e.message);
    res.json({ suggestions: ["AI error aaya", "Dobara try karo", "Key check karo"] });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log('Server chal raha hai: ' + PORT));