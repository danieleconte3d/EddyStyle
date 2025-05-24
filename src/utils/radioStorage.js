/**
 * Radio Storage Utility
 * Gestisce il salvataggio locale delle radio preferite e della cronologia
 */

const FAVORITES_KEY = 'radio_favorites';
const HISTORY_KEY = 'radio_history';
const HISTORY_MAX_ITEMS = 20;

/**
 * Classe per gestire il salvataggio delle radio
 */
class RadioStorage {
  /**
   * Ottiene tutte le radio preferite
   * @returns {Array} Lista delle radio preferite
   */
  getFavorites() {
    try {
      const favorites = localStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Errore nel recupero dei preferiti:', error);
      return [];
    }
  }

  /**
   * Aggiunge una radio ai preferiti
   * @param {Object} radio Oggetto radio da salvare
   * @returns {boolean} true se l'operazione è riuscita
   */
  addFavorite(radio) {
    try {
      if (!radio || !radio.id) return false;

      const favorites = this.getFavorites();
      if (!favorites.some(fav => fav.id === radio.id)) {
        favorites.push({
          id: radio.id,
          name: radio.name,
          stream: radio.stream,
          cover: radio.cover,
          color: radio.color,
          addedAt: new Date().toISOString()
        });
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
      return true;
    } catch (error) {
      console.error('Errore nel salvataggio del preferito:', error);
      return false;
    }
  }

  /**
   * Rimuove una radio dai preferiti
   * @param {string} radioId ID della radio da rimuovere
   * @returns {boolean} true se l'operazione è riuscita
   */
  removeFavorite(radioId) {
    try {
      if (!radioId) return false;

      const favorites = this.getFavorites();
      const newFavorites = favorites.filter(radio => radio.id !== radioId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return true;
    } catch (error) {
      console.error('Errore nella rimozione del preferito:', error);
      return false;
    }
  }

  /**
   * Controlla se una radio è tra i preferiti
   * @param {string} radioId ID della radio da controllare
   * @returns {boolean} true se la radio è nei preferiti
   */
  isFavorite(radioId) {
    try {
      if (!radioId) return false;
      const favorites = this.getFavorites();
      return favorites.some(radio => radio.id === radioId);
    } catch (error) {
      console.error('Errore nel controllo del preferito:', error);
      return false;
    }
  }

  /**
   * Ottiene la cronologia delle radio ascoltate
   * @returns {Array} Lista delle radio ascoltate di recente
   */
  getHistory() {
    try {
      const history = localStorage.getItem(HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Errore nel recupero della cronologia:', error);
      return [];
    }
  }

  /**
   * Aggiunge una radio alla cronologia
   * @param {Object} radio Oggetto radio da salvare nella cronologia
   * @returns {boolean} true se l'operazione è riuscita
   */
  addToHistory(radio) {
    try {
      if (!radio || !radio.id) return false;

      let history = this.getHistory();
      
      // Rimuovi la radio se è già presente in cronologia
      history = history.filter(item => item.id !== radio.id);
      
      // Aggiungi la radio in cima alla cronologia
      history.unshift({
        id: radio.id,
        name: radio.name,
        stream: radio.stream,
        cover: radio.cover,
        color: radio.color,
        playedAt: new Date().toISOString()
      });
      
      // Limita la cronologia al numero massimo di elementi
      if (history.length > HISTORY_MAX_ITEMS) {
        history = history.slice(0, HISTORY_MAX_ITEMS);
      }
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Errore nel salvataggio della cronologia:', error);
      return false;
    }
  }

  /**
   * Pulisce la cronologia delle radio ascoltate
   * @returns {boolean} true se l'operazione è riuscita
   */
  clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Errore nella pulizia della cronologia:', error);
      return false;
    }
  }
}

// Esporta un'istanza singleton
export default new RadioStorage(); 