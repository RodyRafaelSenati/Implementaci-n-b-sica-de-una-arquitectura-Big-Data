<div align="center">

# 🏢 DATASTORE S.A.C.
### Arquitectura Big Data, Almacenamiento Distribuido HDFS, Base de Datos NoSQL y Dashboard BI Ejecutivo

[![Docker](https://img.shields.io/badge/Docker-24.0+-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Apache Hadoop](https://img.shields.io/badge/Apache%20Hadoop-3.2.1-66CCFF?style=for-the-badge&logo=apachehadoop&logoColor=black)](https://hadoop.apache.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0%20NoSQL-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2F3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

<p align="center">
  <b>Pipeline de Ingeniería de Datos y Plataforma de Business Intelligence automatizada de extremo a extremo</b>
</p>

</div>

---

## 📑 Tabla de Contenidos
1. [Descripción General](#-descripción-general)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Ecosistema de Contenedores (Docker Compose)](#-ecosistema-de-contenedores-docker-compose)
4. [Pipeline ETL de Calidad de Datos](#-pipeline-etl-de-calidad-de-datos)
5. [Almacenamiento Distribuido (HDFS)](#-almacenamiento-distribuido-hdfs)
6. [Base de Datos NoSQL e Indexación (MongoDB)](#-base-de-datos-nosql-e-indexación-mongodb)
7. [Banco de Consultas Analíticas (MQL)](#-banco-de-consultas-analíticas-mql)
8. [Dashboard Ejecutivo & Consultas Libres (React SPA)](#-dashboard-ejecutivo--consultas-libres-react-spa)
9. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
10. [Estructura del Repositorio](#-estructura-del-repositorio)

---

## 🚀 Descripción General

**DATASTORE S.A.C.** es una plataforma integral de **Big Data & Analytics** diseñada para procesar, auditar, almacenar de forma distribuida y explotar analíticamente más de **20,000 transacciones comerciales**.

El flujo implementa la secuencia completa de ingeniería de datos:
```
[Datos Crudos] ➔ [Limpieza y Validación ETL] ➔ [Carga en HDFS] ➔ [Ingesta NoSQL en MongoDB] ➔ [Agregaciones MQL] ➔ [Dashboard BI React]
```

---

## 🏛️ Arquitectura del Sistema

```
                    ┌───────────────────────────────────────────────────────────┐
                    │                   FUENTES DE ENTRADA                      │
                    │               ventas.csv (20,000 registros)               │
                    └─────────────────────────────┬─────────────────────────────┘
                                                  │
                                                  ▼
                    ┌───────────────────────────────────────────────────────────┐
                    │               PIPELINE ETL (clean_data.py)                │
                    │      • Deduplicación (79 filas corruptas eliminadas)      │
                    │      • Fechas ISO (YYYY-MM-DD) y validación numérica      │
                    │      • Total_Venta, Año, Mes, Trimestre calculados        │
                    └──────────────┬─────────────────────────────┬──────────────┘
                                   │                             │
                        [ventas_clean.csv]              [ventas_clean.json]
                                   │                             │
                                   ▼                             ▼
┌──────────────────────────────────────────────────┐ ┌──────────────────────────────────────────────────┐
│             APACHE HADOOP CLUSTER (HDFS)         │ │            MONGODB 7.0 NOSQL (datastore_db)       │
│  • /datastore/raw/ventas.csv                     │ │  • Colección: ventas (19,921 documentos)         │
│  • /datastore/processed/ventas_clean.csv         │ │  • Índices: Ciudad, Categoría, Fecha, Producto   │
│  • NameNode (9870) + DataNode (9864)             │ │  • Índice Compuesto: [Categoría, Total_Venta]    │
└──────────────────────────────────────────────────┘ └─────────────────────────┬────────────────────────┘
                                                                               │
                                                                               ▼
                                                     ┌──────────────────────────────────────────────────┐
                                                     │         DASHBOARD BI & AD-HOC ANALYTICS          │
                                                     │  • 6 Tarjetas KPI Dinámicas en Tiempo Real       │
                                                     │  • 8 Gráficos Estadísticos Interactivos          │
                                                     │  • Panel de Consultas Libres (Slice & Dice)      │
                                                     │  • Generador MQL & Exportación PDF/CSV           │
                                                     │  • Puerto: http://localhost:3000                 │
                                                     └──────────────────────────────────────────────────┘
```

---

## 🐳 Ecosistema de Contenedores (Docker Compose)

El archivo [`docker-compose.yml`](docker-compose.yml) orquesta los 4 microservicios en una red aislada `datastore_net`:

| Servicio | Contenedor | Imagen | Puertos | Propósito |
|:---|:---|:---|:---|:---|
| **HDFS NameNode** | `datastore_namenode` | `bde2020/hadoop-namenode:2.0.0-hadoop3.2.1-java8` | `9870`, `9000` | Maestro HDFS y Web UI |
| **HDFS DataNode** | `datastore_datanode` | `bde2020/hadoop-datanode:2.0.0-hadoop3.2.1-java8` | `9864` | Almacenamiento distribuido |
| **MongoDB** | `datastore_mongodb` | `mongo:7.0` | `27017` | Base de datos NoSQL documental |
| **Mongo Express** | `datastore_mongo_express` | `mongo-express:1.0.2` | `8081` | Interfaz gráfica web de MongoDB |

---

## 🧹 Pipeline ETL de Calidad de Datos

El script [`clean_data.py`](clean_data.py) procesa y audita el dataset crudo registrando métricas de calidad:

### Métricas de Calidad (Antes vs. Después)
| Indicador | Antes de Limpieza | Después de Limpieza | Variación / Estado |
|:---|:---|:---|:---|
| **Registros Totales** | 20,000 | **19,921** | -79 filas (-0.40%) |
| **Registros Duplicados** | 79 | **0** | 100% Removidos |
| **Formato de Fecha** | Mixto (`DD/MM/YYYY`) | **ISO (`YYYY-MM-DD`)** | 100% Estandarizado |
| **Validación Numérica** | Sin validar | `Cantidad > 0`, `Precio > 0` | 100% Válidos |
| **Facturación Total Auditada** | - | **S/ 224,661,615.25** | Consolidada |
| **Unidades Físicas Auditadas** | - | **208,404 unidades** | Consolidada |

---

## 🐘 Almacenamiento Distribuido (HDFS)

El script [`hdfs_operations.py`](hdfs_operations.py) automatiza la administración del clúster Hadoop:

```bash
# Comandos HDFS principales ejecutados en el clúster:
hdfs dfs -mkdir -p /datastore/raw /datastore/processed
hdfs dfs -put -f /data/ventas.csv /datastore/raw/ventas.csv
hdfs dfs -put -f /data/ventas_clean.csv /datastore/processed/ventas_clean.csv
hdfs dfs -ls -R /datastore
hdfs dfs -count -q -h -v /datastore/processed/ventas_clean.csv
hdfs dfs -head /datastore/processed/ventas_clean.csv
```

---

## 🍃 Base de Datos NoSQL e Indexación (MongoDB)

El script [`ingest_mongo.py`](ingest_mongo.py) realiza la carga masiva en lotes (*Bulk Insert*) en la base de datos `datastore_db` y colección `ventas`:

* **Velocidad de Ingesta:** 19,921 documentos insertados en **0.177 segundos** (**112,305 docs/segundo**).
* **Índices Estratégicos Creados:**
  ```javascript
  db.ventas.createIndex({ "Ciudad": 1 }, { name: "idx_ciudad" })
  db.ventas.createIndex({ "Categoría": 1 }, { name: "idx_categoria" })
  db.ventas.createIndex({ "Fecha": 1 }, { name: "idx_fecha" })
  db.ventas.createIndex({ "Producto": 1 }, { name: "idx_producto" })
  // Índice compuesto para consultas de ventas de alto valor:
  db.ventas.createIndex({ "Categoría": 1, "Total_Venta": -1 }, { name: "idx_cat_total_venta" })
  ```

---

## 📈 Banco de Consultas Analíticas (MQL)

El script [`run_queries.py`](run_queries.py) ejecuta 5 consultas estratégicas bajo el marco **`[RESULTADO] → [INTERPRETACIÓN] → [DECISIÓN PROPUESTA]`**:

1. **Ventas High-End (`Total_Venta > S/ 5,000` en Computadoras):**  
   *Resultado:* 5,205 operaciones de alto valor (tickets hasta S/ 114,400.00).  
   *Decisión:* Apertura de línea de crédito corporativo B2B con ejecutivos dedicados.
2. **Estacionalidad Mensual:**  
   *Resultado:* Facturación mensual estable (S/ 18.4M a S/ 19.3M) con ticket promedio sostenido en ~S/ 11,270.  
   *Decisión:* Compras trimestrales consolidadas para capturar 10% de descuento por volumen.
3. **Ranking Geográfico por Sede:**  
   *Resultado:* Lima (S/ 29.2M) y Trujillo (S/ 29.1M) lideran en volumen; Tacna y Puno obtienen el ticket promedio más alto (S/ 11,454.06).  
   *Decisión:* Establecer Hub de Distribución en Lima y canal B2B especializado en la región sur.
4. **Matriz de Rotación de Productos:**  
   *Resultado:* `Disco SSD 2TB` lidera demanda física (11,272 u.), mientras que `Impresora A` registra menor rotación (9,874 u.).  
   *Decisión:* Crear combos promocionales (*Bundles*) con 15% de descuento para acelerar inventario.
5. **Comportamiento Cruzado Multivariable:**  
   *Resultado:* La categoría *Computadoras* domina el 100% de las 8 sedes comerciales (>78% de los ingresos).  
   *Decisión:* Alianzas estratégicas directas con fabricantes Tier-1 (Dell, Lenovo, HP).

---

## 🖥️ Dashboard Ejecutivo & Consultas Libres (React SPA)

Aplicación web interactiva alojada en [`src/`](src/) construida con **React 18 + Tailwind CSS + Chart.js**:

* **Layout con Sidebar Lateral y Adaptación Full Screen 1080p / 2K / 4K.**
* **6 Tarjetas KPI Dinámicas:** Facturación Total, Transacciones, Unidades Vendidas, Ticket Promedio, Producto Top y Sede Líder.
* **8 Gráficos Estadísticos:** Tendencia temporal en área degradada, Donut de participación, Barras Top/Bottom, Comparativo por ciudad, Matriz agrupada Ciudad vs. Categoría y Radar de ticket promedio.
* **Panel de Consultas Libres (Ad-Hoc Query Builder):** Permite cruzar libremente cualquier dimensión (Sede, Categoría, SKU, Mes, Trimestre) con cualquier métrica, visualizar la **Tabla Matricial Jerárquica** y copiar el código **MQL de MongoDB** correspondiente en tiempo real.
* **Modo Oscuro / Claro y Exportación Formal a PDF (`Ctrl + P`) o CSV.**

---

## 🛠️ Instalación y Puesta en Marcha

### Prerrequisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (con Docker Compose).
* [Node.js 18+](https://nodejs.org/) y npm.
* [Python 3.10+](https://www.python.org/).

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/RodyRafaelSenati/Implementaci-n-b-sica-de-una-arquitectura-Big-Data.git
cd Implementaci-n-b-sica-de-una-arquitectura-Big-Data
```

### Paso 2: Levantar la Infraestructura Contenerizada
```bash
docker compose up -d
docker compose ps
```

### Paso 3: Ejecutar el Pipeline Completo Automatizado
```powershell
# En Windows PowerShell
powershell -ExecutionPolicy Bypass -File .\run_all_and_log.ps1
```
```bash
# En Linux / macOS / Git Bash
chmod +x run_all_and_log.sh
./run_all_and_log.sh
```

### Paso 4: Iniciar el Dashboard Web
```bash
npm install
npm run dev
```

---

## 🌐 URLs de Acceso a Servicios

| Servicio | URL | Descripción |
|:---|:---|:---|
| **Dashboard BI (React SPA)** | [`http://localhost:3000`](http://localhost:3000) | Panel interactivo principal y consultas ad-hoc |
| **Mongo Express** | [`http://localhost:8081`](http://localhost:8081) | Explorador web visual de colecciones MongoDB |
| **Hadoop NameNode HDFS** | [`http://localhost:9870`](http://localhost:9870) | Interfaz web del clúster de archivos distribuido |

---

## 📁 Estructura del Repositorio

```text
├── docker-compose.yml          # Definición de contenedores (HDFS NameNode, DataNode, MongoDB, Mongo Express)
├── hadoop.env                  # Variables de entorno del clúster Hadoop
├── clean_data.py               # Pipeline ETL de limpieza, validación y métricas
├── hdfs_operations.py          # Operaciones y persistencia en clúster HDFS
├── ingest_mongo.py             # Ingesta masiva e indexación en MongoDB
├── run_queries.py              # Banco de 5 consultas analíticas MQL (Metodología R-I-D)
├── run_all_and_log.ps1         # Script de automatización integral para PowerShell
├── run_all_and_log.sh          # Script de automatización integral para Bash
├── REPORTE_BIGDATA.md          # Reporte técnico y ejecutivo detallado
├── PRESENTACION_PROYECTO.md    # Guía diapositiva por diapositiva para exposición
├── src/                        # Código fuente del Dashboard React
│   ├── components/
│   │   ├── layout/             # Sidebar, TopHeader, Footer
│   │   ├── filters/            # Barra de filtros globales reactivos
│   │   ├── kpi/                # Tarjetas KPI adaptables
│   │   ├── charts/             # 8 Gráficos estadísticos Chart.js
│   │   ├── adhoc/              # Panel de Consultas Libres & Generador MQL
│   │   ├── insights/           # Módulo de Insights Estratégicos
│   │   └── report/             # Reporte ejecutivo y modal de tabla de MongoDB
│   ├── context/DataContext.jsx # Estado global y sincronización con Big Data
│   └── utils/                  # Procesadores estadísticos y formateadores
├── package.json                # Dependencias frontend (React, Vite, Chart.js, Lucide)
└── README.md                   # Documentación principal del proyecto
```

---

<div align="center">
  <b>DATASTORE S.A.C. © 2026 — Proyecto de Arquitectura Big Data & Business Intelligence</b>
</div>
