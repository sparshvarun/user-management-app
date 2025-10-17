const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./db');
const usersRouter = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/users', usersRouter);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

