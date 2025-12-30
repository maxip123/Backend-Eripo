const express = require('express');
const router = express.Router();
const { getRutinas, createRutina, updateRutina, deleteRutina } = require('../controllers/rutina.controller');

router.get('/', getRutinas);
router.post('/', createRutina);
router.put('/:id', updateRutina);
router.delete('/:id', deleteRutina);

module.exports = router;