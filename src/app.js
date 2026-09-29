const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ message: 'AI BlogNest API is running' });
});

app.use(errorMiddleware);

module.exports = app;
