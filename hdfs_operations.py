#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DATASTORE S.A.C. - Operaciones de Almacenamiento Distribuido en HDFS
Autor: Ingeniero de Datos Senior & Especialista Big Data / NoSQL
"""

import sys
import os
import io
import subprocess
import time
from tabulate import tabulate

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

CONTAINER_NAMENODE = "datastore_namenode"

def run_cmd(cmd):
    """Ejecuta un comando en shell y retorna stdout/stderr"""
    result = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, errors='replace')
    return result.returncode, result.stdout.strip(), result.stderr.strip()

def run_hdfs_cmd(hdfs_args):
    """Ejecuta comandos 'hdfs dfs' dentro del contenedor NameNode"""
    full_cmd = f"docker exec {CONTAINER_NAMENODE} hdfs dfs {hdfs_args}"
    return run_cmd(full_cmd)

def wait_for_hdfs(max_retries=30, delay=2):
    print("\n[*] Verificando disponibilidad de NameNode HDFS...")
    for i in range(max_retries):
        code, out, err = run_hdfs_cmd("-ls /")
        if code == 0:
            print(f"    [+] NameNode HDFS activo y respondiendo (Intento {i+1})")
            return True
        time.sleep(delay)
    print("    [!] Error: HDFS no respondio en el tiempo esperado.")
    return False

def setup_hdfs_pipeline():
    print("=" * 80)
    print("[*] ALMACENAMIENTO DISTRIBUIDO EN HDFS - DATASTORE S.A.C.")
    print("=" * 80)

    # 1. Verificar estado del contenedor
    code, out, _ = run_cmd(f"docker ps --filter name={CONTAINER_NAMENODE} --format \"{{{{.Names}}}}\"")
    if CONTAINER_NAMENODE not in out:
        print(f"[!] Error: El contenedor {CONTAINER_NAMENODE} no esta en ejecucion.")
        print("    Ejecute primero: docker compose up -d")
        sys.exit(1)

    if not wait_for_hdfs():
        sys.exit(1)

    # 2. Creación de Estructura de Directorios en HDFS
    print("\n[1] Creando estructura de directorios en HDFS:")
    dirs = ["/datastore", "/datastore/raw", "/datastore/processed"]
    for d in dirs:
        code, out, err = run_hdfs_cmd(f"-mkdir -p {d}")
        if code == 0:
            print(f"    [+] Directorio creado / verificado: {d}")
        else:
            print(f"    [!] Alerta en {d}: {err}")

    # 3. Transferencia de Datasets a HDFS
    print("\n[2] Transfiriendo datasets al Cluster HDFS (/data -> HDFS):")
    
    # Raw
    if os.path.exists("ventas.csv"):
        print("    -> Copiando 'ventas.csv' crudo a '/datastore/raw/'...")
        run_hdfs_cmd("-put -f /data/ventas.csv /datastore/raw/ventas.csv")
    
    # Processed
    if os.path.exists("ventas_clean.csv"):
        print("    -> Copiando 'ventas_clean.csv' procesado a '/datastore/processed/'...")
        run_hdfs_cmd("-put -f /data/ventas_clean.csv /datastore/processed/ventas_clean.csv")

    # 4. Validaciones de Persistencia y Conteo
    print("\n[3] Validacion de Persistencia en HDFS (hdfs dfs -ls -R /datastore):")
    code, ls_out, _ = run_hdfs_cmd("-ls -R /datastore")
    print(ls_out)

    print("\n[4] Conteo y Tamano de Bloques en HDFS (hdfs dfs -count -q -h -v):")
    code, count_out, _ = run_hdfs_cmd("-count -q -h -v /datastore/processed/ventas_clean.csv")
    print(count_out)

    print("\n[5] Muestra de las Primeras 10 Lineas en HDFS (hdfs dfs -head):")
    code, head_raw, _ = run_hdfs_cmd("-head /datastore/processed/ventas_clean.csv")
    
    lines = [l.strip() for l in head_raw.split('\n') if l.strip()][:11]
    if len(lines) > 1:
        headers = lines[0].split(',')
        sample_rows = [l.split(',') for l in lines[1:]]
        print(tabulate(sample_rows, headers=headers, tablefmt="grid"))
    else:
        print(head_raw)

    print("\n" + "=" * 80)
    print("[OK] DATOS DISTRIBUIDOS EXITOSAMENTE EN HDFS CLUSTER")
    print("=" * 80)

if __name__ == "__main__":
    setup_hdfs_pipeline()
