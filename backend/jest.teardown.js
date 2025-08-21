

const mongoose = require('mongoose');

module.exports = async () => {
  try {
    // Cerrar todas las conexiones de MongoDB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Cerrar todas las conexiones adicionales
    const connections = mongoose.connections;
    for (let connection of connections) {
      if (connection.readyState !== 0) {
        await connection.close();
      }
    }
    
    console.log('MongoDB connections closed successfully');
  } catch (error) {
    console.error('Error closing MongoDB connections:', error);
  }
};
