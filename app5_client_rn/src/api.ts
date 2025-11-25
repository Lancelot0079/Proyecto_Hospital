import Constants from "expo-constants";

// Read API_BASE from possible locations where Expo stores extra config.
const cfgExtra = (Constants.expoConfig?.extra as { API_BASE?: string } | undefined)
  || (Constants.manifest as any)?.extra;

const API_BASE = cfgExtra?.API_BASE || "https://7mnj3mpj-5000.use2.devtunnels.ms";
console.log("api: using API_BASE=", API_BASE, "(from extra?)", !!cfgExtra?.API_BASE);

const API_EQUIPOS = `${API_BASE}/api/equipos`;

async function http<T>(method: string, url: string, body?: unknown): Promise<T> {
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(url, opts);
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export type Equipo = {
  id: number;
  tipo: "tecnologico" | "biomedico";
  categoria: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  estado: "ingresado" | "en_revision" | "autorizado" | "rechazado" | "retirado";
  condicion: "operativo" | "averiado" | "contaminado" | "desconocido";
  servicio?: string;
  responsable_externo?: string;
  observaciones?: string;
  fecha_ingreso: string;
  creado_en: string;
  actualizado_en: string;
};

export const api = {
  listar: (filtros?: { tipo?: string; estado?: string; texto?: string }) => {
    const params = new URLSearchParams();
    if (filtros?.tipo) params.append('tipo', filtros.tipo);
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.texto) params.append('q', filtros.texto);
    
    return http<Equipo[]>("GET", `${API_EQUIPOS}?${params.toString()}`);
  },
  crear: (payload: Omit<Equipo, "id" | "fecha_ingreso" | "creado_en" | "actualizado_en">) => 
    http<Equipo>("POST", API_EQUIPOS, payload),
  actualizar: (id: number, payload: Partial<Equipo>) => 
    http<Equipo>("PUT", `${API_EQUIPOS}/${id}`, payload),
  eliminar: (id: number) => 
    http<{ ok: boolean }>("DELETE", `${API_EQUIPOS}/${id}`),
};