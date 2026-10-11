const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('Rizzy server chal raha hai'));

app.post('/suggest', async (req, res) => {
  const chat = (req.body.chat || '').slice(-1500);
  console.log('Chat mila:', chat);
  res.json({ suggestions: ["reply 1", "reply 2", "reply 3"] });
});

app.listen(3000, '0.0.0.0', () => console.log('Server chal raha hai: port 3000'));