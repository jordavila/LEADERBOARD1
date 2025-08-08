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

        // Extraer filas como objetos {name, score}
        const rows = json.table.rows.map(r => ({
          name: r.c[0]?.v || "Sin nombre",
          score: parseInt(r.c[1]?.v || "0")
        }));

        // Ordenar por puntaje descendente
        rows.sort((a, b) => b.score - a.score);

        // Filtrar jugadores activos entre filas 2 y 5 (índices 1 a 4)
        const jugadoresActivos = rows.slice(1, 5).filter(j => j.name !== "Sin nombre");

        // Determinar la asignación de consecutivos según la cantidad de jugadores activos
        let asignacion = {};
        if (jugadoresActivos.length === 2) {
          asignacion[jugadoresActivos[0].name] = 1; // Alegre
          asignacion[jugadoresActivos[1].name] = 4; // Llorando
        } 
        else if (jugadoresActivos.length === 3) {
          asignacion[jugadoresActivos[0].name] = 1; // Alegre
          asignacion[jugadoresActivos[1].name] = 2; // Serio
          asignacion[jugadoresActivos[2].name] = 4; // Llorando
        } 
        else if (jugadoresActivos.length > 3) {
          asignacion[jugadoresActivos[0].name] = 1; // Alegre
          asignacion[jugadoresActivos[1].name] = 2; // Serio
          asignacion[jugadoresActivos[2].name] = 3; // Triste
          asignacion[jugadoresActivos[3].name] = 4; // Llorando
        }

        // Limpiar leaderboard antes de redibujar
        container.innerHTML = "";

        // Mostrar el top 10
        rows.slice(0, 10).forEach(entry => {
          const div = document.createElement("div");
          div.className = "entry";

          let imagenHTML = "";

          // Si el jugador tiene asignado un consecutivo, se construye la ruta de la imagen
          if (asignacion[entry.name]) {
            const rutaImagen = `${entry.name}_${asignacion[entry.name]}.png`;
            imagenHTML = `<img src="${rutaImagen}" class="miniatura" onerror="this.style.display='none'">`;
          }

          // Construir el HTML de la entrada con posible miniatura
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

