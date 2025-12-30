const client = require('../config/db');
const { ObjectId } = require('mongodb');

const db = client.db('eripo');
const usersCollection = db.collection('users');

const getUsers = async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

const createUser = async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const result = await usersCollection.insertOne({
      nombre,
      email,
      password,
      isAdmin: false
    });
    res.status(201).json({ _id: result.insertedId, nombre, email, password });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password } = req.body;
  try {
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          nombre,
          email,
          password
        }
      }
    );
    res.json({ message: 'Usuario actualizado', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await usersCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};