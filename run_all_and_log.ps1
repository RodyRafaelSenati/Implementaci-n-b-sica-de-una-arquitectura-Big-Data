# ==============================================================================
# DATASTORE S.A.C. - Pipeline Big Data & NoSQL Automatizado (PowerShell)
# Ejecución completa: Limpieza -> HDFS -> MongoDB -> Consultas Analíticas
# ==============================================================================

$Host.UI.RawUI.ForegroundColor = "Cyan"
Write-Host "================================================================================"
Write-Host "DATASTORE S.A.C. - PIPELINE BIG DATA & NOSQL (HDFS + MONGODB + ETL)"
Write-Host "================================================================================"
$Host.UI.RawUI.ForegroundColor = "White"

# 1. Verificación de Contenedores Docker
Write-Host "`n[PASO 1] Verificando estado de contenedores Docker Compose..." -ForegroundColor Yellow
docker compose ps

# 2. Pipeline de Limpieza y Validación en Python
Write-Host "`n[PASO 2] Ejecutando Limpieza y Validación de Datos (clean_data.py)..." -ForegroundColor Yellow
python clean_data.py

# 3. Operaciones y Carga en HDFS
Write-Host "`n[PASO 3] Almacenamiento Distribuido en Apache Hadoop HDFS..." -ForegroundColor Yellow
python hdfs_operations.py

# 4. Ingesta e Indexación en MongoDB
Write-Host "`n[PASO 4] Ingesta Masiva e Indexación en MongoDB (ingest_mongo.py)..." -ForegroundColor Yellow
python ingest_mongo.py

# 5. Ejecución de Consultas y Agregaciones Analíticas
Write-Host "`n[PASO 5] Ejecutando Banco de Consultas Analíticas (run_queries.py)..." -ForegroundColor Yellow
python run_queries.py

Write-Host "`n================================================================================" -ForegroundColor Green
Write-Host "PIPELINE COMPLETO EJECUTADO CON EXITO Y REGISTRADO" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Green
