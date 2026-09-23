const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Backend P2P Solidarietà attivo!');
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
