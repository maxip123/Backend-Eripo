const { getClient } = require('../config/db');
const { ObjectId } = require('mongodb');

const getEjercicios = async (req, res) => {
  try {
    const client = await getClient();
    const db = client.db('eripo');
    const ejerciciosCollection = db.collection('ejercicios');
    const ejercicios = await ejerciciosCollection.find({}).toArray();
    res.json(ejercicios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los ejercicios' });
  }
};

const createEjercicio = async (req, res) => {
  const { nombre, musculo, videoUrl, series, repeticiones, descanso } = req.body;
  
  if (!nombre || !musculo || !series || !repeticiones) {
    return res.status(400).json({ error: 'nombre, musculo, series y repeticiones son requeridos' });
  }
  
  try {
    const client = await getClient();
    const db = client.db('eripo');
    const ejerciciosCollection = db.collection('ejercicios');
    const result = await ejerciciosCollection.insertOne({
      nombre,
      musculo,
      videoUrl,
      series,
      repeticiones,
      descanso,
      rutinasIDs: []
    });
    res.status(201).json({ _id: result.insertedId, nombre, musculo, videoUrl, series, repeticiones, descanso });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el ejercicio' });
  }
};

const updateEjercicio = async (req, res) => {
  const { id } = req.params;
  const { nombre, musculo, videoUrl, series, repeticiones, descanso } = req.body;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de ejercicio inválido' });
  }
  
  try {
    const client = await getClient();
    const db = client.db('eripo');
    const ejerciciosCollection = db.collection('ejercicios');
    const result = await ejerciciosCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          nombre,
          musculo,
          videoUrl,
          series,
          repeticiones,
          descanso
        }
      }
    );
    res.json({ message: 'Ejercicio actualizado', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el ejercicio' });
  }
};

const deleteEjercicio = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await getClient();
    const db = client.db('eripo');
    const ejerciciosCollection = db.collection('ejercicios');
    await ejerciciosCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el ejercicio' });
  }
};

module.exports = {
  getEjercicios,
  createEjercicio,
  updateEjercicio,
  deleteEjercicio
};