import { useEffect, useMemo, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  Pressable, 
  Alert, 
  StyleSheet,
  ScrollView 
} from "react-native";
import { api, type Equipo } from "../api";
import EquipoItem from "../components/EquipoItem";

export default function EquiposListScreen() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para nuevo equipo
  const [nuevoEquipo, setNuevoEquipo] = useState({
    tipo: "tecnologico" as "tecnologico" | "biomedico",
    categoria: "",
    marca: "",
    modelo: "",
    serie: "",
    estado: "ingresado" as "ingresado",
    condicion: "operativo" as "operativo",
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

  const cargar = async (filtrosAplicar = filtros) => {
    setLoading(true);
    try {
      const data = await api.listar(filtrosAplicar);
      setEquipos(data);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    cargar(); 
  }, []);

  const aplicarFiltros = (nuevosFiltros: typeof filtros) => {
    setFiltros(nuevosFiltros);
    cargar(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    const filtrosLimpiados = { tipo: "", estado: "", texto: "" };
    setFiltros(filtrosLimpiados);
    cargar(filtrosLimpiados);
  };

  const crear = async () => {
    if (!nuevoEquipo.categoria.trim()) {
      Alert.alert("Validación", "La categoría es requerida");
      return;
    }

    try {
      setCreating(true);
      await api.crear(nuevoEquipo);
      
      // Reset form
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
      
      Alert.alert("Éxito", "Equipo creado correctamente");
      await cargar();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setCreating(false);
    }
  };

  const guardar = async (id: number, payload: Partial<Equipo>) => {
    try {
      await api.actualizar(id, payload);
      await cargar();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const eliminar = async (id: number) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar este equipo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.eliminar(id);
              await cargar();
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          }
        }
      ]
    );
  };

  const estadisticas = useMemo(() => {
    const total = equipos.length;
    const tecnologicos = equipos.filter(e => e.tipo === "tecnologico").length;
    const biomedicos = equipos.filter(e => e.tipo === "biomedico").length;
    const enRevision = equipos.filter(e => e.estado === "en_revision").length;

    return { total, tecnologicos, biomedicos, enRevision };
  }, [equipos]);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>App Mobile - Control de Equipos</Text>
      <Text style={styles.subtitle}>Sistema de equipos tecnológicos y biomédicos</Text>

      {/* Estadísticas */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estadisticas.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estadisticas.tecnologicos}</Text>
          <Text style={styles.statLabel}>Tecno.</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estadisticas.biomedicos}</Text>
          <Text style={styles.statLabel}>Bioméd.</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{estadisticas.enRevision}</Text>
          <Text style={styles.statLabel}>En Rev.</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.card}>
        <Text style={styles.h2}>Filtros</Text>
        
        <View style={styles.filtroRow}>
          <Pressable 
            style={[
              styles.filtroButton, 
              filtros.tipo === "tecnologico" && styles.filtroButtonActive
            ]}
            onPress={() => aplicarFiltros({...filtros, tipo: "tecnologico"})}
          >
            <Text style={[
              styles.filtroButtonText,
              filtros.tipo === "tecnologico" && styles.filtroButtonTextActive
            ]}>Tecnológico</Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.filtroButton, 
              filtros.tipo === "biomedico" && styles.filtroButtonActive
            ]}
            onPress={() => aplicarFiltros({...filtros, tipo: "biomedico"})}
          >
            <Text style={[
              styles.filtroButtonText,
              filtros.tipo === "biomedico" && styles.filtroButtonTextActive
            ]}>Biomédico</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          value={filtros.texto}
          onChangeText={(texto) => aplicarFiltros({...filtros, texto})}
          placeholder="Buscar por categoría, marca, modelo..."
        />

        <Pressable style={styles.limpiarButton} onPress={limpiarFiltros}>
          <Text style={styles.limpiarButtonText}>Limpiar Filtros</Text>
        </Pressable>
      </View>

      {/* Formulario de creación */}
      <ScrollView style={styles.crearCard}>
        <Text style={styles.h2}>Registrar Nuevo Equipo</Text>
        
        <TextInput
          style={styles.input}
          value={nuevoEquipo.categoria}
          onChangeText={(categoria) => setNuevoEquipo({...nuevoEquipo, categoria})}
          placeholder="Categoría *"
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={nuevoEquipo.marca}
            onChangeText={(marca) => setNuevoEquipo({...nuevoEquipo, marca})}
            placeholder="Marca"
          />
          <TextInput
            style={[styles.input, styles.flex1, styles.marginLeft]}
            value={nuevoEquipo.modelo}
            onChangeText={(modelo) => setNuevoEquipo({...nuevoEquipo, modelo})}
            placeholder="Modelo"
          />
        </View>

        <TextInput
          style={styles.input}
          value={nuevoEquipo.serie}
          onChangeText={(serie) => setNuevoEquipo({...nuevoEquipo, serie})}
          placeholder="Número de serie"
        />

        <TextInput
          style={styles.input}
          value={nuevoEquipo.servicio}
          onChangeText={(servicio) => setNuevoEquipo({...nuevoEquipo, servicio})}
          placeholder="Servicio"
        />

        <TextInput
          style={styles.input}
          value={nuevoEquipo.responsable_externo}
          onChangeText={(responsable_externo) => setNuevoEquipo({...nuevoEquipo, responsable_externo})}
          placeholder="Responsable externo"
        />

        <Pressable 
          style={[styles.crearButton, creating && styles.crearButtonDisabled]} 
          onPress={crear}
          disabled={creating}
        >
          <Text style={styles.crearButtonText}>
            {creating ? "Creando..." : "Registrar Equipo"}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Lista de equipos */}
      <View style={styles.listaContainer}>
        <View style={styles.listaHeader}>
          <Text style={styles.h2}>Equipos Registrados</Text>
          <Pressable onPress={() => cargar()} disabled={loading}>
            <Text style={styles.refreshText}>
              {loading ? "⟳" : "↻"}
            </Text>
          </Pressable>
        </View>

        <FlatList
          contentContainerStyle={{ paddingVertical: 8 }}
          data={equipos}
          keyExtractor={(item) => String(item.id)}
          refreshing={loading}
          onRefresh={() => cargar()}
          renderItem={({ item }) => (
            <EquipoItem equipo={item} onSave={guardar} onDelete={eliminar} />
          )}
          ListEmptyComponent={
            !loading ? <Text style={styles.emptyText}>No se encontraron equipos</Text> : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#f8f9fa" 
  },
  h1: { 
    fontSize: 24, 
    fontWeight: "700",
    textAlign: 'center',
    marginBottom: 4,
  },
  h2: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 12 
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtroRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filtroButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  filtroButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filtroButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  filtroButtonTextActive: {
    color: '#fff',
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ddd", 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  limpiarButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  limpiarButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
  },
  crearCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  crearButton: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  crearButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  crearButtonText: {
    color: "#fff", 
    fontWeight: "700",
    fontSize: 16,
  },
  listaContainer: {
    flex: 1,
  },
  listaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshText: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
  },
  emptyText: { 
    textAlign: "center", 
    opacity: 0.6, 
    marginTop: 20,
    fontSize: 16,
  },
});