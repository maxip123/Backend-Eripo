const express = require('express');
const router = express.Router();
const { getEjercicios, createEjercicio, updateEjercicio, deleteEjercicio } = require('../controllers/ejercicios.controller');

router.get('/', getEjercicios);
router.post('/', createEjercicio);
router.put('/:id', updateEjercicio);
router.delete('/:id', deleteEjercicio);

module.exports = router;