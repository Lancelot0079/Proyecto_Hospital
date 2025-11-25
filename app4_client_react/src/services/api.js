const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000";
const API_EQUIPOS = `${API_BASE}/api/equipos`;

async function http(method, url, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  let data = null;
  try {
    data = await res.json();
  } catch (_) {}
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.texto) params.append('q', filtros.texto);
    
    return http("GET", `${API_EQUIPOS}?${params.toString()}`);
  },
  crear: (payload) => http("POST", API_EQUIPOS, payload),
  actualizar: (id, payload) => http("PUT", `${API_EQUIPOS}/${id}`, payload),
  eliminar: (id) => http("DELETE", `${API_EQUIPOS}/${id}`),
};