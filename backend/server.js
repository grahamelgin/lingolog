const express = require('express');
const app = express();
const PORT = 3000;

const db = require('./database/db');
const languagesRouter = require('./routes/languages');
const sessionsRouter = require('./routes/sessions');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Language Learning Tracker API',
    version: '1.0.0',
    endpoints: {
      languages: '/api/languages',
      sessions: '/api/sessions'
    }
  });
});

app.use('/api/languages', languagesRouter);
app.use('/api/sessions', sessionsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});