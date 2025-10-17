require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const cors = require('cors');
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const boardsRoutes = require('./routes/boards');
app.use('/boards', boardsRoutes);

const listsRoutes = require('./routes/lists');
app.use('/lists', listsRoutes);

const cardsRoutes = require('./routes/cards');
app.use('/cards', cardsRoutes);

const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

const labelsRoutes = require('./routes/labels');
app.use('/labels', labelsRoutes);

const commentsRoutes = require('./routes/comments');
app.use('/comments', commentsRoutes);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };