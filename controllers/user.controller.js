const client = require('../config/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const { comparePassword, generateToken } = require('../middleware/auth.middleware');

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
  
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'nombre, email y password son requeridos' });
  }
  
  try {
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya existe' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await usersCollection.insertOne({
      nombre,
      email,
      password: hashedPassword,
      isAdmin: false,
      rutinas: []
    });
    res.status(201).json({ _id: result.insertedId, nombre, email, isAdmin: false });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password } = req.body;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }
  
  try {
    const updateData = { nombre, email };
    
    // Si se proporciona contraseña, hashearla
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.json({ message: 'Usuario actualizado', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }
  
  try {
    await usersCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son requeridos' });
  }
  
  try {
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const passwordMatch = await comparePassword(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar JWT sin expiración
    const token = generateToken(user._id.toString(), user.email);
    
    // Devolver usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ 
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  loginUser
};