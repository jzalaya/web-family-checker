# Guía de Configuración - Registro de Gastos

Esta guía te ayudará a configurar la aplicación para que funcione con tu Google Sheet.

## 📋 Requisitos Previos

- Una cuenta de Google
- Un navegador web moderno
- Acceso a Google Cloud Console

---

## 🚀 Paso 1: Preparar tu Google Sheet "Economía Familia"

1. **Crea o abre tu Google Sheet**
   - Ve a [Google Sheets](https://sheets.google.com)
   - Abre o crea tu hoja de cálculo llamada **"Economía Familia"**

2. **Estructura de hojas mensuales** ⚠️ IMPORTANTE
   - La aplicación trabaja con **hojas mensuales separadas**
   - Cada mes debe tener su propia hoja con nombre de **3 letras en MAYÚSCULAS**:
     ```
     JAN  → Enero
     FEB  → Febrero
     MAR  → Marzo
     APR  → Abril
     MAY  → Mayo
     JUN  → Junio
     JUL  → Julio
     AUG  → Agosto
     SEP  → Septiembre
     OCT  → Octubre
     NOV  → Noviembre
     DEC  → Diciembre
     ```
   - La aplicación **detecta automáticamente** el mes actual y usa la hoja correspondiente
   - Ejemplo: Si estamos en Noviembre, la app escribirá en la hoja "NOV"

3. **Estructura de datos en cada hoja**
   - La aplicación escribirá datos a partir de la **fila 38**
   - Las columnas usadas son de la **C a la N**:
     - **Columna C**: Fecha (formato DD/MM/YYYY)
     - **Columnas D-F**: Importe (mergeadas)
     - **Columnas G-J**: Categoría (mergeadas)
     - **Columnas K-N**: Descripción (mergeadas)

4. **Obtén el ID de tu Spreadsheet**
   - Mira la URL de tu hoja de cálculo
   - Ejemplo: `https://docs.google.com/spreadsheets/d/ABC123xyz456/edit`
   - El ID es: `ABC123xyz456`
   - **Guarda este ID**, lo necesitarás más adelante

---

## 🔑 Paso 2: Configurar Google Cloud Console

### 2.1 Crear un Proyecto

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Dale un nombre descriptivo (ej: "Registro Gastos")

### 2.2 Activar la API de Google Sheets

1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Google Sheets API"**
3. Haz clic en **"Habilitar"**

### 2.3 Crear una API Key (Para lectura)

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"Crear credenciales"** → **"Clave de API"**
3. Se creará tu API Key
4. **IMPORTANTE**: Copia esta clave inmediatamente

### 2.4 Crear un OAuth 2.0 Client ID (⚠️ REQUERIDO para escritura)

**IMPORTANTE**: Google Sheets API NO permite usar solo API Keys para operaciones de escritura. Debes configurar OAuth 2.0.

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Si es tu primera vez, configura la **"Pantalla de consentimiento OAuth"**:
   - Tipo de usuario: **"Externo"** (o "Interno" si tienes Google Workspace)
   - Nombre de la aplicación: "Registro de Gastos"
   - Correo de asistencia: tu email
   - Alcances: Agrega `https://www.googleapis.com/auth/spreadsheets`
   - Guarda y continúa

3. Vuelve a **"Credenciales"** → **"Crear credenciales"** → **"ID de cliente de OAuth 2.0"**
4. Tipo de aplicación: **"Aplicación web"**
5. Nombre: "Cliente Web Registro Gastos"
6. **URIs de redireccionamiento autorizados** (⚠️ MUY IMPORTANTE):

   Debes agregar **EXACTAMENTE** estos URIs (solo el dominio, SIN la ruta del repositorio):

   - Para desarrollo local: `http://localhost:8000`
   - Para producción GitHub Pages: `https://jzalaya.github.io`

   **Nota crítica**:
   - ✅ CORRECTO: `https://jzalaya.github.io` (solo el dominio)
   - ❌ INCORRECTO: `https://jzalaya.github.io/web-family-checker/` (con ruta)
   - ❌ INCORRECTO: `https://jzalaya.github.io/web-family-checker` (con ruta, sin slash)

   El OAuth de Google usa automáticamente `window.location.origin` como redirect_uri, que es solo el dominio sin rutas.

7. Haz clic en **"Crear"**
8. Se mostrará tu **Client ID** → **Cópialo** (lo necesitarás para CONFIG.CLIENT_ID)

### 2.5 Configurar Restricciones de la API Key (Opcional, para mayor seguridad)

1. Haz clic en tu API Key
2. En **"Restricciones de aplicación"**:
   - Selecciona **"Referentes HTTP"**
   - Añade tu dominio o `localhost` para desarrollo
   - Ejemplo: `localhost/*` o `http://localhost:*`

3. En **"Restricciones de API"**:
   - Selecciona **"Restringir clave"**
   - Marca solo **"Google Sheets API"**

4. Guarda los cambios

---

## 📝 Paso 3: Configurar la Aplicación

Hay dos formas de configurar la aplicación dependiendo de tu caso de uso:

### 3.1 Para Desarrollo Local

Si vas a ejecutar la aplicación en tu computadora local:

1. Copia el archivo `config.example.js` como `config.js`:
   ```bash
   cp config.example.js config.js
   ```

2. Abre el archivo `config.js` en un editor de texto

3. Reemplaza los siguientes valores:
   ```javascript
   const CONFIG = {
       // Pega aquí tu API Key de Google Cloud
       API_KEY: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',

       // Pega aquí el ID de tu Spreadsheet "Economía Familia"
       SPREADSHEET_ID: 'ABC123xyz456...',

       // ⚠️ REQUERIDO: Pega aquí tu OAuth 2.0 Client ID
       CLIENT_ID: '123456789-abcdefg.apps.googleusercontent.com'
   };
   ```

4. **IMPORTANTE**: NO subas el archivo `config.js` a GitHub (ya está en `.gitignore`)

### 3.2 Para Producción (GitHub Pages / Deployment)

Si vas a desplegar la aplicación en GitHub Pages o en producción:

1. Ve a tu repositorio en GitHub

2. Navega a **Settings** → **Secrets and variables** → **Actions**

3. Haz clic en **"New repository secret"**

4. Crea los siguientes secrets:

   **Secret 1:**
   - Name: `GOOGLE_API_KEY`
   - Secret: Tu API Key de Google Cloud Console

   **Secret 2:**
   - Name: `SPREADSHEET_ID`
   - Secret: El ID de tu Google Spreadsheet

   **Secret 3:** ⚠️ NUEVO - REQUERIDO
   - Name: `GOOGLE_CLIENT_ID`
   - Secret: Tu OAuth 2.0 Client ID (termina en `.apps.googleusercontent.com`)

5. Una vez configurados, cada vez que hagas push a la rama `main`, GitHub Actions generará automáticamente el archivo `config.js` con tus credenciales.

⚠️ **IMPORTANTE**: Asegúrate de que en el OAuth 2.0 Client ID de Google Cloud Console, los **URIs de redireccionamiento autorizados** incluyan:
   - `https://jzalaya.github.io` (solo el dominio, NO incluyas `/web-family-checker/`)

### 3.3 Ejemplo Completo

```javascript
const CONFIG = {
    API_KEY: 'AIzaSyDxK8j9FmN3QrT6vYzP1cW2hL5sN8bM4aR',
    SPREADSHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    CLIENT_ID: '123456789-abcdefghijklmnop.apps.googleusercontent.com'
};
```

**Importante**: La aplicación detectará automáticamente el mes actual y usará la hoja correspondiente (JAN, FEB, MAR, etc.). Asegúrate de que tu spreadsheet "Economía Familia" tenga las hojas de cada mes creadas.

---

## 🔒 Paso 4: Configurar Permisos del Google Sheet

1. Abre tu Google Sheet
2. Haz clic en **"Compartir"** (esquina superior derecha)
3. En **"Obtener enlace"**, cambia a:
   - **"Cualquier persona con el enlace"**
   - Permiso: **"Editor"** o **"Lector"** (si solo quieres que la API escriba)
4. Esto permite que la API acceda a la hoja

> **Nota de Seguridad**: Para mayor seguridad, puedes configurar OAuth 2.0 en lugar de usar solo API Key, pero requiere más configuración.

---

## 🌐 Paso 5: Probar la Aplicación

⚠️ **IMPORTANTE**: La aplicación ahora usa **OAuth 2.0** para autenticación. La primera vez que la abras:

1. Verás una pantalla de login con un botón **"Autorizar con Google"**
2. Haz clic en el botón
3. Se abrirá una ventana de Google para autorizar la aplicación
4. Selecciona tu cuenta de Google
5. Acepta los permisos (la app necesita leer y escribir en Google Sheets)
6. Serás redirigido de vuelta a la aplicación

### Opción A: Servidor Local Simple (Recomendado)

Si tienes Python instalado:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Si tienes Node.js instalado:

```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar servidor
http-server -p 8000
```

Luego abre en tu navegador: `http://localhost:8000`

⚠️ **Nota**: Para desarrollo local, asegúrate de agregar **EXACTAMENTE** `http://localhost:8000` en los "URIs de redireccionamiento autorizados" de tu OAuth 2.0 Client ID en Google Cloud Console. Si usas un puerto diferente, ajusta el URI en consecuencia.

### Opción B: Abrir Directamente

En algunos navegadores puedes abrir directamente `index.html`, pero puede haber restricciones CORS.

### Opción C: Usar un servicio de hosting

Puedes subir los archivos a:
- **GitHub Pages** (gratis)
- **Netlify** (gratis)
- **Vercel** (gratis)
- **Firebase Hosting** (gratis)

---

## ✅ Verificar que Funciona

1. Abre la aplicación en tu navegador
2. Llena el formulario con datos de prueba
3. Haz clic en **"Guardar Gasto"**
4. Verifica que aparezca el mensaje de éxito
5. Revisa tu Google Sheet en la fila 38 o posterior
6. Los datos deberían aparecer correctamente

---

## 🛠️ Personalización

### Cambiar las Categorías

Edita el archivo `index.html` y modifica las opciones del `<select>`:

```html
<select id="categoria" name="categoria" required>
    <option value="">Selecciona una categoría</option>
    <option value="Tu Categoría 1">Tu Categoría 1</option>
    <option value="Tu Categoría 2">Tu Categoría 2</option>
    <!-- Añade más categorías aquí -->
</select>
```

### Cambiar la Fila Inicial

Por defecto, la aplicación empieza en la fila 38. Para cambiar esto:

1. Abre `app.js`
2. Busca la función `encontrarPrimeraFilaVacia()`
3. Cambia `'C38:C'` por `'C[TU_FILA]:C'`

### Cambiar los Colores

Edita el archivo `style.css` en la sección `:root`:

```css
:root {
    --primary-color: #4f46e5;  /* Color principal */
    --primary-dark: #4338ca;   /* Color principal oscuro */
    /* Cambia estos valores a tu gusto */
}
```

---

## ❗ Solución de Problemas

### Error: "API keys are not supported by this API"
- **Causa**: Estás intentando escribir en Google Sheets usando solo API Key
- **Solución**: Debes configurar OAuth 2.0 Client ID (ver Paso 2.4)
- Este es un requisito de Google - las API Keys solo funcionan para lectura, no para escritura

### Error: "CLIENT_ID is not defined" o "CONFIG.CLIENT_ID is undefined"
- **Causa**: No has configurado el CLIENT_ID en config.js
- **Solución**:
  1. Crea un OAuth 2.0 Client ID en Google Cloud Console (Paso 2.4)
  2. Agrégalo a tu `config.js` como `CLIENT_ID: 'tu-client-id.apps.googleusercontent.com'`

### No aparece la pantalla de login / Error al autenticar
- Verifica que el CLIENT_ID sea correcto (debe terminar en `.apps.googleusercontent.com`)
- **Paso importante**: Abre la consola del navegador (F12 → Consola) y busca el mensaje "🔗 Redirect URI configurado: ..." - anota ese URI
- Asegúrate de que ese URI EXACTO esté en los "URIs de redireccionamiento autorizados" en Google Cloud Console:
  - `http://localhost:8000` para desarrollo local
  - `https://jzalaya.github.io` para producción (SOLO el dominio)
- Busca errores adicionales de GAPI o GIS en la consola

### Error: "Failed to fetch"
- Verifica que tu API Key sea correcta
- Asegúrate de que la Google Sheets API esté habilitada
- Comprueba las restricciones de tu API Key

### Error: "The caller does not have permission"
- Verifica que tu Google Sheet esté compartido públicamente (al menos como "Editor")
- O asegúrate de que tu cuenta de Google tenga acceso al Sheet
- Comprueba que hayas autorizado la aplicación correctamente

### Los datos no aparecen en la hoja
- Verifica el SPREADSHEET_ID
- Asegúrate de haber autorizado con OAuth2
- Abre la consola del navegador (F12) y busca errores

### El formulario no se ve bien en móvil
- Asegúrate de que estés accediendo desde `http://` o `https://`
- No abras el archivo directamente (`file://`)

### Error: "redirect_uri_mismatch"
- **Causa**: El URI de redireccionamiento no está autorizado en tu OAuth 2.0 Client ID
- **Diagnóstico**: Abre la consola del navegador (F12) y busca el mensaje "🔗 Redirect URI configurado:" - ese es el URI exacto que necesitas autorizar
- **Solución**:
  1. Ve a [Google Cloud Console](https://console.cloud.google.com)
  2. Navega a: **APIs y servicios** → **Credenciales**
  3. Haz clic en tu **OAuth 2.0 Client ID**
  4. En **"URIs de redireccionamiento autorizados"** agrega estos URIs EXACTOS:
     - `http://localhost:8000` (para desarrollo local)
     - `https://jzalaya.github.io` (para producción - ⚠️ SOLO el dominio, SIN `/web-family-checker/`)
  5. Haz clic en **"Guardar"**
  6. Espera 1-2 minutos para que los cambios se propaguen
  7. Recarga la página de tu aplicación

**Importante**: El redirect_uri es SOLO el dominio (`window.location.origin`), NO incluye la ruta del repositorio.

---

## 🔐 Seguridad

### Recomendaciones Importantes

1. **No compartas tu API Key públicamente**
   - NUNCA subas el archivo `config.js` a GitHub (ya está en `.gitignore`)
   - Usa GitHub Secrets para configuración en producción
   - No incluyas credenciales directamente en el código

2. **Uso de GitHub Secrets (Recomendado para producción)**:
   - ✅ Las credenciales se almacenan de forma segura en GitHub
   - ✅ No están expuestas en el código fuente
   - ✅ Solo son accesibles durante el deployment
   - ✅ Se generan automáticamente en el proceso de build

3. **Restricciones recomendadas**:
   - Restringe la API Key a tu dominio
   - Restringe la API Key solo a Google Sheets API
   - Considera usar OAuth 2.0 para mayor seguridad

4. **Google Sheet**:
   - Si es posible, usa permisos más restrictivos
   - Considera crear una hoja específica solo para la app

---

## 📱 Uso en Móvil

1. **Añade la app a la pantalla de inicio**:
   - Safari (iOS): Botón compartir → "Añadir a pantalla de inicio"
   - Chrome (Android): Menú → "Añadir a pantalla de inicio"

2. **Optimización**:
   - La app está diseñada con "mobile-first"
   - Todos los campos son accesibles con una mano
   - El teclado numérico aparece automáticamente para el importe

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12 → Consola)
2. Verifica cada paso de la configuración
3. Asegúrate de que todos los archivos estén en la misma carpeta

---

## 📚 Recursos Adicionales

- [Documentación de Google Sheets API](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com)
- [Guía de OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

---

¡Disfruta de tu aplicación de registro de gastos! 🎉
