import { useState } from "react";
import { View, TextInput, Text, Pressable, StyleSheet } from "react-native";
import type { Equipo } from "../api";

type Props = {
  equipo: Equipo;
  onSave: (id: number, payload: Partial<Equipo>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export default function EquipoItem({ equipo, onSave, onDelete }: Props) {
  const [categoria, setCategoria] = useState(equipo.categoria);
  const [marca, setMarca] = useState(equipo.marca || "");
  const [modelo, setModelo] = useState(equipo.modelo || "");
  const [serie, setSerie] = useState(equipo.serie || "");
  const [estado, setEstado] = useState(equipo.estado);
  const [condicion, setCondicion] = useState(equipo.condicion);
  const [servicio, setServicio] = useState(equipo.servicio || "");
  const [responsable, setResponsable] = useState(equipo.responsable_externo || "");
  const [observaciones, setObservaciones] = useState(equipo.observaciones || "");
  
  const [busy, setBusy] = useState<"save" | "del" | null>(null);

  const save = async () => {
    if (!categoria.trim()) return;
    try {
      setBusy("save");
      await onSave(equipo.id, {
        tipo: equipo.tipo,
        categoria: categoria.trim(),
        marca: marca.trim() || undefined,
        modelo: modelo.trim() || undefined,
        serie: serie.trim() || undefined,
        estado,
        condicion,
        servicio: servicio.trim() || undefined,
        responsable_externo: responsable.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
      });
    } finally {
      setBusy(null);
    }
  };

  const del = async () => {
    try {
      setBusy("del");
      await onDelete(equipo.id);
    } finally {
      setBusy(null);
    }
  };

  const getTipoBadge = () => (
    <View style={[
      styles.badge, 
      equipo.tipo === "biomedico" ? styles.badgeBiomedico : styles.badgeTecnologico
    ]}>
      <Text style={styles.badgeText}>
        {equipo.tipo === "biomedico" ? "BIOMÉDICO" : "TECNOLÓGICO"}
      </Text>
    </View>
  );

  const getEstadoBadge = () => {
    const estadoColors = {
      ingresado: "#ffc107",
      en_revision: "#17a2b8", 
      autorizado: "#28a745",
      rechazado: "#dc3545",
      retirado: "#6c757d"
    };

    return (
      <View style={[styles.badge, { backgroundColor: estadoColors[estado] }]}>
        <Text style={styles.badgeText}>
          {estado.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* Header con ID y badges */}
      <View style={styles.header}>
        <Text style={styles.id}>#{equipo.id}</Text>
        {getTipoBadge()}
        {getEstadoBadge()}
      </View>

      {/* Campos editables */}
      <TextInput 
        style={styles.input} 
        value={categoria} 
        onChangeText={setCategoria} 
        placeholder="Categoría *" 
      />
      
      <View style={styles.row}>
        <TextInput 
          style={[styles.input, styles.flex1]} 
          value={marca} 
          onChangeText={setMarca} 
          placeholder="Marca" 
        />
        <TextInput 
          style={[styles.input, styles.flex1, styles.marginLeft]} 
          value={modelo} 
          onChangeText={setModelo} 
          placeholder="Modelo" 
        />
      </View>

      <TextInput 
        style={styles.input} 
        value={serie} 
        onChangeText={setSerie} 
        placeholder="Número de serie" 
      />

      {/* Selectores de Estado y Condición */}
      <View style={styles.row}>
        <View style={[styles.flex1, styles.pickerContainer]}>
          <Text style={styles.label}>Estado:</Text>
          <View style={styles.picker}>
            {["ingresado", "en_revision", "autorizado", "rechazado", "retirado"].map((opt) => (
              <Pressable
                key={opt}
                style={[
                  styles.pickerOption,
                  estado === opt && styles.pickerOptionSelected
                ]}
                onPress={() => setEstado(opt as any)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  estado === opt && styles.pickerOptionTextSelected
                ]}>
                  {opt.replace('_', ' ')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.flex1, styles.pickerContainer, styles.marginLeft]}>
          <Text style={styles.label}>Condición:</Text>
          <View style={styles.picker}>
            {["operativo", "averiado", "contaminado", "desconocido"].map((opt) => (
              <Pressable
                key={opt}
                style={[
                  styles.pickerOption,
                  condicion === opt && styles.pickerOptionSelected
                ]}
                onPress={() => setCondicion(opt as any)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  condicion === opt && styles.pickerOptionTextSelected
                ]}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <TextInput 
        style={styles.input} 
        value={servicio} 
        onChangeText={setServicio} 
        placeholder="Servicio (ej: TI, Cardiología)" 
      />

      <TextInput 
        style={styles.input} 
        value={responsable} 
        onChangeText={setResponsable} 
        placeholder="Responsable externo" 
      />

      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={observaciones} 
        onChangeText={setObservaciones} 
        placeholder="Observaciones" 
        multiline
        numberOfLines={2}
      />

      <Text style={styles.fecha}>
        Ingreso: {equipo.fecha_ingreso ? new Date(equipo.fecha_ingreso).toLocaleDateString() : 'N/A'}
      </Text>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.success]} onPress={save} disabled={busy !== null}>
          <Text style={styles.btnText}>{busy === "save" ? "Guardando…" : "Guardar"}</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.danger]} onPress={del} disabled={busy !== null}>
          <Text style={styles.btnText}>{busy === "del" ? "Eliminando…" : "Eliminar"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    padding: 16, 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  id: { 
    fontWeight: "600", 
    fontSize: 16,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  badgeTecnologico: { backgroundColor: "#007bff" },
  badgeBiomedico: { backgroundColor: "#dc3545" },
  input: { 
    borderWidth: 1, 
    borderColor: "#ddd", 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 14,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 8,
  },
  pickerContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
    fontWeight: '500',
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerOption: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  pickerOptionSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  pickerOptionText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  fecha: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  actions: { 
    flexDirection: "row", 
    gap: 8 
  },
  btn: { 
    flex: 1,
    paddingVertical: 12, 
    borderRadius: 8,
    alignItems: 'center',
  },
  success: { backgroundColor: "#198754" },
  danger: { backgroundColor: "#dc3545" },
  btnText: { color: "#fff", fontWeight: "600" },
});