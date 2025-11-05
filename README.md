# 📊 Registro de Gastos - Family Economy

Una aplicación web sencilla y elegante para registrar gastos directamente en Google Sheets. Optimizada para uso móvil con un diseño limpio y responsivo.

## ✨ Características

- 📱 **Diseño Mobile-First**: Optimizado para usar principalmente en móvil
- 🎨 **Interfaz Moderna**: UI limpia y sencilla con excelente UX
- 📊 **Integración con Google Sheets**: Guarda datos automáticamente en tu hoja de cálculo
- ⚡ **Rápido y Ligero**: Sin dependencias, solo HTML, CSS y JavaScript vanilla
- 🔄 **Despliegue Automático**: Pipeline de CI/CD con GitHub Actions a GitHub Pages

## 🚀 Inicio Rápido

### 1. Configurar Google Sheets API

Lee la [Guía de Configuración completa](CONFIGURACION.md) para configurar:
- Google Cloud Console
- API Key de Google Sheets
- **OAuth 2.0 Client ID** (requerido para escritura)
- Permisos del spreadsheet

⚠️ **Importante**: Si ves el error **"redirect_uri_mismatch"**, consulta la [Guía de Solución OAuth](OAUTH_TROUBLESHOOTING.md) para una solución rápida.

### 2. Configurar Variables de Entorno

#### Para Desarrollo Local:

1. Copia el archivo de ejemplo:
```bash
cp config.example.js config.js
```

2. Edita `config.js` con tus credenciales:
```javascript
const CONFIG = {
    API_KEY: 'tu-api-key',
    SPREADSHEET_ID: 'tu-spreadsheet-id'
};
```

3. **IMPORTANTE**: NUNCA subas `config.js` a GitHub (ya está en `.gitignore`)

#### Para Producción (GitHub Pages):

1. Ve a tu repositorio en GitHub
2. Settings → **Secrets and variables** → **Actions**
3. Crea los siguientes secrets:
   - `GOOGLE_API_KEY`: Tu API Key de Google Cloud
   - `SPREADSHEET_ID`: El ID de tu Google Spreadsheet

El archivo `config.js` se generará automáticamente durante el deployment.

### 3. Habilitar GitHub Pages

Para que el despliegue automático funcione:

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. En "Source" selecciona **"GitHub Actions"**
4. El workflow se ejecutará automáticamente en cada push a `main`

Tu aplicación estará disponible en: `https://tu-usuario.github.io/family-economy/`

## 📱 Estructura de Datos

La aplicación escribe en Google Sheets desde la **fila 38** con la siguiente estructura:

| Columna | Contenido | Mergeada |
|---------|-----------|----------|
| C | Fecha (DD/MM/YYYY) | - |
| D-F | Importe (decimal con punto) | Sí |
| G-J | Categoría | Sí |
| K-N | Descripción | Sí |

## 🎯 Uso

1. **Fecha** (opcional): Si se deja vacío, usa la fecha actual
2. **Importe** (requerido): Número decimal con punto
3. **Categoría** (requerido): Selecciona de la lista
4. **Descripción** (requerido): Texto libre

## 🛠️ Desarrollo Local

### Opción 1: Python

```bash
python -m http.server 8000
```

### Opción 2: Node.js

```bash
npx http-server -p 8000
```

Luego abre: `http://localhost:8000`

## 📂 Estructura del Proyecto

```
family-economy/
├── .github/
│   └── workflows/
│       └── deploy.yml       # Pipeline de despliegue
├── index.html               # Página principal
├── style.css                # Estilos
├── app.js                   # Lógica de la aplicación
├── config.example.js        # Template de configuración
├── config.js                # Configuración local (gitignored)
├── .env.example             # Ejemplo de variables
├── .gitignore               # Archivos a ignorar
├── CONFIGURACION.md         # Guía detallada de setup
└── README.md                # Este archivo
```

## 🎨 Personalización

### Cambiar Categorías

Edita las opciones del `<select>` en `index.html`:

```html
<option value="Tu Categoría">Tu Categoría</option>
```

### Cambiar Colores

Modifica las variables CSS en `style.css`:

```css
:root {
    --primary-color: #4f46e5;
    --primary-dark: #4338ca;
}
```

### Cambiar Fila Inicial

En `app.js`, modifica la función `encontrarPrimeraFilaVacia()`:

```javascript
range: 'C38:C'  // Cambia 38 por tu fila inicial
```

## 🔐 Seguridad

- ✅ `.gitignore` configurado para no versionar credenciales
- ✅ Usa GitHub Secrets para variables de entorno en producción
- ✅ El archivo `config.js` nunca se sube al repositorio
- ⚠️ Usa restricciones en tu API Key de Google Cloud
- 🔒 Considera usar OAuth 2.0 para mayor seguridad
- 📝 Lee la sección de seguridad en [CONFIGURACION.md](CONFIGURACION.md)

## 🚀 Despliegue Automático

### Arquitectura de Despliegue

Este repositorio es **privado** y se usa para desarrollo. El despliegue se hace automáticamente al repositorio público [web-family-checker](https://github.com/jzalaya/web-family-checker).

**Flujo:**
1. 💻 Desarrollo en repositorio privado (`family-economy`)
2. 🔄 Push a `master` o ramas `claude/*`
3. 🤖 GitHub Actions copia archivos al repositorio público
4. 🚀 GitHub Pages despliega desde el repositorio público
5. 🌐 Aplicación disponible en: https://jzalaya.github.io/web-family-checker/

**El workflow:**
- ✅ Genera automáticamente `config.js` desde GitHub Secrets
- ✅ Copia solo los archivos necesarios al repositorio público
- ✅ Se ejecuta automáticamente en cada push
- ✅ También puede ejecutarse manualmente desde Actions
- 🔐 Las credenciales nunca se exponen en el código fuente

📖 **[Ver guía completa de configuración](DEPLOYMENT_SETUP.md)**

## 🆘 Solución de Problemas

Consulta la sección "Solución de Problemas" en [CONFIGURACION.md](CONFIGURACION.md)

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

---

Hecho con ❤️ para simplificar la gestión de gastos familiares
