// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const drugsRouter = require('./routes/drugs');
const configRouter = require('./routes/config');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/drugs', drugsRouter);
app.use('/api/config', configRouter);

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/drugstore';
console.log('MONGO_URI', MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Mongo DB Connected');
    app.listen(PORT, () => console.log(`Server Listening on ${PORT}`));
  })
  .catch((err) => console.log('Mongo DB error', err));
