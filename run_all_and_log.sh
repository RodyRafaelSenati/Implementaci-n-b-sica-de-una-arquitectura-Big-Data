#!/usr/bin/env bash
# ==============================================================================
# DATASTORE S.A.C. - Pipeline Big Data & NoSQL Automatizado de Extremo a Extremo
# Ejecución completa: Limpieza -> HDFS -> MongoDB -> Consultas Analíticas
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================================================"
echo -e "🚀 DATASTORE S.A.C. - PIPELINE BIG DATA & NOSQL (HDFS + MONGODB + ETL)"
echo -e "================================================================================${NC}\n"

# 1. Verificación de Contenedores Docker
echo -e "${BLUE}[PASO 1] Verificando estado de contenedores Docker Compose...${NC}"
docker compose ps
echo ""

# 2. Pipeline de Limpieza y Validación en Python
echo -e "${BLUE}[PASO 2] Ejecutando Limpieza y Validación de Datos (clean_data.py)...${NC}"
python clean_data.py
echo ""

# 3. Operaciones y Carga en HDFS
echo -e "${BLUE}[PASO 3] Almacenamiento Distribuido en Apache Hadoop HDFS...${NC}"
python hdfs_operations.py
echo ""

# 4. Ingesta e Indexación en MongoDB
echo -e "${BLUE}[PASO 4] Ingesta Masiva e Indexación en MongoDB (ingest_mongo.py)...${NC}"
python ingest_mongo.py
echo ""

# 5. Ejecución de Consultas y Agregaciones Analíticas
echo -e "${BLUE}[PASO 5] Ejecutando Banco de Consultas Analíticas (run_queries.py)...${NC}"
python run_queries.py
echo ""

echo -e "${GREEN}================================================================================"
echo -e "✅ PIPELINE COMPLETO EJECUTADO CON ÉXITO Y REGISTRADO"
echo -e "================================================================================${NC}"
