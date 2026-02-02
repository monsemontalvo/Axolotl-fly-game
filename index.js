// --- Lógica del SDK de Facebook (MODIFICADA) ---

window.fbAsyncInit = function() {
  FB.init({
    // ¡¡OJO!! REEMPLAZA ESTO CON TU PROPIO APP ID
    appId: '4371123833159258', 
    cookie: true,
    xfbml: true,
    version: 'v19.0'
  });
  
  // Llama a esta función para ver si el usuario ya está logueado
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
};

// Esta función se llama cuando cambia el estado de login
function statusChangeCallback(response) {
  console.log('Respuesta de statusChangeCallback:', response);
  const fbLoginBtn = document.getElementById('fbLoginBtn');
  if (!fbLoginBtn) return; // Salir si el botón no existe
  
  if (response.status === 'connected') {
    // Logueado y autenticado
    console.log('¡Conectado a Facebook!');
    handleLoggedIn();
  } else {
    // No logueado o no ha autorizado la app
    console.log('No conectado a Facebook.');
    // Asegurarse de que el botón esté en modo "Login"
    fbLoginBtn.textContent = window.translations['btn_login_fb'] || 'Login con Facebook';
    fbLoginBtn.onclick = handleFBLogin;
    
    // Limpiar localStorage si se desconecta
    localStorage.removeItem('playerName');
    localStorage.removeItem('playerFBID');
  }
}

// Llama a FB.getLoginStatus()
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

// Función que se llama cuando el usuario está logueado
function handleLoggedIn() {
  const fbLoginBtn = document.getElementById('fbLoginBtn');
  if (!fbLoginBtn) return;

  // Pedir el nombre y el ID del usuario a la API de Facebook
  FB.api('/me', function(response) {
    if (response && !response.error) {
      console.log('Nombre del usuario:', response.name);
      console.log('ID del usuario:', response.id);
      
      // Guardar en localStorage para usarlo en otras páginas
      localStorage.setItem('playerName', response.name);
      localStorage.setItem('playerFBID', response.id);
      
      // Actualizar el botón para que muestre "Logout [Nombre]"
      const translations = window.translations || {};
      const logoutText = (translations['btn_logout_fb'] || 'Cerrar sesión ({name})')
                          .replace('{name}', response.name);
      fbLoginBtn.textContent = logoutText;
      
      // Cambiar el clic a "Logout"
      fbLoginBtn.onclick = handleFBLogout; 
    }
  });
}

// Función que se llama al hacer clic en el botón de Login
function handleFBLogin() {
  FB.login(function(response) {
    if (response.authResponse) {
      console.log('Login exitoso!');
      statusChangeCallback(response); // Re-evaluar el estado
    } else {
      console.log('Login cancelado por el usuario.');
    }
  }, {scope: 'public_profile'}); // Pedimos info básica
}

// Función de Logout
function handleFBLogout() {
  FB.logout(function(response) {
    console.log('Logout exitoso.');
    statusChangeCallback(response); // Re-evaluar el estado (que será 'not_connected')
  });
}

// Añadir el listener al botón de Facebook 
document.addEventListener('DOMContentLoaded', () => {
    // Asignar el listener inicial. Se cambiará dinámicamente
    const fbLoginBtn = document.getElementById('fbLoginBtn');
    if (fbLoginBtn) {
        fbLoginBtn.onclick = handleFBLogin;
    }
});
// --- Fin de la Lógica de Facebook ---

// --- Funciones del Modal ---
function abrirModal(id) {
  document.getElementById(id).style.display = "flex";
  
  if (id === 'configModal') {
    cargarConfiguracion();
  }
  // --- 1. MODIFICACIÓN ---
  // Si abrimos el modal de scores, cargamos los datos
  if (id === 'scoreModal') {
    cargarPuntuaciones();
  }
}

function cerrarModal(id) {
  document.getElementById(id).style.display = "none";
}

// Buscar los scores en el servidor
async function cargarPuntuaciones() {
    const listaUl = document.querySelector('#scoreModal .lista-puntuaciones');
    if (!listaUl) return;

    listaUl.innerHTML = '<li>Cargando...</li>'; // Feedback para el usuario

    try {
        // Hacemos un fetch a la ruta que creamos en server.js
        const response = await fetch('/getHighScores');
        if (!response.ok) {
            throw new Error('No se pudo conectar al servidor');
        }
        
        const scores = await response.json();

        if (scores.length === 0) {
            listaUl.innerHTML = '<li>No hay puntuaciones todavía. ¡Juega una partida!</li>';
            return;
        }

        // Limpiar la lista y poblarla con los datos reales
        listaUl.innerHTML = '';
        scores.forEach(score => {
            const li = document.createElement('li');
            li.textContent = `${score.playerName} - ${score.score}`;
            listaUl.appendChild(li);
        });

    } catch (error) {
        console.error('Error al cargar puntuaciones:', error);
        listaUl.innerHTML = '<li>Error al cargar las puntuaciones.</li>';
    }
}



// --- Lógica de Configuración (Tu código existente) ---
const volumenSlider = document.getElementById('volumenSlider');
const sfxMuted = document.getElementById('sfxMuted');
const invertY = document.getElementById('invertY');
const languageSelect = document.getElementById('languageSelect');
const menuMusic = document.getElementById('menuMusic'); 

function cargarConfiguracion() {
  const volGuardado = localStorage.getItem('gameVolume');
  const volFinal = volGuardado !== null ? parseFloat(volGuardado) : 0.5;
  volumenSlider.value = volFinal * 100;
  if(menuMusic) menuMusic.volume = volFinal;

  sfxMuted.checked = (localStorage.getItem('sfxMuted') === 'true');
  invertY.checked = (localStorage.getItem('invertY') === 'true');
  languageSelect.value = localStorage.getItem('language') || 'es';
}

volumenSlider.addEventListener('input', (e) => {
  const vol = e.target.value / 100;
  localStorage.setItem('gameVolume', vol);
  if(menuMusic) menuMusic.volume = vol;
});

sfxMuted.addEventListener('change', (e) => {
  localStorage.setItem('sfxMuted', e.target.checked);
});

invertY.addEventListener('change', (e) => {
  localStorage.setItem('invertY', e.target.checked);
});

languageSelect.addEventListener('change', (e) => {
  const lang = e.target.value;
  localStorage.setItem('language', lang);
  window.location.reload(); 
});