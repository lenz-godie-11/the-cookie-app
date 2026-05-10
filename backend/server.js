const express = require('express');
const cors = require('cors');
const cookie = require('./routes/cookie');


const app = express();
app.use(cors());
app.use(express.json());


app.use('/api', cookie);

app.listen(5000, () => console.log('Backend running on port 5000'));
