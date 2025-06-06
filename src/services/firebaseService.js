import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Funzioni per gestire il personale
export const personaleService = {
  // Ottieni tutto il personale
  getAllPersonale: async () => {
    const querySnapshot = await getDocs(collection(db, 'personale'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Ottieni personale attivo
  getActivePersonale: async () => {
    const querySnapshot = await getDocs(
      query(collection(db, 'personale'), 
      where('isEx', 'in', [false, null]))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Ottieni personale esterno
  getExPersonale: async () => {
    const querySnapshot = await getDocs(
      query(collection(db, 'personale'), 
      where('isEx', '==', true))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Crea nuovo personale
  createPersonale: async (personale) => {
    const docRef = await addDoc(collection(db, 'personale'), {
      ...personale,
      isEx: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return docRef.id;
  },

  // Aggiorna personale esistente
  updatePersonale: async (id, personale) => {
    const docRef = doc(db, 'personale', id);
    const docSnap = await getDoc(docRef);
    const currentData = docSnap.data();
    
    await updateDoc(docRef, {
      ...personale,
      isEx: currentData.isEx ?? false, // Mantiene il valore esistente o usa false come default
      updated_at: Timestamp.now()
    });
  },

  // Elimina personale
  deletePersonale: async (id) => {
    await deleteDoc(doc(db, 'personale', id));
  },

  // Setta personale come esterno
  setExPersonale: async (id) => {
    const docRef = doc(db, 'personale', id);
    await updateDoc(docRef, {
      isEx: true
    });
  },

  // Setta personale come attivo
  setActivePersonale: async (id) => {
    const docRef = doc(db, 'personale', id);
    await updateDoc(docRef, {
      isEx: false
    });
  },

  // Aggiorna in massa tutti i dipendenti esistenti
  updateAllExistingPersonale: async () => {
    const querySnapshot = await getDocs(collection(db, 'personale'));
    const batch = writeBatch(db);
    let count = 0;

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.isEx === undefined) {
        batch.update(doc.ref, { 
          isEx: false,
          updated_at: Timestamp.now()
        });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`Aggiornati ${count} dipendenti con il campo isEx`);
    }
  }
};

// Funzioni per gestire gli appuntamenti
export const appointmentsService = {
  // Ottieni tutti gli appuntamenti
  getAllAppointments: async () => {
    const querySnapshot = await getDocs(
      query(collection(db, 'appointments'), orderBy('data_inizio', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Ottieni appuntamenti per intervallo di date
  getAppointmentsByDateRange: async (startDate, endDate) => {
    const q = query(
      collection(db, 'appointments'),
      where('data_inizio', '>=', Timestamp.fromDate(startDate)),
      where('data_inizio', '<=', Timestamp.fromDate(endDate)),
      orderBy('data_inizio', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Carica i dati del personale per ogni appuntamento
    const appointmentsWithPersonale = await Promise.all(
      appointments.map(async (appointment) => {
        if (appointment.personale_id) {
          const personaleDoc = await getDoc(doc(db, 'personale', appointment.personale_id));
          if (personaleDoc.exists()) {
            const personaleData = personaleDoc.data();
            return {
              ...appointment,
              personale_colore: personaleData.colore || '#1976d2',
              personale_isEx: personaleData.isEx ?? false,
              personale_nome: personaleData.nome
            };
          }
        }
        return {
          ...appointment,
          personale_colore: '#1976d2',
          personale_isEx: false
        };
      })
    );

    return appointmentsWithPersonale;
  },

  // Crea nuovo appuntamento
  createAppointment: async (appointment) => {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointment,
      data_inizio: Timestamp.fromDate(new Date(appointment.data_inizio)),
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return docRef.id;
  },

  // Aggiorna appuntamento esistente
  updateAppointment: async (id, appointment) => {
    const docRef = doc(db, 'appointments', id);
    await updateDoc(docRef, {
      ...appointment,
      data_inizio: Timestamp.fromDate(new Date(appointment.data_inizio)),
      updated_at: Timestamp.now()
    });
  },

  // Elimina appuntamento
  deleteAppointment: async (id) => {
    await deleteDoc(doc(db, 'appointments', id));
  }
};

// Funzione per inizializzare il personale di default
export const initializeDefaultPersonale = async () => {
  try {
    // Verifica se esiste già del personale
    const existingPersonale = await personaleService.getAllPersonale();
    
    if (existingPersonale.length === 0) {
      const defaultPersonale = [
        { nome: 'Eddy', colore: '#FF5722', telefono: '' },
        { nome: 'Maria', colore: '#9C27B0', telefono: '' },
        { nome: 'Giovanna', colore: '#4CAF50', telefono: '' },
        { nome: 'Luca', colore: '#2196F3', telefono: '' }
      ];

      for (const personale of defaultPersonale) {
        await personaleService.createPersonale(personale);
      }
      console.log('Personale di default creato con successo');
    } else {
      console.log('Il personale esiste già, nessuna inizializzazione necessaria');
    }
  } catch (error) {
    console.error('Errore durante l\'inizializzazione del personale:', error);
  }
}; 