// Variables globales para filtros
let filtrosActuales = {
    tipo: '',
    estado: '',
    texto: ''
};

async function listar() {
    const tbody = document.querySelector("#tbody");
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">Cargando…</td></tr>`;
    
    try {
        // Construir URL con filtros
        const params = new URLSearchParams();
        if (filtrosActuales.tipo) params.append('tipo', filtrosActuales.tipo);
        if (filtrosActuales.estado) params.append('estado', filtrosActuales.estado);
        if (filtrosActuales.texto) params.append('q', filtrosActuales.texto);
        
        const url = `${API_EQUIPOS}?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        tbody.innerHTML = "";
        for (const e of data) {
            const tr = document.createElement("tr");
            tr.dataset.id = e.id;
            tr.innerHTML = `
                <td>${e.id}</td>
                <td>
                    ${e.tipo === "biomedico" ? 
                        '<span class="badge bg-danger">Biomédico</span>' : 
                        '<span class="badge bg-primary">Tecnológico</span>'}
                </td>
                <td><input class="form-control form-control-sm categoria" value="${e.categoria || ''}"></td>
                <td>
                    <input class="form-control form-control-sm marca" value="${e.marca || ''}" placeholder="Marca">
                    <input class="form-control form-control-sm mt-1 modelo" value="${e.modelo || ''}" placeholder="Modelo">
                </td>
                <td><input class="form-control form-control-sm serie" value="${e.serie || ''}"></td>
                <td>
                    <select class="form-select form-select-sm estado">
                        <option value="ingresado" ${e.estado === 'ingresado' ? 'selected' : ''}>Ingresado</option>
                        <option value="en_revision" ${e.estado === 'en_revision' ? 'selected' : ''}>En revisión</option>
                        <option value="autorizado" ${e.estado === 'autorizado' ? 'selected' : ''}>Autorizado</option>
                        <option value="rechazado" ${e.estado === 'rechazado' ? 'selected' : ''}>Rechazado</option>
                        <option value="retirado" ${e.estado === 'retirado' ? 'selected' : ''}>Retirado</option>
                    </select>
                </td>
                <td>
                    <select class="form-select form-select-sm condicion">
                        <option value="operativo" ${e.condicion === 'operativo' ? 'selected' : ''}>Operativo</option>
                        <option value="averiado" ${e.condicion === 'averiado' ? 'selected' : ''}>Averiado</option>
                        <option value="contaminado" ${e.condicion === 'contaminado' ? 'selected' : ''}>Contaminado</option>
                        <option value="desconocido" ${e.condicion === 'desconocido' ? 'selected' : ''}>Desconocido</option>
                    </select>
                </td>
                <td><input class="form-control form-control-sm servicio" value="${e.servicio || ''}"></td>
                <td><input class="form-control form-control-sm responsable" value="${e.responsable_externo || ''}"></td>
                <td><small>${e.fecha_ingreso ? new Date(e.fecha_ingreso).toLocaleDateString() : '-'}</small></td>
                <td class="text-nowrap">
                    <button class="btn btn-sm btn-success me-1" data-action="save">Guardar</button>
                    <button class="btn btn-sm btn-danger" data-action="del">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" class="text-center text-muted">No se encontraron equipos</td></tr>`;
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-danger">Error listando: ${err.message}</td></tr>`;
    }
}

// Manejo de eventos para guardar y eliminar
document.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const tr = btn.closest("tr");
    const id = tr?.dataset.id;
    const action = btn.dataset.action;

    if (action === "save") {
        const tipo = tr.querySelector('td:nth-child(2) .badge').textContent === 'Biomédico' ? 'biomedico' : 'tecnologico';
        const categoria = tr.querySelector(".categoria").value.trim();
        const marca = tr.querySelector(".marca").value.trim();
        const modelo = tr.querySelector(".modelo").value.trim();
        const serie = tr.querySelector(".serie").value.trim();
        const estado = tr.querySelector(".estado").value;
        const condicion = tr.querySelector(".condicion").value;
        const servicio = tr.querySelector(".servicio").value.trim();
        const responsable_externo = tr.querySelector(".responsable").value.trim();

        if (!categoria) return showAlert("La categoría es requerida", "warning");

        btn.setAttribute("disabled", "disabled");
        try {
            const res = await fetch(`${API_EQUIPOS}/${id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ 
                    tipo, categoria, marca, modelo, serie, 
                    estado, condicion, servicio, responsable_externo 
                })
            });
            if (!res.ok) {
                let errorText = "";
                try { errorText = (await res.json()).error || ""; } catch {}
                throw new Error(errorText || `HTTP ${res.status}`);
            }
            showAlert("Equipo actualizado correctamente", "success");
            await listar();
        } catch (err) {
            showAlert(`Error actualizando: ${err.message}`, "danger");
        } finally {
            btn.removeAttribute("disabled");
        }
    }

    if (action === "del") {
        if (!confirm("¿Eliminar este equipo?")) return;
        btn.setAttribute("disabled", "disabled");
        try {
            const res = await fetch(`${API_EQUIPOS}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            showAlert("Equipo eliminado correctamente", "success");
            await listar();
        } catch (err) {
            showAlert(`Error eliminando: ${err.message}`, "danger");
        } finally {
            btn.removeAttribute("disabled");
        }
    }
});

// Función para mostrar alertas
function showAlert(msg, type = "info") {
    const box = document.querySelector("#alerta");
    box.className = `alert alert-${type}`;
    box.textContent = msg;
    box.classList.remove("d-none");
    clearTimeout(showAlert._t);
    showAlert._t = setTimeout(() => box.classList.add("d-none"), 3000);
}

// Formulario de creación
document.querySelector("#formNuevo").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = form.querySelector("button[type=submit]") || form.querySelector("button");
    btn?.setAttribute("disabled", "disabled");

    try {
        const fd = new FormData(form);
        const payload = {
            tipo: (fd.get("tipo") || "").trim(),
            categoria: (fd.get("categoria") || "").trim(),
            marca: (fd.get("marca") || "").trim(),
            modelo: (fd.get("modelo") || "").trim(),
            serie: (fd.get("serie") || "").trim(),
            estado: (fd.get("estado") || "ingresado"),
            condicion: (fd.get("condicion") || "operativo"),
            servicio: (fd.get("servicio") || "").trim(),
            responsable_externo: (fd.get("responsable_externo") || "").trim(),
            observaciones: (fd.get("observaciones") || "").trim()
        };

        if (!payload.categoria) {
            showAlert("La categoría es requerida", "warning");
            return;
        }
        if (!payload.tipo) {
            showAlert("El tipo es requerido", "warning");
            return;
        }

        const res = await fetch(API_EQUIPOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            let errorText = "";
            try { errorText = (await res.json()).error || ""; } catch {}
            throw new Error(errorText || `HTTP ${res.status}`);
        }

        form.reset();
        showAlert("Equipo creado con éxito", "success");
        await listar();
    } catch (err) {
        showAlert(`Error creando equipo: ${err.message}`, "danger");
    } finally {
        btn?.removeAttribute("disabled");
    }
});

// Filtros
document.querySelector("#filtroTipo").addEventListener("change", (e) => {
    filtrosActuales.tipo = e.target.value;
    listar();
});

document.querySelector("#filtroEstado").addEventListener("change", (e) => {
    filtrosActuales.estado = e.target.value;
    listar();
});

document.querySelector("#filtroTexto").addEventListener("input", (e) => {
    filtrosActuales.texto = e.target.value;
    listar();
});

document.querySelector("#btnRefrescar").addEventListener("click", listar);
document.querySelector("#btnLimpiarFiltros").addEventListener("click", () => {
    document.querySelector("#filtroTipo").value = '';
    document.querySelector("#filtroEstado").value = '';
    document.querySelector("#filtroTexto").value = '';
    filtrosActuales = { tipo: '', estado: '', texto: '' };
    listar();
});

// Primera carga
listar();