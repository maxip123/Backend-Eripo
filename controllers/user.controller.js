const client = require('../config/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const db = client.db('eripo');
const usersCollection = db.collection('users');

// --- 1. Obtener Usuarios ---
const getUsers = async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error("Error en getUsers:", error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// --- 2. Crear Usuario ---
const createUser = async (req, res) => {
  const { nombre, email, password, phone, age, plan, notes, status } = req.body;
  
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  
  try {
    const existing = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await usersCollection.insertOne({
      nombre,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      age: age || '',
      plan: plan || 'Salud General',
      notes: notes || '',
      status: status || 'Activo',
      isAdmin: false,
      rutinas: []
    });

    res.status(201).json({ _id: result.insertedId, nombre, email });
  } catch (error) {
    console.error("Error en createUser:", error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// --- 3. Actualizar Usuario ---
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, phone, age, plan, notes, status } = req.body;
  
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido' });
  
  try {
    const updateData = { nombre, email, phone, age, plan, notes, status };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.json({ message: 'Usuario actualizado', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

// --- 4. Eliminar Usuario ---
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido' });
  try {
    await usersCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
};

// --- 5. Login (LIMPIO Y FUNCIONAL) ---
const loginUser = async (req, res) => {
  const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Credenciales requeridas' });
  }
  
  try {
    const user = await usersCollection.findOne({ email });
    
    // Validamos usuario y contraseña
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // Generar Token
    const secretKey = process.env.JWT_SECRET || 'secreto_super_seguro'; 
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, isAdmin: user.isAdmin },
      secretKey,
      { expiresIn: '8h' }
    );
    
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: 'Login exitoso', token, user: userWithoutPassword });

  } catch (error) {
    console.error("Error Login:", error); 
    res.status(500).json({ error: 'Error interno' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  loginUser
};