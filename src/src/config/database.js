const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'eddy_style',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Schema del database
const schema = `
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  client VARCHAR(255) NOT NULL,
  stylist_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stylists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Funzione per inizializzare il database
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.query(schema);
    connection.release();
    console.log('Database inizializzato con successo');
  } catch (error) {
    console.error('Errore durante l\'inizializzazione del database:', error);
  }
}

// Funzioni per gestire gli appuntamenti
const appointmentQueries = {
  // Ottieni tutti gli appuntamenti in un intervallo di date
  getAppointments: async (startDate, endDate) => {
    try {
      const [rows] = await pool.query(
        `SELECT a.*, s.name as stylist_name, s.color 
         FROM appointments a 
         JOIN stylists s ON a.stylist_id = s.id 
         WHERE start_time BETWEEN ? AND ? 
         ORDER BY start_time`,
        [startDate, endDate]
      );
      return rows;
    } catch (error) {
      console.error('Errore durante il recupero degli appuntamenti:', error);
      throw error;
    }
  },

  // Crea un nuovo appuntamento
  createAppointment: async (appointment) => {
    try {
      const [result] = await pool.query(
        `INSERT INTO appointments (title, client, stylist_id, start_time, end_time, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          appointment.title,
          appointment.client,
          appointment.stylistId,
          appointment.startTime,
          appointment.endTime,
          appointment.notes
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Errore durante la creazione dell\'appuntamento:', error);
      throw error;
    }
  },

  // Aggiorna un appuntamento esistente
  updateAppointment: async (id, appointment) => {
    try {
      await pool.query(
        `UPDATE appointments 
         SET title = ?, client = ?, stylist_id = ?, start_time = ?, end_time = ?, notes = ? 
         WHERE id = ?`,
        [
          appointment.title,
          appointment.client,
          appointment.stylistId,
          appointment.startTime,
          appointment.endTime,
          appointment.notes,
          id
        ]
      );
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'appuntamento:', error);
      throw error;
    }
  },

  // Elimina un appuntamento
  deleteAppointment: async (id) => {
    try {
      await pool.query('DELETE FROM appointments WHERE id = ?', [id]);
    } catch (error) {
      console.error('Errore durante l\'eliminazione dell\'appuntamento:', error);
      throw error;
    }
  }
};

// Funzioni per gestire gli operatori
const stylistQueries = {
  // Ottieni tutti gli operatori
  getStylists: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM stylists ORDER BY name');
      return rows;
    } catch (error) {
      console.error('Errore durante il recupero degli operatori:', error);
      throw error;
    }
  },

  // Crea un nuovo operatore
  createStylist: async (stylist) => {
    try {
      const [result] = await pool.query(
        'INSERT INTO stylists (name, color) VALUES (?, ?)',
        [stylist.name, stylist.color]
      );
      return result.insertId;
    } catch (error) {
      console.error('Errore durante la creazione dell\'operatore:', error);
      throw error;
    }
  }
};

module.exports = {
  pool,
  initializeDatabase,
  appointmentQueries,
  stylistQueries
}; 