import { useState } from "react";

export default function EquipoRow({ equipo, onSave, onDelete }) {
  const [categoria, setCategoria] = useState(equipo.categoria || "");
  const [marca, setMarca] = useState(equipo.marca || "");
  const [modelo, setModelo] = useState(equipo.modelo || "");
  const [serie, setSerie] = useState(equipo.serie || "");
  const [estado, setEstado] = useState(equipo.estado || "ingresado");
  const [condicion, setCondicion] = useState(equipo.condicion || "operativo");
  const [servicio, setServicio] = useState(equipo.servicio || "");
  const [responsable, setResponsable] = useState(equipo.responsable_externo || "");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const guardar = async () => {
    if (!categoria.trim()) {
      alert("Error: La categoría es requerida");
      return;
    }

    try {
      setSaving(true);
      await onSave(equipo.id, {
        tipo: equipo.tipo,
        categoria: categoria.trim(),
        marca: marca.trim(),
        modelo: modelo.trim(),
        serie: serie.trim(),
        estado,
        condicion,
        servicio: servicio.trim(),
        responsable_externo: responsable.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async () => {
    if (!window.confirm("¿Eliminar este equipo?")) return;
    
    try {
      setDeleting(true);
      await onDelete(equipo.id);
    } finally {
      setDeleting(false);
    }
  };

  const getTipoBadge = () => (
    <span className={`badge ${equipo.tipo === "biomedico" ? "bg-danger" : "bg-primary"}`}>
      {equipo.tipo === "biomedico" ? "Biomédico" : "Tecnológico"}
    </span>
  );

  const getEstadoBadge = () => {
    const estadoStyles = {
      ingresado: "bg-warning text-dark",
      en_revision: "bg-info text-dark",
      autorizado: "bg-success",
      rechazado: "bg-danger",
      retirado: "bg-secondary"
    };

    return (
      <span className={`badge ${estadoStyles[estado]}`}>
        {estado.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getCondicionBadge = () => {
    const condicionStyles = {
      operativo: "bg-success",
      averiado: "bg-danger",
      contaminado: "bg-warning",
      desconocido: "bg-secondary"
    };

    return (
      <span className={`badge ${condicionStyles[condicion]}`}>
        {condicion.toUpperCase()}
      </span>
    );
  };

  return (
    <tr>
      <td>{equipo.id}</td>
      <td>{getTipoBadge()}</td>
      <td>
        <input
          className="form-control form-control-sm"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Categoría *"
        />
      </td>
      <td>
        <input
          className="form-control form-control-sm mb-1"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          placeholder="Marca"
        />
        <input
          className="form-control form-control-sm"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          placeholder="Modelo"
        />
      </td>
      <td>
        <input
          className="form-control form-control-sm"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          placeholder="Serie"
        />
      </td>
      <td>
        <select
          className="form-select form-select-sm"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="ingresado">Ingresado</option>
          <option value="en_revision">En revisión</option>
          <option value="autorizado">Autorizado</option>
          <option value="rechazado">Rechazado</option>
          <option value="retirado">Retirado</option>
        </select>
      </td>
      <td>
        <select
          className="form-select form-select-sm"
          value={condicion}
          onChange={(e) => setCondicion(e.target.value)}
        >
          <option value="operativo">Operativo</option>
          <option value="averiado">Averiado</option>
          <option value="contaminado">Contaminado</option>
          <option value="desconocido">Desconocido</option>
        </select>
      </td>
      <td>
        <input
          className="form-control form-control-sm"
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
          placeholder="Servicio"
        />
      </td>
      <td>
        <input
          className="form-control form-control-sm"
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          placeholder="Responsable"
        />
      </td>
      <td>
        <small>
          {equipo.fecha_ingreso ? new Date(equipo.fecha_ingreso).toLocaleDateString() : 'N/A'}
        </small>
      </td>
      <td className="text-nowrap">
        <button 
          className="btn btn-sm btn-success me-1" 
          onClick={guardar}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button 
          className="btn btn-sm btn-danger" 
          onClick={eliminar}
          disabled={deleting}
        >
          {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </td>
    </tr>
  );
}