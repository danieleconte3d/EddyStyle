/**
 * Script di configurazione per l'integrazione React con Electron
 * Questo script viene incluso nell'HTML per risolvere problemi di routing
 * e percorsi relativi quando l'app viene eseguita in un contesto Electron
 */

(function() {
  try {
    // Variabile globale per indicare che siamo in Electron
    window.isElectron = true;

    // Funzione per correggere percorsi relativi
    window.fixElectronPaths = function(path) {
      if (path && path.startsWith('/')) {
        return '.' + path;
      }
      return path;
    };

    console.log('Electron integration script caricato con successo');
    
    // Interviene sul routing per supportare percorsi relativi
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM caricato in contesto Electron');
      
      // Modifica tutti i percorsi delle risorse
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      linkElements.forEach(function(link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
          link.setAttribute('href', '.' + href);
          console.log('Corretto percorso CSS:', href, '->', '.' + href);
        }
      });
      
      const scriptElements = document.querySelectorAll('script[src]');
      scriptElements.forEach(function(script) {
        const src = script.getAttribute('src');
        if (src && src.startsWith('/')) {
          script.setAttribute('src', '.' + src);
          console.log('Corretto percorso script:', src, '->', '.' + src);
        }
      });
    });
  } catch (error) {
    console.error('Errore nello script di integrazione Electron:', error);
  }
})(); 