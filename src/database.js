const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connessione al database
const db = new sqlite3.Database(path.join(__dirname, 'appointments.db'), (err) => {
    if (err) {
        console.error('Errore durante la connessione al database:', err);
    } else {
        console.log('Connesso al database SQLite');
        initDatabase();
    }
});

// Inizializzazione del database
function initDatabase() {
    // Tabella Personale
    db.run(`
        CREATE TABLE IF NOT EXISTS personale (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            colore TEXT NOT NULL,
            telefono TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Crea la tabella appointments se non esiste
    db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            telefono TEXT,
            email TEXT,
            servizio TEXT NOT NULL,
            data_inizio DATETIME NOT NULL,
            durata INTEGER NOT NULL,
            note TEXT,
            prezzo REAL,
            stato TEXT DEFAULT 'programmato',
            metodo_pagamento TEXT,
            personale_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (personale_id) REFERENCES personale(id)
        )
    `, (err) => {
        if (err) {
            console.error('Errore nella creazione della tabella appointments:', err);
        }
        console.log('Tabella appointments creata con successo');
    });

    // Inserimento dati di default per il personale se la tabella è vuota
    db.get("SELECT COUNT(*) as count FROM personale", (err, row) => {
        if (err) {
            console.error('Errore nel controllo del personale:', err);
            return;
        }
        
        if (row.count === 0) {
            const defaultPersonale = [
                { nome: 'Eddy', colore: '#FF5722', telefono: '' },
                { nome: 'Maria', colore: '#9C27B0', telefono: '' },
                { nome: 'Giovanna', colore: '#4CAF50', telefono: '' },
                { nome: 'Luca', colore: '#2196F3', telefono: '' }
            ];

            const stmt = db.prepare('INSERT INTO personale (nome, colore, telefono) VALUES (?, ?, ?)');
            defaultPersonale.forEach(p => stmt.run(p.nome, p.colore, p.telefono));
            stmt.finalize();
        }
    });
}

// Funzioni per gestire il personale
function getAllPersonale() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM personale ORDER BY nome ASC';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function createPersonale(personale) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO personale (nome, colore, telefono)
            VALUES (?, ?, ?)
        `;
        
        db.run(sql, [
            personale.nome,
            personale.colore,
            personale.telefono
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

function updatePersonale(id, personale) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE personale 
            SET nome = ?,
                colore = ?,
                telefono = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        db.run(sql, [
            personale.nome,
            personale.colore,
            personale.telefono,
            id
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

function deletePersonale(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM personale WHERE id = ?';
        db.run(sql, [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

// Funzioni esistenti per gli appuntamenti
function createAppointment(appointment) {
    return new Promise((resolve, reject) => {
        const { nome, telefono, email, servizio, data_inizio, durata, note, prezzo, stato, metodo_pagamento, personale_id } = appointment;
        const sql = `
            INSERT INTO appointments (
                nome, telefono, email, servizio, data_inizio, durata, 
                note, prezzo, stato, metodo_pagamento, personale_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [nome, telefono, email, servizio, data_inizio, durata, note, prezzo, stato, metodo_pagamento, personale_id], function(err) {
            if (err) {
                console.error('Errore durante l\'inserimento:', err);
                reject(err);
                return;
            }
            resolve({ id: this.lastID, ...appointment });
        });
    });
}

function getAllAppointments() {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT a.*, p.nome as personale_nome, p.colore as personale_colore 
            FROM appointments a 
            LEFT JOIN personale p ON a.personale_id = p.id
            ORDER BY a.data_inizio DESC
        `, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

function getAppointmentById(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT a.*, p.nome as personale_nome, p.colore as personale_colore
            FROM appointments a
            LEFT JOIN personale p ON a.personale_id = p.id
            WHERE a.id = ?
        `;
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function updateAppointment(id, appointment) {
    return new Promise((resolve, reject) => {
        const { nome, telefono, email, servizio, data_inizio, durata, note, prezzo, stato, metodo_pagamento, personale_id } = appointment;
        db.run(`
            UPDATE appointments 
            SET nome = ?, telefono = ?, email = ?, servizio = ?, 
                data_inizio = ?, durata = ?, note = ?, prezzo = ?, 
                stato = ?, metodo_pagamento = ?, personale_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [nome, telefono, email, servizio, data_inizio, durata, note, prezzo, stato, metodo_pagamento, personale_id, id], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({ id, ...appointment });
        });
    });
}

function deleteAppointment(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM appointments WHERE id = ?';
        db.run(sql, [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

function getAppointmentsByDateRange(startDate, endDate) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT a.*, p.nome as personale_nome, p.colore as personale_colore 
            FROM appointments a 
            LEFT JOIN personale p ON a.personale_id = p.id
            WHERE a.data_inizio BETWEEN ? AND ?
            ORDER BY a.data_inizio ASC
        `, [startDate, endDate], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

// Funzione di debug per verificare la struttura del database
function debugDatabase() {
  return new Promise((resolve, reject) => {
    const results = {};
    
    // Verifica struttura tabella appointments
    db.all("PRAGMA table_info(appointments)", (err, rows) => {
      if (err) {
        console.error('Errore nel controllo della struttura appointments:', err);
        return;
      }
      results.appointmentsStructure = rows;
      
      // Verifica struttura tabella personale
      db.all("PRAGMA table_info(personale)", (err, rows) => {
        if (err) {
          console.error('Errore nel controllo della struttura personale:', err);
          return;
        }
        results.personaleStructure = rows;
        
        // Controlla gli appuntamenti
        db.all("SELECT * FROM appointments", (err, rows) => {
          if (err) {
            console.error('Errore nel recupero degli appuntamenti:', err);
            return;
          }
          results.appointments = rows;
          
          // Controlla il personale
          db.all("SELECT * FROM personale", (err, rows) => {
            if (err) {
              console.error('Errore nel recupero del personale:', err);
              return;
            }
            results.personale = rows;
            
            // Controlla gli appuntamenti con i dettagli del personale
            db.all(`
              SELECT a.*, p.nome as personale_nome, p.colore as personale_colore 
              FROM appointments a 
              LEFT JOIN personale p ON a.personale_id = p.id
            `, (err, rows) => {
              if (err) {
                console.error('Errore nel recupero degli appuntamenti con personale:', err);
                return;
              }
              results.appointmentsWithPersonale = rows;
              resolve(results);
            });
          });
        });
      });
    });
  });
}

// Esportazione delle funzioni
module.exports = {
    // Funzioni per il personale
    getAllPersonale,
    createPersonale,
    updatePersonale,
    deletePersonale,
    
    // Funzioni per gli appuntamenti
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDateRange,
    debugDatabase
}; 