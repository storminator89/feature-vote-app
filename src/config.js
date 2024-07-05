// config.js
// Funktion zur Ermittlung der Base URL
function getBaseUrl() {
    const { protocol, hostname, port } = window.location;
    const basePort = port ? `:${port}` : '';
    return `${protocol}//${hostname}${basePort}/api`;
  }
  
  // Exportieren Sie die BASE_URL als Konstante
  export const BASE_URL = getBaseUrl();