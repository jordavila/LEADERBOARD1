// ID y nombre de la hoja de Google Sheets
const sheetID = "1K1i2yCRTwXyU_CnqZz9QvP8ykzXDB-ZNRibvEmjmLQs";
const sheetName = "Sheet1";
const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

// Contenedor del leaderboard en el HTML
const container = document.getElementById("leaderboard");

// Función principal que carga y actualiza el leaderboard
function cargarLeaderboard() {
  fetch(url)
    .then(res => res.text())
    .then(text => {
      try {
        // Google Sheets devuelve datos con texto extra al inicio y final, por eso limpiamos con substr y slice
        const json = JSON.parse(text.substr(47).slice(0, -2));

        // Convertimos cada fila en un objeto { name, score }
        const rows = json.table.rows.map(r => ({
          name: r.c[0]?.v || "Sin nombre", // Columna A → nombre del jugador
          score: parseInt(r.c[1]?.v || "0") // Columna B → puntuación
        }));

        // Ordenamos los jugadores por puntaje de mayor a menor
        rows.sort((a, b) => b.score - a.score);

        // Tomamos solo los 10 mejores para mostrar en el leaderboard
        const top = rows.slice(0, 10);

        // Contamos cuántas filas activas hay entre fila 2 y 5 del archivo original
        // NOTA: fila 1 es título, fila 6 es comentarios → por eso tomamos índice 1 a 4
        const jugadoresActivos = rows.slice(1, 5).filter(j => j.name !== "Sin nombre");

        // Limpiamos el contenedor antes de volver a dibujar
        container.innerHTML = "";

        // Recorremos el top y dibujamos cada jugador
        top.forEach((entry, index) => {
          const div = document.createElement("div");
          div.className = "entry";

          let imagenHTML = ""; // Aquí guardaremos la etiqueta <img> si corresponde

          // ----- LÓGICA PARA AGREGAR MINIATURA -----
          // Solo se ejecuta si hay más de un jugador activo en filas 2 a 5
          if (jugadoresActivos.length > 1) {
            let consecutivo = null;

            // Caso especial: si hay exactamente 2 jugadores activos
            if (jugadoresActivos.length === 2) {
              if (index === 0) consecutivo = 1; // Alegre
              else if (index === 1) consecutivo = 4; // Llorando
            }

            // Caso especial: si hay exactamente 3 jugadores activos
            else if (jugadoresActivos.length === 3) {
              if (index === 0) consecutivo = 1; // Alegre
              else if (index === 1) consecutivo = 2; // Serio
              else if (index === 2) consecutivo = 4; // Llorando
            }

            // Caso general: más de 3 jugadores → buscar la posición real de JADO82 entre filas 2 a 5
            else {
              const posicionEnRango = jugadoresActivos.findIndex(j => j.name === "JADO82");
              if (posicionEnRango !== -1) {
                // posiciónEnRango será 0 para fila 2, 1 para fila 3, etc.
                consecutivo = posicionEnRango + 1;
              }
            }

            // Si este jugador es JADO82 y tenemos un consecutivo válido, generamos la ruta de imagen
            if (entry.name === "JADO82" && consecutivo) {
              const rutaImagen = `${entry.name}_${consecutivo}.PNG`;

              // Generamos HTML para la imagen (si el archivo no existe, el atributo onerror lo oculta)
              imagenHTML = `<img src="${rutaImagen}" class="miniatura" onerror="this.style.display='none'">`;
            }
          }

          // Dibujamos la fila con (o sin) miniatura
          div.innerHTML = `<div class="name">${imagenHTML} ${entry.name}</div><div class="score">${entry.score}</div>`;
          container.appendChild(div);
        });

      } catch (error) {
        container.innerHTML = `<div style="color:red;padding:10px">⚠️ Error al procesar los datos: ${error.message}</div>`;
      }
    })
    .catch(err => {
      container.innerHTML = `<div style="color:orange;padding:10px">❌ No se pudo cargar la hoja: ${err.message}</div>`;
    });
}

// Carga inicial del leaderboard
cargarLeaderboard();

// Actualización automática cada 5 segundos
setInterval(cargarLeaderboard, 5000);

