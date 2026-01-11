const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, loginUser } = require('../controllers/user.controller');

router.get('/', getUsers);
router.post('/register', createUser);
router.post('/login', loginUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;