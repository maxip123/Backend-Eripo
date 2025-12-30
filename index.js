require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const RouterUser = require('./routes/user.routes');
const RouterRutina = require('./routes/rutina.routes');
const RouterEjercicios = require('./routes/ejercicios.routes');
const db = require('./config/db');
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
// Routes
app.use('/api/users', RouterUser);
app.use('/api/rutinas', RouterRutina);
app.use('/api/ejercicios', RouterEjercicios);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
}); 