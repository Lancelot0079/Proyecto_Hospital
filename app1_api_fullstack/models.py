from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Producto(db.Model):
    __tablename__ = "productos"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    precio = db.Column(db.Float, nullable=False, default=0.0)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self): # para convertir a dict fácilmente, es decir a JSON
        return {
            "id": self.id,
            "nombre": self.nombre,
            "precio": self.precio,
            "creado_en": self.creado_en.isoformat()
        }

# ---  equipos externos que ingresan al hospital ---
class Equipo(db.Model):
    __tablename__ = "equipos"

    id = db.Column(db.Integer, primary_key=True)

    # Identificación técnica
    tipo = db.Column(                     # tecnológico/biomédico (o catálogo)
        db.Enum("tecnologico", "biomedico", name="equipo_tipo_enum"),
        nullable=False,
        default="tecnologico"
    )
    categoria = db.Column(db.String(120), nullable=True)   # p.ej. “impresora 3D”, “monitor signos”
    marca = db.Column(db.String(120), nullable=True)
    modelo = db.Column(db.String(120), nullable=True)
    serie = db.Column(db.String(120), nullable=True, index=True, unique=True)  # serial único (si aplica)
    descripcion = db.Column(db.Text, nullable=True)

    # Origen externo y responsable
    empresa_externa = db.Column(db.String(180), nullable=True)
    responsable_externo = db.Column(db.String(180), nullable=True)
    contacto_externo = db.Column(db.String(120), nullable=True)   # tel/correo

    # Trazabilidad de ingreso
    doc_ingreso = db.Column(db.String(80), nullable=True)         # folio/formato interno
    fecha_ingreso = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    fecha_salida = db.Column(db.DateTime, nullable=True)

    # Estado operativo / proceso
    estado = db.Column(  # flujo general del equipo dentro del hospital
        db.Enum("ingresado", "en_revision", "autorizado", "rechazado", "retirado", name="equipo_estado_enum"),
        nullable=False,
        default="ingresado",
        index=True
    )
    condicion = db.Column(  # condición física/operativa
        db.Enum("operativo", "averiado", "contaminado", "desconocido", name="equipo_condicion_enum"),
        nullable=False,
        default="desconocido"
    )

    # Ubicación y riesgos
    servicio = db.Column(db.String(120), nullable=True)   # p.ej. “UCI Adultos”
    ubicacion = db.Column(db.String(180), nullable=True)  # p.ej. “Torre A, piso 3, sala 302”
    requiere_energia = db.Column(db.Boolean, nullable=False, default=True)
    riesgo_biologico = db.Column(db.Boolean, nullable=False, default=False)

    # Observaciones
    observaciones = db.Column(db.Text, nullable=True)

    # Auditoría simple (si aún no tienes usuarios en esta app)
    registrado_por = db.Column(db.String(120), nullable=True)  # nombre/usuario que registra

    # Timestamps
    creado_en = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    actualizado_en = db.Column(db.DateTime, nullable=False, server_default=db.func.now(), onupdate=db.func.now())

    __table_args__ = (
        db.UniqueConstraint("serie", name="uq_equipo_serie"),
    )

    def to_dict(self): # para convertir a dict, es decir a JSON
        return {
            "id": self.id,
            "tipo": self.tipo,
            "categoria": self.categoria,
            "marca": self.marca,
            "modelo": self.modelo,
            "serie": self.serie,
            "descripcion": self.descripcion,
            "empresa_externa": self.empresa_externa,
            "responsable_externo": self.responsable_externo,
            "contacto_externo": self.contacto_externo,
            "doc_ingreso": self.doc_ingreso,
            "fecha_ingreso": self.fecha_ingreso.isoformat() if self.fecha_ingreso else None,
            "fecha_salida": self.fecha_salida.isoformat() if self.fecha_salida else None,
            "estado": self.estado,
            "condicion": self.condicion,
            "servicio": self.servicio,
            "ubicacion": self.ubicacion,
            "requiere_energia": self.requiere_energia,
            "riesgo_biologico": self.riesgo_biologico,
            "observaciones": self.observaciones,
            "registrado_por": self.registrado_por,
            "creado_en": self.creado_en.isoformat() if self.creado_en else None,
            "actualizado_en": self.actualizado_en.isoformat() if self.actualizado_en else None,
        }

