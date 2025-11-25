# app1_api_fullstack/app.py
from flask import Flask, jsonify, request, render_template
from config import Config
from models import db, Producto, Equipo
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    # Habilitar CORS para la API pública
    CORS(app, resources={r"/api/*": {"origins": "*"}}, methods=["GET","POST","PUT","DELETE"])

    # ----- Crear tablas y semillas -----
    with app.app_context():
        db.create_all()

        if Producto.query.count() == 0:
            db.session.add_all([
                Producto(nombre="Mouse inalámbrico", precio=45000),
                Producto(nombre="Teclado mecánico", precio=180000),
            ])

        if Equipo.query.count() == 0:
            db.session.add_all([
                Equipo(
                    tipo="tecnologico", categoria="Laptop",
                    marca="Dell", modelo="Latitude 5440", serie="DL-5440-ABC",
                    estado="ingresado", condicion="operativo",
                    servicio="TI", responsable_externo="Proveedor ACME"
                ),
                Equipo(
                    tipo="biomedico", categoria="Electrocardiógrafo",
                    marca="GE", modelo="MAC 2000", serie="GE-MAC2K-001",
                    estado="en_revision", condicion="averiado",
                    servicio="Cardiología", responsable_externo="BioServicios SAS",
                    observaciones="Equipo requiere revisión técnica"
                ),
            ])
        db.session.commit()

    # ---------------- Vistas SSR (Jinja) ----------------
    @app.get("/")
    def home():
        productos = Producto.query.order_by(Producto.id.desc()).all()
        return render_template("index.html", productos=productos)

    @app.get("/equipos")
    def equipos_page():
        equipos = Equipo.query.order_by(Equipo.id.desc()).all()
        return render_template("equipos.html", equipos=equipos)

    # ---------------- API Productos ----------------
    @app.get("/api/productos")
    def api_prod_listar():
        items = Producto.query.order_by(Producto.id.desc()).all()
        return jsonify([p.to_dict() for p in items])

    @app.post("/api/productos")
    def api_prod_crear():
        data = request.get_json(silent=True) or {}
        nombre = (data.get("nombre") or "").strip()
        precio = float(data.get("precio") or 0)
        if not nombre:
            return jsonify({"error": "nombre es requerido"}), 400
        p = Producto(nombre=nombre, precio=precio)
        db.session.add(p); db.session.commit()
        return jsonify(p.to_dict()), 201

    @app.put("/api/productos/<int:pid>")
    def api_prod_actualizar(pid):
        p = Producto.query.get_or_404(pid)
        data = request.get_json(silent=True) or {}
        if "nombre" in data:
            nombre = (data.get("nombre") or "").strip()
            if not nombre:
                return jsonify({"error":"nombre vacío"}), 400
            p.nombre = nombre
        if "precio" in data:
            p.precio = float(data.get("precio") or 0)
        db.session.commit()
        return jsonify(p.to_dict())

    @app.delete("/api/productos/<int:pid>")
    def api_prod_eliminar(pid):
        p = Producto.query.get_or_404(pid)
        db.session.delete(p); db.session.commit()
        return jsonify({"ok": True})

    # ---------------- API Equipos ----------------
    @app.get("/api/equipos") # ruta para listar
    def api_eq_listar():
        q = Equipo.query
        tipo = (request.args.get("tipo") or "").strip().lower()
        estado = (request.args.get("estado") or "").strip().lower()
        texto = (request.args.get("q") or "").strip().lower()

        if tipo in {"biomedico", "tecnologico"}:
            q = q.filter(Equipo.tipo == tipo)
        if estado:
            q = q.filter(Equipo.estado == estado)
        if texto:
            like = f"%{texto}%"
            q = q.filter(
                db.or_(
                    Equipo.categoria.ilike(like),
                    Equipo.marca.ilike(like),
                    Equipo.modelo.ilike(like),
                    Equipo.serie.ilike(like),
                    Equipo.servicio.ilike(like),
                    Equipo.responsable_externo.ilike(like),
                )
            )

        items = q.order_by(Equipo.id.desc()).all()
        return jsonify([e.to_dict() for e in items])

    @app.get("/api/equipos/<int:eid>")
    def api_eq_detalle(eid):
        e = Equipo.query.get_or_404(eid)
        return jsonify(e.to_dict())

    @app.post("/api/equipos")  # ruta para crear  
    def api_eq_crear():
        data = request.get_json(silent=True) or {}
        tipo = (data.get("tipo") or "").strip().lower()
        categoria = (data.get("categoria") or "").strip()
        if tipo not in {"tecnologico", "biomedico"}:
            return jsonify({"error": "tipo debe ser 'tecnologico' o 'biomedico'"}), 400
        if not categoria:
            return jsonify({"error": "categoria es requerida"}), 400

        e = Equipo(
            tipo=tipo,
            categoria=categoria,
            marca=(data.get("marca") or None),
            modelo=(data.get("modelo") or None),
            serie=(data.get("serie") or None),
            estado=(data.get("estado") or "ingresado"),
            condicion=(data.get("condicion") or "operativo"),
            servicio=(data.get("servicio") or None),
            responsable_externo=(data.get("responsable_externo") or None),
            observaciones=(data.get("observaciones") or None),
            ubicacion_actual=(data.get("ubicacion_actual") or None),
        )
        db.session.add(e); db.session.commit()
        return jsonify(e.to_dict()), 201

    @app.put("/api/equipos/<int:eid>") # ruta para actualizar
    def api_eq_actualizar(eid):
        e = Equipo.query.get_or_404(eid)
        data = request.get_json(silent=True) or {}

        for key in [
            "tipo","categoria","marca","modelo","serie",
            "estado","condicion","servicio","responsable_externo",
            "observaciones","ubicacion_actual"
        ]:
            if key in data:
                val = (data.get(key) or "").strip()
                setattr(e, key, (val or None))

        if e.tipo not in {"tecnologico", "biomedico"}:
            return jsonify({"error": "tipo inválido"}), 400

        db.session.commit()
        return jsonify(e.to_dict())

    @app.delete("/api/equipos/<int:eid>")
    def api_eq_eliminar(eid):
        e = Equipo.query.get_or_404(eid)
        db.session.delete(e); db.session.commit()
        return jsonify({"ok": True})

    return app

app = create_app()

if __name__ == "__main__":
    # App1 en puerto 5000
    app.run(host="0.0.0.0", port=5000, debug=True)
