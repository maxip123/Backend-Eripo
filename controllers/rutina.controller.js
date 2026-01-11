const client = require('../config/db');
const { ObjectId } = require('mongodb');

const db = client.db('eripo');
const rutinasCollection = db.collection('rutinas');

const getRutinas = async (req, res) => {
  try {
    const rutinas = await rutinasCollection.find({}).toArray();
    res.json(rutinas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las rutinas' });
  }
};

const createRutina = async (req, res) => {
  const { nombre, descripcion, usuarioId, ejerciciosIDs } = req.body;
  
  if (!nombre || !usuarioId) {
    return res.status(400).json({ error: 'nombre y usuarioId son requeridos' });
  }
  
  if (!ObjectId.isValid(usuarioId)) {
    return res.status(400).json({ error: 'usuarioId inválido' });
  }
  
  try {
    const usersCollection = client.db('eripo').collection('users');
    const userExists = await usersCollection.findOne({ _id: new ObjectId(usuarioId) });
    
    if (!userExists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const result = await rutinasCollection.insertOne({
      nombre,
      descripcion,
      usuarioId: new ObjectId(usuarioId),
      ejerciciosIDs: ejerciciosIDs ? ejerciciosIDs.map(id => new ObjectId(id)) : [],
      createdAt: new Date()
    });
    
    // Agregar rutina al array de rutinas del usuario
    await usersCollection.updateOne(
      { _id: new ObjectId(usuarioId) },
      { $push: { rutinas: result.insertedId } }
    );
    
    res.status(201).json({ _id: result.insertedId, nombre, descripcion, usuarioId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la rutina' });
  }
};

const updateRutina = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, usuarioId, ejerciciosIDs } = req.body;
  try {
    const result = await rutinasCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          nombre,
          descripcion,
          usuarioId: new ObjectId(usuarioId),
          ejerciciosIDs: ejerciciosIDs ? ejerciciosIDs.map(eid => new ObjectId(eid)) : []
        }
      }
    );
    res.json({ message: 'Rutina actualizada', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la rutina' });
  }
};

const deleteRutina = async (req, res) => {
  const { id } = req.params;
  try {
    await rutinasCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la rutina' });
  }
};

module.exports = {
  getRutinas,
  createRutina,
  updateRutina,
  deleteRutina
};