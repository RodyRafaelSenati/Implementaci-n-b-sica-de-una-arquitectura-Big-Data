#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DATASTORE S.A.C. - Ingesta en Base de Datos NoSQL (MongoDB) e Indexación Estratégica
Autor: Ingeniero de Datos Senior & Especialista Big Data / NoSQL
"""

import sys
import json
import os
import io
import time
from pymongo import MongoClient, ASCENDING, DESCENDING
from tabulate import tabulate

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "datastore_db"
COLLECTION_NAME = "ventas"

def ingest_to_mongodb(json_path="ventas_clean.json"):
    print("=" * 80)
    print("[*] INGESTA EN BASE DE DATOS NOSQL (MONGODB) - DATASTORE S.A.C.")
    print("=" * 80)

    if not os.path.exists(json_path):
        print(f"[!] Error: No se encontro el archivo JSON '{json_path}'. Ejecute primero clean_data.py")
        sys.exit(1)

    print(f"\n[1] Conectando a MongoDB en: {MONGO_URI}")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    
    try:
        # Verificar conexion
        client.admin.command('ping')
        print("    [+] Conexion establecida con MongoDB exitosamente.")
    except Exception as e:
        print(f"    [!] Error de conexion a MongoDB: {e}")
        print("    Asegurese de que el contenedor 'datastore_mongodb' este corriendo.")
        sys.exit(1)

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    # Leer datos limpios
    print(f"\n[2] Leyendo archivo JSON: {json_path}")
    with open(json_path, 'r', encoding='utf-8') as f:
        records = json.load(f)
    
    total_records = len(records)
    print(f"    -> Registros listos para ingesta: {total_records:,}")

    # Limpiar coleccion previa para reproducibilidad
    print(f"\n[3] Preparando coleccion '{DB_NAME}.{COLLECTION_NAME}':")
    deleted = collection.delete_many({})
    print(f"    -> Documentos previos eliminados: {deleted.deleted_count:,}")

    # Ingesta por Lotes (Bulk Insert)
    print("\n[4] Ejecutando Ingesta Masiva (Bulk Insert):")
    start_time = time.time()
    batch_size = 5000
    inserted_count = 0

    for i in range(0, total_records, batch_size):
        batch = records[i:i + batch_size]
        result = collection.insert_many(batch)
        inserted_count += len(result.inserted_ids)
        print(f"    [+] Lote insertado: {inserted_count:,} / {total_records:,} documentos...")

    duration = time.time() - start_time
    print(f"    ✓ Ingesta completada en {duration:.3f} segundos ({total_records/duration:,.0f} docs/seg)")

    # Creación de Índices Estratégicos
    print("\n[5] Creando Indices Estrategicos para Optimizacion de Consultas BI:")
    indices_to_create = [
        ("Ciudad", ASCENDING, "idx_ciudad"),
        ("Categoría", ASCENDING, "idx_categoria"),
        ("Fecha", ASCENDING, "idx_fecha"),
        ("Producto", ASCENDING, "idx_producto"),
    ]

    for field, order, name in indices_to_create:
        idx_name = collection.create_index([(field, order)], name=name)
        print(f"    [+] Indice simple creado: '{name}' en campo [{field}]")

    # Indice compuesto para queries de alto rendimiento (Categoria + Total_Venta)
    comp_idx = collection.create_index([("Categoría", ASCENDING), ("Total_Venta", DESCENDING)], name="idx_cat_total_venta")
    print(f"    [+] Indice compuesto creado: 'idx_cat_total_venta' en [Categoría ASC, Total_Venta DESC]")

    # Validaciones e Información del Almacén
    print("\n[6] Resumen de Coleccion e Indices en MongoDB:")
    stats = db.command("collstats", COLLECTION_NAME)
    
    indices_info = list(collection.list_indexes())
    index_rows = [[idx.get('name'), str(idx.get('key').to_dict()), f"{idx.get('v')}"] for idx in indices_info]
    print(tabulate(index_rows, headers=["Nombre del Indice", "Campos Indexados", "Version"], tablefmt="grid"))

    print("\n[7] Muestra de Documento Ingestado:")
    sample_doc = collection.find_one({}, {"_id": 0})
    print(json.dumps(sample_doc, indent=2, ensure_ascii=False))

    print("\n" + "=" * 80)
    print(f"[OK] {inserted_count:,} DOCUMENTOS ALMACENADOS E INDEXADOS EN MONGODB ({DB_NAME}.{COLLECTION_NAME})")
    print("=" * 80)

if __name__ == "__main__":
    ingest_to_mongodb()
