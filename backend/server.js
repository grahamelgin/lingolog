const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

const db = require('./database/db');
const authRouter = require('./routes/auth');
const languagesRouter = require('./routes/languages');
const sessionsRouter = require('./routes/sessions');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'LingoLog API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      languages: '/api/languages',
      sessions: '/api/sessions'
    }
  });
});

app.use('/api/auth', authRouter);
app.use('/api/languages', languagesRouter);
app.use('/api/sessions', sessionsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});