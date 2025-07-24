let perfilesGuardados = JSON.parse(localStorage.getItem("perfiles")) || [];
let nombreUsuario = "";
let repetirTest = true;

// Crear elementos HTML
function crearElemento(tag, texto, clase) {
  const el = document.createElement(tag);
  if (texto) el.textContent = texto;
  if (clase) el.classList.add(clase);
  return el;
}

// Mostrar mensaje breve en pantalla
function mostrarMensaje(mensaje, tipo) {
  const msj = document.getElementById("mensaje");
  msj.textContent = mensaje;
  msj.className = tipo;
  setTimeout(() => {
    msj.textContent = "";
    msj.className = "";
  }, 3000);
}

// Guardar perfil en localStorage
function guardarPerfil(e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const edad = parseInt(document.getElementById("edad").value);
  const genero = document.getElementById("genero").value;
  const preferencia = document.getElementById("preferencia").value;

  if (!nombre || isNaN(edad) || !genero || !preferencia) {
    mostrarMensaje("Por favor completa todos los campos correctamente.", "error");
    return;
  }

  const perfil = { nombre, edad, genero, preferencia };
  perfilesGuardados.push(perfil);
  localStorage.setItem("perfiles", JSON.stringify(perfilesGuardados));

  Swal.fire({
    title: "¡Perfil guardado!",
    text: "Tu perfil ha sido registrado. Ahora completa el test de compatibilidad.",
    icon: "success",
    background: "#222",
    color: "#eee",
    confirmButtonColor: "#910f0f"
  });

  mostrarPerfiles();
  activarTestSiHayPerfil();
  document.getElementById("formularioPerfil").reset();
}

// Activar botón del test solo si hay perfil
function activarTestSiHayPerfil() {
  const btnTest = document.getElementById("btnTest");
  if (perfilesGuardados.length === 0) {
    btnTest.disabled = true;
    btnTest.style.opacity = "0.5";
    btnTest.title = "Primero debes completar tu perfil";
  } else {
    btnTest.disabled = false;
    btnTest.style.opacity = "1";
    btnTest.title = "";
  }
}

// Buscar matches compatibles
function buscarMatch(perfil) {
  return perfilesGuardados.filter((p) => {
    if (p === perfil) return false;
    const coincide = (pref, gen) => pref === "ambos" || pref === gen;
    return coincide(perfil.preferencia, p.genero) && coincide(p.preferencia, perfil.genero);
  });
}

function mostrarPerfiles(lista = perfilesGuardados) {
  const contenedor = document.getElementById("resultados");
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    contenedor.appendChild(crearElemento("p", "No hay perfiles que mostrar."));
    return;
  }

  lista.forEach((perfil) => {
    const div = crearElemento("div", null, "perfil-card");
    div.innerHTML = `
      <h3>${perfil.nombre}</h3>
      <div class="contenido-perfil">
        <p>Edad: ${perfil.edad}</p>
        <p>Género: ${perfil.genero}</p>
        <p>Prefiere: ${perfil.preferencia}</p>
        <button class="btn-match">Ver Matches</button>
        <div class="match-result"></div>
        ${perfil.test ? `
          <div class="match-card">
            <strong>Resultado del test:</strong><br>
            ${perfil.test.resultadoTexto.replace(/\n/g, "<br>")}
          </div>
        ` : ""}
      </div>
    `;

    // Efecto acordeón al hacer clic
    div.addEventListener("click", (e) => {
      // Evitar que el botón también lo cierre
      if (!e.target.classList.contains("btn-match")) {
        div.classList.toggle("expanded");
      }
    });

    // Botón para ver matches
    div.querySelector(".btn-match").addEventListener("click", (event) => {
      event.stopPropagation(); // Evitar que se cierre al hacer clic
      const matches = buscarMatch(perfil);
      const matchDiv = div.querySelector(".match-result");
      matchDiv.innerHTML = "";

      if (matches.length === 0) {
        matchDiv.textContent = "No se encontraron matches compatibles.";
      } else {
        matches.forEach((m) => {
          const mDiv = crearElemento("div", null, "match-card");
          mDiv.innerHTML = `<strong>${m.nombre}</strong> (${m.genero}, ${m.edad} años)`;
          matchDiv.appendChild(mDiv);
        });
      }
    });

    contenedor.appendChild(div);
  });
}


// Filtrar perfiles por texto
function filtrarPerfiles(termino) {
  termino = termino.toLowerCase();
  const filtrados = perfilesGuardados.filter((p) =>
    p.nombre.toLowerCase().includes(termino) ||
    p.genero.toLowerCase().includes(termino) ||
    p.preferencia.toLowerCase().includes(termino)
  );
  mostrarPerfiles(filtrados);
}

// Test de compatibilidad swinger
async function realizarCuestionario() {
  const { value: experiencia } = await Swal.fire({
    title: "¿Tienes experiencia en el ambiente swinger?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    background: "#222",
    color: "#eee",
    confirmButtonColor: "#910f0f"
  });

  const { value: interesPareja } = await Swal.fire({
    title: "¿Te interesa asistir en pareja, solo/a o ambos?",
    input: "select",
    inputOptions: {
      pareja: "Pareja",
      solo: "Solo/a",
      ambos: "Ambos"
    },
    inputPlaceholder: "Selecciona una opción",
    background: "#222",
    color: "#eee",
    confirmButtonColor: "#910f0f"
  });

  const { value: tipoLugar } = await Swal.fire({
    title: "¿Prefieres lugares privados, fiestas o clubes?",
    input: "select",
    inputOptions: {
      privados: "Privados",
      fiestas: "Fiestas",
      clubes: "Clubes"
    },
    inputPlaceholder: "Selecciona una opción",
    background: "#222",
    color: "#eee",
    confirmButtonColor: "#910f0f"
  });

  const { value: limites } = await Swal.fire({
    title: "¿Estás abiert@ a experimentar cosas nuevas dentro de tus límites?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    background: "#222",
    color: "#eee",
    confirmButtonColor: "#910f0f"
  });

  let resultado = `Gracias por completar el test, ${nombreUsuario}.<br><br>`;

  if (experiencia && limites) {
    resultado += "¡Parece que tienes mente abierta y experiencia!";
  } else if (!experiencia && limites) {
    resultado += "¡Estás abiert@ a nuevas experiencias, eso es genial para comenzar!";
  } else {
    resultado += "Tal vez prefieras tomar las cosas con calma, ¡y eso también está bien!";
  }

  resultado += `<br><br>Preferencia: ${interesPareja}<br>Ambiente ideal: ${tipoLugar}`;

  await Swal.fire({
    title: "Resultado del Test",
    html: resultado,
    background: "#222",
    color: "#eee",
    confirmButtonColor: "#910f0f"
  });

  const perfilActual = perfilesGuardados[perfilesGuardados.length - 1];
  perfilActual.test = {
    experiencia,
    interesPareja,
    tipoLugar,
    limites,
    resultadoTexto: resultado.replace(/<br>/g, "\n")
  };

  localStorage.setItem("perfiles", JSON.stringify(perfilesGuardados));
  pedirClub();
}

// Recolección de clubes favoritos
async function pedirClub() {
  let respuestas = [];

  for (let i = 0; i < 3; i++) {
    const { value: club } = await Swal.fire({
      title: `Dime tu club favorito (${i + 1}/3)`,
      input: "text",
      inputPlaceholder: "Nombre del club",
      background: "#222",
      color: "#eee",
      confirmButtonColor: "#910f0f"
    });
    if (club) respuestas.push(club);
  }

  await Swal.fire({
    title: "¡Gracias por tus respuestas!",
    html: `<p>Clubs favoritos:</p><ul>${respuestas.map((r) => `<li>${r}</li>`).join("")}</ul>`,
    background: "#222",
    color: "#eee",
    confirmButtonColor: "#910f0f"
  });
}

// Lugares sugeridos
const lugaresSugeridos = [
  {
    nombre: "Fusion Vip",
    ciudad: "Madrid",
    descripcion: "Ambiente selecto con eventos temáticos.",
    imagen: "https://lh3.googleusercontent.com/p/AF1QipOpqWtLhxATdCQt85tl4ljHhxaOS0duhTrUx0pR=s1360-w1360-h1020-rw"
  },
    
    {
    nombre: "Encuentros Vip",
    ciudad: "Madrid",
    descripcion: "Espacio íntimo y exclusivo para parejas modernas.",
    imagen: "https://lh3.googleusercontent.com/p/AF1QipPaAUs3tedyWbN6tFEsGq4qA5JmeR2v5No0jqoh=s1360-w1360-h1020-rw"
  },
  {
    nombre: "Trama Vip",
    ciudad: "Madrid",
    descripcion: "Ideal para conocer veteranos de la vida.",
    imagen: "https://lh3.googleusercontent.com/p/AF1QipOyAIr8uRec5ltT2-S4cu0x-NSnWGeNiW6nrxut=s1360-w1360-h1020-rw"
  }
];

function mostrarLugaresSugeridos() {
  const contenedor = document.getElementById("sugerencias-container");
  if (!contenedor) return;

  lugaresSugeridos.forEach((lugar) => {
    const card = document.createElement("div");
    card.classList.add("lugar-card");

    card.innerHTML = `
      <img src="${lugar.imagen}" alt="${lugar.nombre}" class="lugar-img" />
      <div class="lugar-info">
        <h3>${lugar.nombre}</h3>
        <p><strong>Ciudad:</strong> ${lugar.ciudad}</p>
        <p>${lugar.descripcion}</p>
      </div>
    `;

    contenedor.appendChild(card);
  });
}

// Inicializar el simulador al cargar
document.addEventListener("DOMContentLoaded", () => {
  mostrarPerfiles();
  mostrarLugaresSugeridos();
  activarTestSiHayPerfil();

  const btnTest = document.getElementById("btnTest");
  if (btnTest) {
    btnTest.addEventListener("click", async () => {
      const { value: nombre } = await Swal.fire({
        title: "¡Hola!",
        text: "¿Cuál es tu nombre?",
        input: "text",
        inputPlaceholder: "Tu nombre...",
        background: "#222",
        color: "#eee",
        confirmButtonColor: "#910f0f"
      });

      if (nombre) {
        nombreUsuario = nombre;
        await Swal.fire({
          title: `Bienvenid@ ${nombreUsuario}`,
          text: "Al test de compatibilidad swinger",
          background: "#222",
          color: "#eee",
          confirmButtonColor: "#910f0f"
        });
        realizarCuestionario();
      }
    });
  }

  // Buscador
  document.getElementById("formularioPerfil").addEventListener("submit", guardarPerfil);
  document.getElementById("buscador").addEventListener("input", (e) => {
    filtrarPerfiles(e.target.value);
  });
});



