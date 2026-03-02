import csv
import re
import unicodedata
from pathlib import Path

proyecto = Path("/Users/relke/yusnelkis.github.io/Portafolio/bivariate-chile-map")

archivo_mapa_fuente = proyecto / "data" / "chile_data.backup_dummy.csv"
archivo_mapa_salida = proyecto / "data" / "chile_data.csv"
archivo_casen = proyecto / "data" / "fuentes_casen" / "casen2024_pobreza_regional_bivariado_es.csv"

def reparar_texto(texto):
    if texto is None:
        return ""
    texto = str(texto).strip()
    try:
        if "Ã" in texto or "Â" in texto:
            texto = texto.encode("latin1").decode("utf-8")
    except Exception:
        pass
    return texto.strip()

def quitar_acentos(texto):
    texto = unicodedata.normalize("NFKD", texto)
    return "".join(c for c in texto if not unicodedata.combining(c))

def normalizar_slug(texto):
    texto = reparar_texto(texto).lower().strip()
    texto = quitar_acentos(texto)

    # limpieza general
    texto = texto.replace(".", "")
    texto = texto.replace("'", "")
    texto = texto.replace("gral", "general")
    texto = texto.replace("generalibanez", "general ibanez")
    texto = texto.replace("bio-bio", "biobio")
    texto = texto.replace("biobio", "biobio")
    texto = texto.replace("nuble", "nuble")

    # quitar prefijos regionales frecuentes
    prefijos = [
        "region de ",
        "region del ",
        "region de la ",
        "region de los ",
        "region de las ",
    ]
    for pref in prefijos:
        if texto.startswith(pref):
            texto = texto[len(pref):]

    texto = texto.strip()

    # casos especiales completos
    casos_especiales = {
        "metropolitana de santiago": "metropolitana",
        "region metropolitana de santiago": "metropolitana",
        "libertador bernardo ohiggins": "ohiggins",
        "libertador general bernardo ohiggins": "ohiggins",
        "aysen del general ibanez del campo": "aysen",
        "aysen del general carlos ibanez del campo": "aysen",
        "magallanes y antartica chilena": "magallanes",
        "magallanes y de la antartica chilena": "magallanes",
        "la araucania": "la-araucania",
        "araucania": "la-araucania",
        "los rios": "los-rios",
        "los lagos": "los-lagos",
        "arica y parinacota": "arica-y-parinacota",
        "tarapaca": "tarapaca",
        "antofagasta": "antofagasta",
        "atacama": "atacama",
        "coquimbo": "coquimbo",
        "valparaiso": "valparaiso",
        "maule": "maule",
        "biobio": "biobio",
        "nuble": "nuble",
        "aysen": "aysen",
        "magallanes": "magallanes",
        "ohiggins": "ohiggins",
        "metropolitana": "metropolitana",
    }

    if texto in casos_especiales:
        return casos_especiales[texto]

    # fallback genérico
    texto = re.sub(r"[^a-z0-9]+", "-", texto).strip("-")

    alias = {
        "arica-y-parinacota": "arica-y-parinacota",
        "tarapaca": "tarapaca",
        "antofagasta": "antofagasta",
        "atacama": "atacama",
        "coquimbo": "coquimbo",
        "valparaiso": "valparaiso",
        "metropolitana": "metropolitana",
        "ohiggins": "ohiggins",
        "maule": "maule",
        "nuble": "nuble",
        "biobio": "biobio",
        "la-araucania": "la-araucania",
        "los-rios": "los-rios",
        "los-lagos": "los-lagos",
        "aysen": "aysen",
        "magallanes": "magallanes",
    }

    return alias.get(texto, texto)

# 1) Cargar CASEN
casen_por_slug = {}

with open(archivo_casen, encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        region = reparar_texto(row.get("region", ""))
        slug = normalizar_slug(region)  # importante: recalcular desde el nombre
        row["region"] = region
        casen_por_slug[slug] = row

# 2) Cargar archivo base del mapa (dummy con shapeID)
with open(archivo_mapa_fuente, encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    filas_base = list(reader)

filas_salida = []
sin_match = []

for fila in filas_base:
    nombre_base = reparar_texto(fila.get("name") or fila.get("nombre") or "")
    slug = normalizar_slug(nombre_base)

    casen = casen_por_slug.get(slug)

    if not casen:
        sin_match.append((nombre_base, slug))
        continue

    nombre_limpio = reparar_texto(casen.get("region", nombre_base))

    nueva_fila = {
        "shapeID": fila["shapeID"],
        "name": nombre_limpio,
        "nombre": nombre_limpio,
        "region_slug": slug,

        "pobreza_2022_pct": casen.get("pobreza_2022_pct", ""),
        "pobreza_2024_pct": casen.get("pobreza_2024_pct", ""),
        "cambio_pobreza_pp_2022_2024": casen.get("cambio_pobreza_pp_2022_2024", ""),
        "direccion_cambio_pobreza": casen.get("direccion_cambio_pobreza", ""),
        "cambio_pobreza_significativo_95": casen.get("cambio_pobreza_significativo_95", ""),

        "pobreza_extrema_2022_pct": casen.get("pobreza_extrema_2022_pct", ""),
        "pobreza_extrema_2024_pct": casen.get("pobreza_extrema_2024_pct", ""),
        "cambio_pobreza_extrema_pp_2022_2024": casen.get("cambio_pobreza_extrema_pp_2022_2024", ""),
        "direccion_cambio_pobreza_extrema": casen.get("direccion_cambio_pobreza_extrema", ""),
        "cambio_pobreza_extrema_significativo_95": casen.get("cambio_pobreza_extrema_significativo_95", ""),

        # columnas activas para el mapa
        "x": casen.get("pobreza_2024_pct", ""),
        "y": casen.get("cambio_pobreza_pp_2022_2024", "")
    }

    filas_salida.append(nueva_fila)

columnas = [
    "shapeID",
    "name",
    "nombre",
    "region_slug",
    "pobreza_2022_pct",
    "pobreza_2024_pct",
    "cambio_pobreza_pp_2022_2024",
    "direccion_cambio_pobreza",
    "cambio_pobreza_significativo_95",
    "pobreza_extrema_2022_pct",
    "pobreza_extrema_2024_pct",
    "cambio_pobreza_extrema_pp_2022_2024",
    "direccion_cambio_pobreza_extrema",
    "cambio_pobreza_extrema_significativo_95",
    "x",
    "y"
]

with open(archivo_mapa_salida, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=columnas)
    writer.writeheader()
    writer.writerows(filas_salida)

print("OK: archivo actualizado")
print("Salida:", archivo_mapa_salida)
print("Filas escritas:", len(filas_salida))

if sin_match:
    print("\nRegiones sin match:")
    for nombre, slug in sin_match:
        print("-", nombre, "->", slug)
else:
    print("\nTodos los nombres regionales fueron vinculados correctamente.")
