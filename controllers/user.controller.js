const client = require('../config/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // <--- IMPORTANTE: Importamos esto directo

const db = client.db('eripo');
const usersCollection = db.collection('users');

const getUsers = async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error("Error en getUsers:", error); // Ver el error real
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
    console.error("Error en createUser:", error);
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
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.json({ message: 'Usuario actualizado', modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error en updateUser:", error);
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
    console.error("Error en deleteUser:", error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

// --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son requeridos' });
  }
  
  try {
    // 1. Buscar usuario
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    // 2. Comparar contraseña (Directamente con bcrypt, sin middleware externo)
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    // 3. Generar JWT (Directamente aquí)
    // Usamos process.env.JWT_SECRET. Si falla, usa 'secreto_temporal' para que no explote.
    const secretKey = process.env.JWT_SECRET || 'secreto_super_seguro'; 
    
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email,
        isAdmin: user.isAdmin 
      },
      secretKey,
      { expiresIn: '8h' } // El token dura 8 horas
    );
    
    // 4. Responder
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ 
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    // ESTO es lo que nos dirá la verdad si falla
    console.error(" ERROR REAL EN LOGIN:", error); 
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  loginUser
};