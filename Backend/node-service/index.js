require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const resourceRoutes = require('./routes/resources');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.set('bufferCommands', false);
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reservaDB', {
  serverSelectionTimeoutMS: 3000
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'fallback'
  });
});

app.use('/api/resources', resourceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Node.js Backend running on port ${PORT}`));
