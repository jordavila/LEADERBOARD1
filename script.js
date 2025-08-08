const sheetID = "1K1i2yCRTwXyU_CnqZz9QvP8ykzXDB-ZNRibvEmjmLQs";
const sheetName = "Sheet1";
const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

const container = document.getElementById("leaderboard");

function cargarLeaderboard() {
  fetch(url)
    .then(res => res.text())
    .then(text => {
      try {
        const json = JSON.parse(text.substr(47).slice(0, -2));

        // Mapeamos filas con soporte para valores calculados por fórmula
        const rows = json.table.rows.map(r => {
          const rawScore = r.c[1]?.v ?? r.c[1]?.f ?? 0; // v si existe, si no f, si no 0
          return {
            name: r.c[0]?.v || "Sin nombre",
            score: parseInt(rawScore) || 0
          };
        });

        // ----------- 1) Determinar asignación de imágenes usando el orden de la hoja (filas 2–5) -----------

        // Jugadores activos en filas 2 a 5 según hoja original
        const jugadoresActivos = rows.slice(1, 5).filter(j => j.name !== "Sin nombre");

        let asignacion = {};
        if (jugadoresActivos.length === 2) {
          asignacion[jugadoresActivos[0].name] = 1;
          asignacion[jugadoresActivos[1].name] = 4;
        } 
        else if (jugadoresActivos.length === 3) {
          asignacion[jugadoresActivos[0].name] = 1;
          asignacion[jugadoresActivos[1].name] = 2;
          asignacion[jugadoresActivos[2].name] = 4;
        } 
        else if (jugadoresActivos.length > 3) {
          asignacion[jugadoresActivos[0].name] = 1;
          asignacion[jugadoresActivos[1].name] = 2;
          asignacion[jugadoresActivos[2].name] = 3;
          asignacion[jugadoresActivos[3].name] = 4;
        }

        // ----------- 2) Ordenar para mostrar el leaderboard por kills (segunda columna) -----------
        const top = [...rows].sort((a, b) => b.score - a.score).slice(0, 10);

        // Limpiar antes de dibujar
        container.innerHTML = "";

        top.forEach(entry => {
          const div = document.createElement("div");
          div.className = "entry";

          let imagenHTML = "";

          // Limpiar nombre para la ruta del archivo
          const nombreLimpio = entry.name.trim().replace(/\s+/g, '_');

          if (asignacion[entry.name]) {
            const rutaImagen = `${nombreLimpio}_${asignacion[entry.name]}.png`;
            console.log("Intentando cargar:", rutaImagen); // Depuración
            imagenHTML = `<img src="${rutaImagen}" class="miniatura" onerror="this.style.display='none'">`;
          }

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

cargarLeaderboard();
setInterval(cargarLeaderboard, 5000);
