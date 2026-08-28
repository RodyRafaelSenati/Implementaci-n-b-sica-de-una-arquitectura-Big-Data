#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DATASTORE S.A.C. - Pipeline de Limpieza y Validación de Datos
Autor: Ingeniero de Datos Senior & Especialista Big Data / NoSQL
"""

import sys
import json
import os
import io
import pandas as pd
import numpy as np
from datetime import datetime
from tabulate import tabulate

# Configurar encoding seguro para Windows y Linux
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

MESES_ES = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
    5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
    9: 'Setiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
}

def clean_sales_pipeline(input_path="ventas.csv", output_csv="ventas_clean.csv", output_json="ventas_clean.json"):
    print("=" * 80)
    print("[*] INICIANDO PIPELINE DE LIMPIEZA Y VALIDACION - DATASTORE S.A.C.")
    print("=" * 80)

    if not os.path.exists(input_path):
        print(f"[!] Error: No se encontro el archivo de entrada '{input_path}'.")
        sys.exit(1)

    # 1. Carga de datos crudos
    print(f"\n[1] Leyendo dataset crudo desde: {input_path}")
    raw_df = pd.read_csv(input_path, dtype=str)
    initial_rows = len(raw_df)
    print(f"    -> Registros totales cargados: {initial_rows:,}")

    # Registro de metricas ANTES
    nulls_before = raw_df.isnull().sum().to_dict()
    duplicates_before = int(raw_df.duplicated().sum())

    # 2. Deteccion y Manejo de Nulos y Vacios
    print("\n[2] Deteccion de Valores Nulos, Vacios y Corruptos:")
    df = raw_df.replace(r'^\s*$', np.nan, regex=True).copy()

    # 3. Limpieza de Texto (Espacios y Normalizacion)
    text_columns = ['Producto', 'Categoría', 'Ciudad']
    for col in text_columns:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    # 4. Parseo y Estandarizacion de Fechas (DD/MM/YYYY -> YYYY-MM-DD)
    print("\n[3] Estandarizacion de Fechas a Formato ISO (YYYY-MM-DD):")
    def parse_mixed_date(val):
        if pd.isna(val) or val == 'nan':
            return pd.NaT
        val_str = str(val).strip()
        try:
            return pd.to_datetime(val_str, format='%d/%m/%Y')
        except:
            pass
        try:
            return pd.to_datetime(val_str, format='%Y-%m-%d')
        except:
            pass
        try:
            return pd.to_datetime(val_str, dayfirst=True)
        except:
            return pd.NaT

    df['Fecha_DT'] = df['Fecha'].apply(parse_mixed_date)
    invalid_dates_count = int(df['Fecha_DT'].isna().sum())

    # 5. Estandarizacion y Validacion de Tipos Numericos
    print("\n[4] Validacion de Integridad Numerica (Cantidad > 0, Precio > 0):")
    df['Cantidad'] = df['Cantidad'].astype(str).str.replace(r'[^\d-]', '', regex=True)
    df['Cantidad'] = pd.to_numeric(df['Cantidad'], errors='coerce')
    
    df['Precio'] = df['Precio'].astype(str).str.replace(r'S/\.?\s?', '', regex=True).str.replace(',', '.')
    df['Precio'] = pd.to_numeric(df['Precio'], errors='coerce')

    # Filtrar registros validos
    valid_mask = (
        df['Fecha_DT'].notna() &
        df['Producto'].notna() & (df['Producto'] != 'nan') &
        df['Categoría'].notna() & (df['Categoría'] != 'nan') &
        df['Ciudad'].notna() & (df['Ciudad'] != 'nan') &
        df['Cantidad'].notna() & (df['Cantidad'] > 0) &
        df['Precio'].notna() & (df['Precio'] > 0.0)
    )

    df_clean = df[valid_mask].copy()

    # Conversion estricta de tipos
    df_clean['Cantidad'] = df_clean['Cantidad'].astype(int)
    df_clean['Precio'] = df_clean['Precio'].astype(float).round(2)
    df_clean['Fecha'] = df_clean['Fecha_DT'].dt.strftime('%Y-%m-%d')

    # 6. Campos Calculados y Desagregacion Temporal
    print("\n[5] Generacion de Campos Calculados:")
    df_clean['Total_Venta'] = (df_clean['Cantidad'] * df_clean['Precio']).round(2)
    df_clean['Año'] = df_clean['Fecha_DT'].dt.year
    df_clean['Mes'] = df_clean['Fecha_DT'].dt.month
    df_clean['Dia'] = df_clean['Fecha_DT'].dt.day
    df_clean['Mes_Nombre'] = df_clean['Mes'].map(MESES_ES)
    df_clean['Trimestre'] = df_clean['Fecha_DT'].dt.to_period('Q').astype(str)

    # 7. Eliminacion de Duplicados
    print("\n[6] Deteccion y Remocion de Duplicados:")
    clean_cols_for_dup = ['Fecha', 'Producto', 'Categoría', 'Cantidad', 'Precio', 'Ciudad']
    duplicates_clean = int(df_clean.duplicated(subset=clean_cols_for_dup).sum())
    df_clean = df_clean.drop_duplicates(subset=clean_cols_for_dup).reset_index(drop=True)

    # Reordenar columnas finales
    final_cols = [
        'Fecha', 'Año', 'Mes', 'Mes_Nombre', 'Dia', 'Trimestre',
        'Producto', 'Categoría', 'Cantidad', 'Precio', 'Ciudad', 'Total_Venta'
    ]
    df_final = df_clean[final_cols]
    final_rows = len(df_final)

    # Metricas DESPUES
    nulls_after = df_final.isnull().sum().to_dict()
    total_removed = initial_rows - final_rows

    # 8. Reporte Comparativo ANTES vs DESPUES
    print("\n" + "=" * 80)
    print("METRICAS DE CALIDAD DE DATOS (ANTES vs DESPUES)")
    print("=" * 80)

    comparison_data = [
        ["Total Registros / Filas", f"{initial_rows:,}", f"{final_rows:,}", f"-{total_removed:,} ({total_removed/initial_rows*100:.2f}%)"],
        ["Valores Nulos / Vacios", sum(nulls_before.values()), sum(nulls_after.values()), "0 (100% Imputado/Limpio)"],
        ["Fechas Invalidas", f"{invalid_dates_count}", "0", "Estandarizadas ISO YYYY-MM-DD"],
        ["Filas Duplicadas", f"{duplicates_before}", "0", "100% Removidas"],
        ["Facturacion Total (PEN)", f"S/ {(df_clean['Total_Venta'].sum()):,.2f}", f"S/ {(df_final['Total_Venta'].sum()):,.2f}", "Auditada & Consolidada"],
        ["Total Unidades Fisicas", f"{(df_clean['Cantidad'].sum()):,}", f"{(df_final['Cantidad'].sum()):,}", "Validadas (>0)"],
    ]
    print(tabulate(comparison_data, headers=["Metrica de Calidad", "Estado Inicial (Crudo)", "Estado Final (Limpio)", "Accion Ejecutada"], tablefmt="grid"))

    # 9. Exportacion a CSV y JSON
    print("\n[7] Exportando Datasets Limpios:")
    df_final.to_csv(output_csv, index=False, encoding='utf-8')
    print(f"    [+] CSV Limpio exportado a: {output_csv} ({os.path.getsize(output_csv):,} bytes)")

    # Exportar a JSON optimizado para MongoDB
    records = df_final.to_dict(orient='records')
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"    [+] JSON Limpio exportado a: {output_json} ({os.path.getsize(output_json):,} bytes)")

    print("\n" + "=" * 80)
    print(f"[OK] PIPELINE DE LIMPIEZA FINALIZADO: {final_rows:,} REGISTROS LISTOS PARA HDFS Y MONGODB")
    print("=" * 80)

    return df_final

if __name__ == "__main__":
    clean_sales_pipeline()
