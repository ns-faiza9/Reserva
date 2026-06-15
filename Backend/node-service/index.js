require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const resourceRoutes = require('./routes/resources');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/reservaDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/resources', resourceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Node.js Backend running on port ${PORT}`));
