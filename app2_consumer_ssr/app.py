from flask import Flask, render_template, redirect, request, url_for, flash
from dotenv import load_dotenv
import os, requests

load_dotenv()
APP1_URL = os.getenv("APP1_URL", "http://127.0.0.1:5000")

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-app2")

# -------- SSR: listar equipos consumiendo la API de App1 --------
@app.get("/")
def home():
    try:
        # Obtener parámetros de filtro
        tipo = request.args.get("tipo", "").strip()
        estado = request.args.get("estado", "").strip()
        texto = request.args.get("q", "").strip()
        
        # Construir URL con filtros
        url = f"{APP1_URL}/api/equipos"
        params = {}
        if tipo: params["tipo"] = tipo
        if estado: params["estado"] = estado
        if texto: params["q"] = texto
        
        r = requests.get(url, params=params, timeout=5)
        r.raise_for_status()
        equipos = r.json()
    except Exception as e:
        equipos = []
        flash(f"Error al consumir App1: {e}", "danger")
    return render_template("index.html", equipos=equipos)

# -------- Crear equipo vía API (POST) --------
@app.post("/crear")
def crear():
    tipo = (request.form.get("tipo") or "").strip().lower()
    categoria = (request.form.get("categoria") or "").strip()
    marca = (request.form.get("marca") or "").strip()
    modelo = (request.form.get("modelo") or "").strip()
    serie = (request.form.get("serie") or "").strip()
    estado = (request.form.get("estado") or "ingresado").strip()
    condicion = (request.form.get("condicion") or "operativo").strip()
    servicio = (request.form.get("servicio") or "").strip()
    responsable_externo = (request.form.get("responsable_externo") or "").strip()
    observaciones = (request.form.get("observaciones") or "").strip()

    if not categoria:
        flash("La categoría es requerida", "warning")
        return redirect(url_for("home"))
    if tipo not in {"tecnologico", "biomedico"}:
        flash("Tipo debe ser 'Tecnológico' o 'Biomédico'", "warning")
        return redirect(url_for("home"))

    try:
        r = requests.post(f"{APP1_URL}/api/equipos",
                          json={
                              "tipo": tipo,
                              "categoria": categoria,
                              "marca": marca,
                              "modelo": modelo,
                              "serie": serie,
                              "estado": estado,
                              "condicion": condicion,
                              "servicio": servicio,
                              "responsable_externo": responsable_externo,
                              "observaciones": observaciones
                          },
                          timeout=5)
        if r.status_code != 201:
            flash(f"No se pudo crear: {r.json().get('error', 'Error desconocido')}", "danger")
        else:
            flash("Equipo creado con éxito", "success")
    except Exception as e:
        flash(f"Error conectando con App1: {e}", "danger")
    return redirect(url_for("home"))

# -------- Actualizar equipo --------
@app.post("/actualizar/<int:eid>")
def actualizar(eid):
    tipo = (request.form.get("tipo") or "").strip().lower()
    categoria = (request.form.get("categoria") or "").strip()
    marca = (request.form.get("marca") or "").strip()
    modelo = (request.form.get("modelo") or "").strip()
    serie = (request.form.get("serie") or "").strip()
    estado = (request.form.get("estado") or "ingresado").strip()
    condicion = (request.form.get("condicion") or "operativo").strip()
    servicio = (request.form.get("servicio") or "").strip()
    responsable_externo = (request.form.get("responsable_externo") or "").strip()
    observaciones = (request.form.get("observaciones") or "").strip()

    if not categoria:
        flash("La categoría es requerida", "warning")
        return redirect(url_for("home"))

    try:
        r = requests.put(f"{APP1_URL}/api/equipos/{eid}",
                         json={
                             "tipo": tipo,
                             "categoria": categoria,
                             "marca": marca,
                             "modelo": modelo,
                             "serie": serie,
                             "estado": estado,
                             "condicion": condicion,
                             "servicio": servicio,
                             "responsable_externo": responsable_externo,
                             "observaciones": observaciones
                         },
                         timeout=5)
        if not r.ok:
            error_msg = r.json().get('error', 'Error desconocido')
            flash(f"No se pudo actualizar: {error_msg}", "danger")
        else:
            flash("Equipo actualizado con éxito", "success")
    except Exception as e:
        flash(f"Error conectando con App1: {e}", "danger")
    return redirect(url_for("home"))

# -------- Eliminar equipo --------
@app.post("/eliminar/<int:eid>")
def eliminar(eid):
    try:
        r = requests.delete(f"{APP1_URL}/api/equipos/{eid}", timeout=5)
        if not r.ok:
            flash(f"No se pudo eliminar: {r.text}", "danger")
        else:
            flash("Equipo eliminado", "success")
    except Exception as e:
        flash(f"Error conectando con App1: {e}", "danger")
    return redirect(url_for("home"))

if __name__ == "__main__":
    # App2 en puerto 8061
    app.run(port=8061, debug=True)