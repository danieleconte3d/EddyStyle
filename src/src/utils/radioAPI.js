/**
 * Radio Browser API Utility
 * Implementazione dell'API di radio-browser.info secondo le best practice
 * https://api.radio-browser.info/
 */

const APP_NAME = 'EddyStyle_RadioApp/1.0';

/**
 * Ottiene una lista casuale di server API disponibili
 * @returns {Promise<string[]>} Lista di URL dei server
 */
export const getRadioServers = async () => {
  try {
    // Simulazione del DNS lookup con una chiamata fetch
    const response = await fetch('https://all.api.radio-browser.info/json/servers');
    const servers = await response.json();
    
    // Randomizza la lista dei server
    return servers
      .map(server => `https://${server.name}`)
      .sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('Errore nel recupero dei server:', error);
    // Fallback su server noti in caso di errore
    return [
      'https://de1.api.radio-browser.info',
      'https://fr1.api.radio-browser.info',
      'https://fi1.api.radio-browser.info',
      'https://de2.api.radio-browser.info'
    ].sort(() => Math.random() - 0.5);
  }
};

/**
 * Classe per gestire le chiamate API a Radio Browser
 */
class RadioBrowserAPI {
  constructor() {
    this.servers = [];
    this.currentServerIndex = 0;
    this.initialized = false;
  }

  /**
   * Inizializza l'API ottenendo la lista dei server
   */
  async init() {
    if (this.initialized) return;
    
    this.servers = await getRadioServers();
    this.initialized = true;
    console.log('Radio Browser API inizializzata con i server:', this.servers);
  }

  /**
   * Ottiene l'URL del server corrente
   * @returns {string} URL del server
   */
  getCurrentServerUrl() {
    return this.servers[this.currentServerIndex];
  }

  /**
   * Passa al server successivo nella lista
   */
  switchToNextServer() {
    this.currentServerIndex = (this.currentServerIndex + 1) % this.servers.length;
    console.log('Passaggio al server successivo:', this.getCurrentServerUrl());
  }

  /**
   * Esegue una chiamata API gestendo i fallback sui server
   * @param {string} endpoint Endpoint API
   * @param {Object} options Opzioni fetch
   * @returns {Promise<Object>} Dati della risposta
   */
  async apiCall(endpoint, options = {}) {
    await this.init();
    
    const headers = {
      'User-Agent': APP_NAME,
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Prova con ogni server fino a quando uno ha successo
    let lastError = null;
    for (let attempt = 0; attempt < this.servers.length; attempt++) {
      try {
        const url = `${this.getCurrentServerUrl()}${endpoint}`;
        const response = await fetch(url, { ...options, headers });
        
        if (!response.ok) {
          throw new Error(`Errore HTTP ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.warn(`Errore nella chiamata API al server ${this.getCurrentServerUrl()}:`, error);
        lastError = error;
        this.switchToNextServer();
      }
    }
    
    // Se arriviamo qui, tutti i server hanno fallito
    throw new Error(`Tutti i server hanno fallito: ${lastError?.message || 'Errore sconosciuto'}`);
  }

  /**
   * Cerca le radio per nome
   * @param {string} query Termine di ricerca
   * @param {number} limit Numero massimo di risultati
   * @param {number} offset Offset per la paginazione
   * @returns {Promise<Array>} Lista di radio
   */
  async searchRadios(query, limit = 20, offset = 0) {
    return this.apiCall(`/json/stations/search?name=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);
  }

  /**
   * Ottiene le radio più popolari
   * @param {number} limit Numero massimo di risultati
   * @param {number} offset Offset per la paginazione
   * @returns {Promise<Array>} Lista di radio
   */
  async getPopularRadios(limit = 20, offset = 0) {
    return this.apiCall(`/json/stations/topclick?limit=${limit}&offset=${offset}`);
  }

  /**
   * Traccia un clic su una radio
   * @param {string} stationUuid UUID della stazione
   * @returns {Promise<Object>} Risultato dell'operazione
   */
  async trackClick(stationUuid) {
    return this.apiCall(`/json/url/${stationUuid}`);
  }

  /**
   * Ottiene radio per tag
   * @param {string} tag Tag da cercare
   * @param {number} limit Numero massimo di risultati
   * @returns {Promise<Array>} Lista di radio
   */
  async getRadiosByTag(tag, limit = 20) {
    return this.apiCall(`/json/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}`);
  }

  /**
   * Ottiene radio per paese
   * @param {string} countryCode Codice paese (ISO 3166-1 alpha-2)
   * @param {number} limit Numero massimo di risultati
   * @returns {Promise<Array>} Lista di radio
   */
  async getRadiosByCountry(countryCode, limit = 20) {
    return this.apiCall(`/json/stations/bycountrycodeexact/${encodeURIComponent(countryCode.toUpperCase())}?limit=${limit}`);
  }

  /**
   * Ottiene tutti i generi musicali disponibili
   * @param {number} limit Numero massimo di risultati
   * @returns {Promise<Array>} Lista di tag/generi
   */
  async getAllTags(limit = 100) {
    return this.apiCall(`/json/tags?hidebroken=true&order=stationcount&reverse=true&limit=${limit}`);
  }

  /**
   * Ottiene tutte le lingue disponibili
   * @param {number} limit Numero massimo di risultati
   * @returns {Promise<Array>} Lista di lingue
   */
  async getAllLanguages(limit = 100) {
    return this.apiCall(`/json/languages?hidebroken=true&order=stationcount&reverse=true&limit=${limit}`);
  }

  /**
   * Ottiene tutti i paesi disponibili
   * @param {number} limit Numero massimo di risultati
   * @returns {Promise<Array>} Lista di paesi
   */
  async getAllCountries(limit = 100) {
    return this.apiCall(`/json/countries?hidebroken=true&order=stationcount&reverse=true&limit=${limit}`);
  }

  /**
   * Cerca radio avanzata con filtri e paginazione
   * @param {Object} filters Oggetto con i filtri
   * @param {number} limit Numero massimo di risultati
   * @param {number} offset Offset per la paginazione
   * @returns {Promise<Array>} Lista di radio
   */
  async advancedSearch(filters = {}, limit = 20, offset = 0) {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    queryParams.append('offset', offset);
    queryParams.append('hidebroken', true);
    
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.tag) queryParams.append('tag', filters.tag);
    if (filters.language) queryParams.append('language', filters.language);
    if (filters.country) queryParams.append('country', filters.country);
    
    return this.apiCall(`/json/stations/search?${queryParams.toString()}`);
  }

  /**
   * Ottiene radio per lingua
   * @param {string} language Nome della lingua
   * @param {number} limit Numero massimo di risultati
   * @returns {Promise<Array>} Lista di radio
   */
  async getRadiosByLanguage(language, limit = 20) {
    return this.apiCall(`/json/stations/bylanguageexact/${encodeURIComponent(language)}?limit=${limit}`);
  }

  /**
   * Ottiene una radio specifica per UUID
   * @param {string} stationUuid UUID della stazione
   * @returns {Promise<Object>} Dettagli della radio
   */
  async getStationByUUID(stationUuid) {
    const result = await this.apiCall(`/json/stations/byuuid/${encodeURIComponent(stationUuid)}`);
    return result[0] || null; // Restituisce il primo risultato o null
  }

  /**
   * Cerca radio per codec
   * @param {string} codec Codec da cercare (ad es. "MP3", "AAC")
   * @param {number} limit Numero massimo di risultati
   * @returns {Promise<Array>} Lista di radio
   */
  async getRadiosByCodec(codec, limit = 20) {
    return this.apiCall(`/json/stations/bycodecexact/${encodeURIComponent(codec)}?limit=${limit}`);
  }

  /**
   * Ottiene radio recentemente aggiunte o modificate
   * @param {number} limit Numero massimo di risultati
   * @returns {Promise<Array>} Lista di radio
   */
  async getRecentRadios(limit = 20) {
    return this.apiCall(`/json/stations/lastchange/${limit}`);
  }
}

// Esporta un'istanza singleton
export default new RadioBrowserAPI(); 