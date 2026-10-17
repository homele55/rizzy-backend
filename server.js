require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.8-flash';

app.get('/', (req, res) => res.send('Rizzy backend chal raha hai'));

app.post('/suggest', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text nahi mila' });
    if (!API_KEY) return res.status(500).json({ error: 'API key set nahi hai' });

    const prompt =
      'Neeche ek chat ka last message hai. Uske liye 3 chhote, natural, ' +
      'friendly reply suggestions do, usi language (Hinglish) mein. ' +
      'Har reply alag line mein ho, bina numbering ke.\n\nMessage: ' + text;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await r.json();
    if (!r.ok) {
      console.error('Gemini error:', JSON.stringify(data));
      return res.status(500).json({ error: 'AI error', detail: data });
    }

    const out = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const suggestions = out.split('\n').map(s => s.trim()).filter(Boolean);
    res.json({ suggestions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server chal raha hai port', PORT));