const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware para comparar contraseñas
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

// Generar JWT sin expiración
const generateToken = (userId, email) => {
  try {
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: undefined } // Sin expiración
    );
    return token;
  } catch (error) {
    throw new Error('Error al generar token');
  }
};

// Middleware para validar token JWT
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = {
  comparePassword,
  generateToken,
  verifyToken
};
