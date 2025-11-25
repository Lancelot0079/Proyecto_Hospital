import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "./services/api";
import EquipoRow from "./components/EquipoRow";
import AlertBox from "./components/AlertBox";

export default function App() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ msg: "", type: "info" });

  // Estado para nuevo equipo
  const [nuevoEquipo, setNuevoEquipo] = useState({
    tipo: "tecnologico",
    categoria: "",
    marca: "",
    modelo: "",
    serie: "",
    estado: "ingresado",
    condicion: "operativo",
    servicio: "",
    responsable_externo: "",
    observaciones: ""
  });
  const [creating, setCreating] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    tipo: "",
    estado: "",
    texto: ""
  });

  // Usar useCallback para evitar el warning de dependencias
  const cargar = useCallback(async (filtrosAplicar = filtros) => {
    setLoading(true);
    try {
      const data = await api.listar(filtrosAplicar);
      setEquipos(data);
    } catch (e) {
      setAlert({ msg: `Error listando: ${e.message}`, type: "danger" });
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const aplicarFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    cargar(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    const filtrosLimpiados = { tipo: "", estado: "", texto: "" };
    setFiltros(filtrosLimpiados);
    cargar(filtrosLimpiados);
  };

  const crear = async (e) => {
    e.preventDefault();
    if (!nuevoEquipo.categoria.trim()) {
      setAlert({ msg: "La categoría es requerida", type: "warning" });
      return;
    }

    try {
      setCreating(true);
      await api.crear(nuevoEquipo);
      setNuevoEquipo({
        tipo: "tecnologico",
        categoria: "",
        marca: "",
        modelo: "",
        serie: "",
        estado: "ingresado",
        condicion: "operativo",
        servicio: "",
        responsable_externo: "",
        observaciones: ""
      });
      setAlert({ msg: "Equipo creado con éxito", type: "success" });
      await cargar();
    } catch (e) {
      setAlert({ msg: `Error creando: ${e.message}`, type: "danger" });
    } finally {
      setCreating(false);
    }
  };

  const guardar = async (id, payload) => {
    try {
      await api.actualizar(id, payload);
      setAlert({ msg: "Equipo actualizado", type: "success" });
      await cargar();
    } catch (e) {
      setAlert({ msg: `Error actualizando: ${e.message}`, type: "danger" });
    }
  };

  const eliminar = async (id) => {
    try {
      await api.eliminar(id);
      setAlert({ msg: "Equipo eliminado", type: "success" });
      await cargar();
    } catch (e) {
      setAlert({ msg: `Error eliminando: ${e.message}`, type: "danger" });
    }
  };

  const estadisticas = useMemo(() => {
    const total = equipos.length;
    const tecnologicos = equipos.filter(e => e.tipo === "tecnologico").length;
    const biomedicos = equipos.filter(e => e.tipo === "biomedico").length;
    const enRevision = equipos.filter(e => e.estado === "en_revision").length;

    return { total, tecnologicos, biomedicos, enRevision };
  }, [equipos]);

  return (
    <div className="container py-4">
      <h3 className="mb-3">App3 (React) → Sistema de Equipos Hospitalarios</h3>
      <p className="text-muted">Consumiendo API de App1 (/api/equipos)</p>

      <AlertBox
        msg={alert.msg}
        type={alert.type}
        onHide={() => setAlert({ msg: "", type: "info" })}
      />

      {/* Estadísticas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-primary">{estadisticas.total}</h5>
              <p className="card-text">Total Equipos</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-info">{estadisticas.tecnologicos}</h5>
              <p className="card-text">Tecnológicos</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-danger">{estadisticas.biomedicos}</h5>
              <p className="card-text">Biomédicos</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-warning">{estadisticas.enRevision}</h5>
              <p className="card-text">En Revisión</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Panel de Filtros */}
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Filtros</h5>
              <div className="row g-2 align-items-end">
                <div className="col-md-3">
                  <label className="form-label">Tipo</label>
                  <select 
                    className="form-select"
                    value={filtros.tipo}
                    onChange={(e) => aplicarFiltros({...filtros, tipo: e.target.value})}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="tecnologico">Tecnológico</option>
                    <option value="biomedico">Biomédico</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Estado</label>
                  <select 
                    className="form-select"
                    value={filtros.estado}
                    onChange={(e) => aplicarFiltros({...filtros, estado: e.target.value})}
                  >
                    <option value="">Todos los estados</option>
                    <option value="ingresado">Ingresado</option>
                    <option value="en_revision">En revisión</option>
                    <option value="autorizado">Autorizado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="retirado">Retirado</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Buscar</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={filtros.texto}
                    onChange={(e) => aplicarFiltros({...filtros, texto: e.target.value})}
                    placeholder="Categoría, marca, modelo, serie..."
                  />
                </div>
                <div className="col-md-2">
                  <button className="btn btn-outline-secondary w-100" onClick={limpiarFiltros}>
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Equipos */}
        <div className="col-lg-8">
          <div className="d-flex align-items-center gap-2 mb-3">
            <h5 className="mb-0">Equipos Registrados</h5>
            <button className="btn btn-sm btn-outline-primary" onClick={cargar} disabled={loading}>
              {loading ? "Cargando..." : "Refrescar"}
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Marca/Modelo</th>
                  <th>Serie</th>
                  <th>Estado</th>
                  <th>Condición</th>
                  <th>Servicio</th>
                  <th>Responsable</th>
                  <th>Ingreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="11" className="text-center text-muted">
                      Cargando equipos...
                    </td>
                  </tr>
                )}
                {!loading && equipos.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center text-muted">
                      No se encontraron equipos
                    </td>
                  </tr>
                )}
                {!loading && equipos.map((equipo) => (
                  <EquipoRow 
                    key={equipo.id} 
                    equipo={equipo} 
                    onSave={guardar} 
                    onDelete={eliminar} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulario de Creación */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Registrar Nuevo Equipo</h5>
              <form onSubmit={crear} className="vstack gap-2">
                <div>
                  <label className="form-label">Tipo *</label>
                  <select 
                    className="form-select"
                    value={nuevoEquipo.tipo}
                    onChange={(e) => setNuevoEquipo({...nuevoEquipo, tipo: e.target.value})}
                    required
                  >
                    <option value="tecnologico">Tecnológico</option>
                    <option value="biomedico">Biomédico</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Categoría *</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={nuevoEquipo.categoria}
                    onChange={(e) => setNuevoEquipo({...nuevoEquipo, categoria: e.target.value})}
                    placeholder="Ej: Laptop, Electrocardiógrafo"
                    required
                  />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label">Marca</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={nuevoEquipo.marca}
                      onChange={(e) => setNuevoEquipo({...nuevoEquipo, marca: e.target.value})}
                      placeholder="Ej: Dell, GE"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Modelo</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={nuevoEquipo.modelo}
                      onChange={(e) => setNuevoEquipo({...nuevoEquipo, modelo: e.target.value})}
                      placeholder="Ej: Latitude 5440"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Número de Serie</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={nuevoEquipo.serie}
                    onChange={(e) => setNuevoEquipo({...nuevoEquipo, serie: e.target.value})}
                    placeholder="Número único de serie"
                  />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label">Estado</label>
                    <select 
                      className="form-select"
                      value={nuevoEquipo.estado}
                      onChange={(e) => setNuevoEquipo({...nuevoEquipo, estado: e.target.value})}
                    >
                      <option value="ingresado">Ingresado</option>
                      <option value="en_revision">En revisión</option>
                      <option value="autorizado">Autorizado</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label">Condición</label>
                    <select 
                      className="form-select"
                      value={nuevoEquipo.condicion}
                      onChange={(e) => setNuevoEquipo({...nuevoEquipo, condicion: e.target.value})}
                    >
                      <option value="operativo">Operativo</option>
                      <option value="averiado">Averiado</option>
                      <option value="contaminado">Contaminado</option>
                      <option value="desconocido">Desconocido</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Servicio</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={nuevoEquipo.servicio}
                    onChange={(e) => setNuevoEquipo({...nuevoEquipo, servicio: e.target.value})}
                    placeholder="Ej: TI, Cardiología"
                  />
                </div>
                <div>
                  <label className="form-label">Responsable Externo</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={nuevoEquipo.responsable_externo}
                    onChange={(e) => setNuevoEquipo({...nuevoEquipo, responsable_externo: e.target.value})}
                    placeholder="Empresa o persona responsable"
                  />
                </div>
                <div>
                  <label className="form-label">Observaciones</label>
                  <textarea 
                    className="form-control"
                    value={nuevoEquipo.observaciones}
                    onChange={(e) => setNuevoEquipo({...nuevoEquipo, observaciones: e.target.value})}
                    placeholder="Notas adicionales"
                    rows="2"
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary mt-2"
                  disabled={creating}
                >
                  {creating ? "Creando..." : "Registrar Equipo"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}