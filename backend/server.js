// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookie = require('./routes/cookie');
const auth = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', cookie);
app.use('/api/auth', auth);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
