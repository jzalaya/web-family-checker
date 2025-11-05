// Configuración para la aplicación de Gastos
//
// PARA DESARROLLO LOCAL:
// 1. Copia este archivo como 'config.js'
// 2. Reemplaza los valores con tus credenciales reales
// 3. El archivo config.js está en .gitignore y NO se subirá a git
//
// PARA PRODUCCIÓN (GitHub Pages):
// Las variables se configuran automáticamente desde GitHub Secrets
// durante el deployment. Ver .github/workflows/deploy.yml

const CONFIG = {
    // Tu API Key de Google Cloud Console (para operaciones de lectura)
    // Obtén una en: https://console.cloud.google.com/apis/credentials
    API_KEY: 'tu_api_key_aqui',

    // El ID de tu Google Spreadsheet
    // Lo encuentras en la URL: https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
    SPREADSHEET_ID: 'tu_spreadsheet_id_aqui',

    // Tu OAuth 2.0 Client ID (REQUERIDO para escritura)
    // Créalo en: https://console.cloud.google.com/apis/credentials
    // Tipo: "ID de cliente de OAuth 2.0" para "Aplicación web"
    // URIs de redireccionamiento autorizados: agrega tu dominio (ej: https://tudominio.github.io)
    // Para desarrollo local también agrega: http://localhost:8000
    CLIENT_ID: 'tu_client_id.apps.googleusercontent.com'
};
