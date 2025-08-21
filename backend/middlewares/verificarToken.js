const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  const token = authHeader.substring(7); // Quitar "Bearer " del token

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
    req.usuario = verificado;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
};
