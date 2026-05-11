const express = require('express');
const cors = require('cors');
const cookie = require('./routes/cookie');
const auth = require('./routes/auth'); 

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', cookie);
app.use('/api/auth', auth);

app.listen(5000, () => console.log('Backend running on port 5000'));
