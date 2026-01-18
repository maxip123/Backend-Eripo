const client = require('../config/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = client.db('eripo');
const usersCollection = db.collection('users');

const getUsers = async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error("Error en getUsers:", error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

const createUser = async (req, res) => {

  const { nombre, email, password, phone, age, plan, notes, status } = req.body;
  
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
      phone: phone || '', // Si no viene, guardamos vacío
      age: age || '',
      plan: plan || 'Salud General',
      notes: notes || '',
      status: status || 'Activo',
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
  // Datos extras para actualizar
  const { nombre, email, password, phone, age, plan, notes, status } = req.body;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }
  
  try {
    //  Construimos el objeto de actualización dinámicamente
    const updateData = { 
        nombre, 
        email,
        phone,
        age,
        plan,
        notes,
        status 
    };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // Limpiamos propiedades undefined (por si acaso no enviaron algún campo)
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

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

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son requeridos' });
  }
  
  try {
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    const secretKey = process.env.JWT_SECRET || 'secreto_super_seguro'; 
    
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email,
        isAdmin: user.isAdmin 
      },
      secretKey,
      { expiresIn: '8h' }
    );
    
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ 
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
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