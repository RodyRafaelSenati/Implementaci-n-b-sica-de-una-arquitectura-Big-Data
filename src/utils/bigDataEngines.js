/**
 * DATASTORE S.A.C. - Motores de Procesamiento Distribuido Big Data
 * Implementación de algoritmos reales y simulación arquitectónica de:
 * 1. Hadoop MapReduce (Batch basado en disco HDFS)
 * 2. Apache Spark (In-Memory RDDs & DataFrames)
 * 3. Apache Flink (Stream Processing & Event-Driven)
 */

import PapaParse from 'papaparse';

// Limpieza y Validación de Datos
export const cleanAndValidateDataset = (rawRows) => {
  const initialCount = rawRows.length;
  const seenKeys = new Set();
  const cleanRows = [];
  let removedCount = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    
    // Validar campos obligatorios
    const fecha = (row.Fecha || row.fecha || '').trim();
    const producto = (row.Producto || row.producto || '').trim();
    const categoria = (row.Categoría || row.Categoria || row.categoria || '').trim();
    const cantidadStr = (row.Cantidad || row.cantidad || '').trim();
    const precioStr = (row.Precio || row.precio || '').trim();
    const ciudad = (row.Ciudad || row.ciudad || '').trim();

    if (!fecha || !producto || !categoria || !ciudad) {
      removedCount++;
      continue;
    }

    const cantidad = parseInt(cantidadStr, 10);
    const precio = parseFloat(precioStr);

    if (isNaN(cantidad) || isNaN(precio) || cantidad <= 0 || precio <= 0) {
      removedCount++;
      continue;
    }

    // Normalizar Fecha a ISO YYYY-MM-DD
    let isoDate = fecha;
    if (fecha.includes('/')) {
      const parts = fecha.split('/');
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        isoDate = `${y}-${m}-${d}`;
      }
    }

    // Deduplicación por clave de fila
    const dedupeKey = `${isoDate}|${producto}|${categoria}|${cantidad}|${precio}|${ciudad}`;
    if (seenKeys.has(dedupeKey)) {
      removedCount++;
      continue;
    }
    seenKeys.add(dedupeKey);

    const totalVenta = Math.round((cantidad * precio) * 100) / 100;

    cleanRows.push({
      id: cleanRows.length + 1,
      Fecha: isoDate,
      Producto: producto,
      Categoría: categoria,
      Cantidad: cantidad,
      Precio: precio,
      Ciudad: ciudad,
      Total_Venta: totalVenta
    });
  }

  return {
    initialCount,
    removedCount,
    cleanCount: cleanRows.length,
    cleanRows
  };
};

/**
 * 1. MOTOR HADOOP MAPREDUCE
 * Simulación del flujo Map ➔ Shuffle & Sort ➔ Reduce ➔ HDFS Output
 */
export const runHadoopMapReduce = (dataset) => {
  const startTime = performance.now();

  // FASE 1: MAPPER
  // Entrada: Registro -> Salida: tupla (Producto, { ventas: Total_Venta, unidades: Cantidad })
  const mapOutput = [];
  const mapSamples = [];

  for (let i = 0; i < dataset.length; i++) {
    const row = dataset[i];
    const mapTuple = {
      key: row.Producto,
      value: {
        ventas: row.Total_Venta,
        unidades: row.Cantidad
      }
    };
    mapOutput.push(mapTuple);
    if (i < 6) {
      mapSamples.push(mapTuple);
    }
  }

  // FASE 2: SHUFFLE & SORT (Particionamiento y agrupamiento por clave)
  const shuffleGroups = {};
  for (let i = 0; i < mapOutput.length; i++) {
    const { key, value } = mapOutput[i];
    if (!shuffleGroups[key]) {
      shuffleGroups[key] = [];
    }
    shuffleGroups[key].push(value);
  }

  const shuffleSamples = Object.keys(shuffleGroups).map(key => ({
    key,
    count: shuffleGroups[key].length,
    sampleValues: shuffleGroups[key].slice(0, 3)
  }));

  // FASE 3: REDUCER
  // Entrada: (Producto, [valores]) -> Salida: (Producto, { totalVentas, totalUnidades })
  const reduceOutput = {};
  const productList = Object.keys(shuffleGroups).sort();

  for (let i = 0; i < productList.length; i++) {
    const key = productList[i];
    const valuesList = shuffleGroups[key];
    
    let sumVentas = 0;
    let sumUnidades = 0;

    for (let j = 0; j < valuesList.length; j++) {
      sumVentas += valuesList[j].ventas;
      sumUnidades += valuesList[j].unidades;
    }

    reduceOutput[key] = {
      producto: key,
      totalUnidades: sumUnidades,
      totalVentas: Math.round(sumVentas * 100) / 100,
      transacciones: valuesList.length
    };
  }

  // FASE 4: HDFS Output format (part-r-00000)
  const hdfsLines = [
    "# HDFS Output: /datastore/output/part-r-00000",
    "# Formato: [Producto]\\t[Total_Unidades]\\t[Total_Facturacion_PEN]"
  ];
  Object.values(reduceOutput).forEach(r => {
    hdfsLines.push(`${r.producto}\t${r.totalUnidades}\t${r.totalVentas.toFixed(2)}`);
  });

  const durationMs = Math.round(performance.now() - startTime + 18420); // Simulación de overhead I/O de HDFS (18.4s)

  // Logs auténticos de Hadoop
  const logs = [
    `[INFO] org.apache.hadoop.mapreduce.JobSubmitter: Submitting tokens for job: job_1725450123456_0001`,
    `[INFO] org.apache.hadoop.mapreduce.JobSubmitter: Cleaning staging directory hdfs://datastore_namenode:9000/tmp/hadoop-yarn/staging`,
    `[INFO] org.apache.hadoop.yarn.client.api.impl.YarnClientImpl: Submitted application application_1725450123456_0001`,
    `[INFO] org.apache.hadoop.mapreduce.Job: The url to track the job: http://datastore_namenode:8088/proxy/application_1725450123456_0001/`,
    `[INFO] org.apache.hadoop.mapreduce.Job: Running job: job_1725450123456_0001`,
    `[INFO] org.apache.hadoop.mapreduce.Job: Job job_1725450123456_0001 running in uber mode : false`,
    `[INFO] org.apache.hadoop.mapreduce.Job:  map 0% reduce 0%`,
    `[INFO] org.apache.hadoop.mapred.Task:  Task 'attempt_1725450123456_0001_m_000000_0' done. Mapped ${dataset.length} records.`,
    `[INFO] org.apache.hadoop.mapreduce.Job:  map 100% reduce 0%`,
    `[INFO] org.apache.hadoop.mapred.Task:  Shuffle & Sort completed. Spill to disk committed: 1.48 MB`,
    `[INFO] org.apache.hadoop.mapred.Task:  Task 'attempt_1725450123456_0001_r_000000_0' done. Reduced ${productList.length} keys.`,
    `[INFO] org.apache.hadoop.mapreduce.Job:  map 100% reduce 100%`,
    `[INFO] org.apache.hadoop.mapreduce.Job: Job job_1725450123456_0001 completed successfully`,
    `[INFO] org.apache.hadoop.mapreduce.Job: Output written to hdfs://datastore_namenode:9000/datastore/output/part-r-00000`
  ];

  return {
    engine: 'Hadoop MapReduce',
    executionTimeMs: durationMs,
    latencyFormatted: `${(durationMs / 1000).toFixed(2)} s`,
    memoryUsedMB: 1024,
    diskSpillMB: 1.48,
    mapSamples,
    shuffleSamples,
    reduceOutput,
    hdfsText: hdfsLines.join('\n'),
    logs
  };
};

/**
 * 2. MOTOR APACHE SPARK
 * In-Memory RDD / DataFrame Transformation & DAG Execution
 */
export const runApacheSpark = (dataset) => {
  const startTime = performance.now();

  // DAG Pipeline:
  // Stage 0: textFile(hdfs://...) -> rdd.map(row => (row.Producto, (row.Cantidad, row.Total_Venta)))
  // Stage 1: reduceByKey((acc, curr) => (acc[0] + curr[0], acc[1] + curr[1])) -> collect()
  
  const aggregation = {};
  dataset.forEach(row => {
    const prod = row.Producto;
    if (!aggregation[prod]) {
      aggregation[prod] = {
        producto: prod,
        totalUnidades: 0,
        totalVentas: 0,
        transacciones: 0
      };
    }
    aggregation[prod].totalUnidades += row.Cantidad;
    aggregation[prod].totalVentas += row.Total_Venta;
    aggregation[prod].transacciones += 1;
  });

  Object.values(aggregation).forEach(a => {
    a.totalVentas = Math.round(a.totalVentas * 100) / 100;
  });

  const durationMs = Math.round(performance.now() - startTime + 1180); // In-Memory Spark latency (~1.18s)

  const logs = [
    `[INFO] org.apache.spark.SparkContext: Running Spark version 3.4.1 (Java 17 / Scala 2.12)`,
    `[INFO] org.apache.spark.SparkContext: Submitted application: DatastoreProductAggregationApp`,
    `[INFO] org.apache.spark.internal.Logging: Created SparkSession with master local[4]`,
    `[INFO] org.apache.spark.storage.BlockManagerMaster: Registered BlockManager BlockManagerId(driver, 127.0.0.1, 54321, None)`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: Registering RDD 1 (map at SparkApp.py:18)`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: Got job 0 (collect at SparkApp.py:22) with 4 output partitions`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: Final Stage: ResultStage 1 (reduceByKey at SparkApp.py:20)`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: Parents of final stage: List(ShuffleMapStage 0)`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: Missing parents: List()`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: Submitting ResultStage 1 (In-Memory Pipeline, Zero Disk Spill)`,
    `[INFO] org.apache.spark.scheduler.TaskSetManager: Starting task 0.0 in stage 1.0 (TID 0, executor driver, partition 0, PROCESS_LOCAL)`,
    `[INFO] org.apache.spark.scheduler.TaskSetManager: Finished task 0.0 in stage 1.0 (TID 0) in 124 ms`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: ResultStage 1 (collect at SparkApp.py:22) finished in ${(durationMs/1000).toFixed(3)} s`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: Job 0 finished: collect at SparkApp.py:22, took ${(durationMs/1000).toFixed(3)} s`
  ];

  return {
    engine: 'Apache Spark',
    executionTimeMs: durationMs,
    latencyFormatted: `${(durationMs / 1000).toFixed(2)} s`,
    memoryUsedMB: 512,
    diskSpillMB: 0.0,
    partitions: 4,
    reduceOutput: aggregation,
    dagStages: [
      { id: 'Stage 0', name: 'ParallelCollectionRDD / DataFrame Ingestion', transformation: 'source.map()' },
      { id: 'Stage 1', name: 'ShuffleExchange / PartitionBy(Hash)', transformation: 'groupBy(Producto)' },
      { id: 'Stage 2', name: 'AggregateInPlace / In-Memory Accumulator', transformation: 'sum(Cantidad), sum(Total_Venta)' },
      { id: 'Stage 3', name: 'Action: collect()', transformation: 'Result Array to Driver' }
    ],
    logs
  };
};

/**
 * 3. MOTOR APACHE FLINK
 * Stream Processing & Event-Driven Stateful Aggregation
 */
export const runApacheFlink = (dataset) => {
  const startTime = performance.now();

  // Flink DataStream Event Stream:
  // env.fromCollection(dataset)
  //    .assignTimestampsAndWatermarks(...)
  //    .keyBy(Producto)
  //    .window(TumblingEventTimeWindows.of(Time.days(1)))
  //    .reduce(new SumAggregator())

  const streamState = {};
  let totalCheckpoints = 12;

  dataset.forEach((row, idx) => {
    const key = row.Producto;
    if (!streamState[key]) {
      streamState[key] = {
        producto: key,
        totalUnidades: 0,
        totalVentas: 0,
        transacciones: 0,
        lastEventTime: row.Fecha
      };
    }
    streamState[key].totalUnidades += row.Cantidad;
    streamState[key].totalVentas += row.Total_Venta;
    streamState[key].transacciones += 1;
    streamState[key].lastEventTime = row.Fecha;
  });

  Object.values(streamState).forEach(s => {
    s.totalVentas = Math.round(s.totalVentas * 100) / 100;
  });

  const durationMs = Math.round(performance.now() - startTime + 790); // Stream micro-pipelining latency (~0.79s)

  const logs = [
    `[INFO] org.apache.flink.runtime.minicluster.MiniCluster: Starting Flink MiniCluster v1.17.1 (1 TaskManagers, 4 Slots)`,
    `[INFO] org.apache.flink.runtime.dispatcher.StandaloneDispatcher: Dispatcher initialized with JobGraph: DatastoreStreamJob`,
    `[INFO] org.apache.flink.runtime.executiongraph.ExecutionGraph: Job DatastoreStreamJob (1725459876543) switched to state RUNNING.`,
    `[INFO] org.apache.flink.streaming.runtime.tasks.StreamTask: Initializing KeyedStream state backend (MemoryStateBackend / RocksDB)`,
    `[INFO] org.apache.flink.runtime.checkpoint.CheckpointCoordinator: Triggering checkpoint 1 @ 1725459877000 for job 1725459876543.`,
    `[INFO] org.apache.flink.runtime.checkpoint.CheckpointCoordinator: Completed checkpoint 1 for job 1725459876543 in 18 ms.`,
    `[INFO] org.apache.flink.streaming.api.operators.StreamingRuntimeContext: Ingested ${dataset.length} events through TumblingEventTimeWindow`,
    `[INFO] org.apache.flink.runtime.checkpoint.CheckpointCoordinator: Completed checkpoint ${totalCheckpoints} (State: 100% Consistent, 0 Loss)`,
    `[INFO] org.apache.flink.runtime.executiongraph.ExecutionGraph: Job DatastoreStreamJob reached EOF. Flushed state to Sink.`,
    `[INFO] org.apache.flink.runtime.executiongraph.ExecutionGraph: Job DatastoreStreamJob switched to state FINISHED in ${(durationMs/1000).toFixed(3)} s`
  ];

  return {
    engine: 'Apache Flink',
    executionTimeMs: durationMs,
    latencyFormatted: `${(durationMs / 1000).toFixed(2)} s`,
    memoryUsedMB: 256,
    diskSpillMB: 0.0,
    checkpointsCompleted: totalCheckpoints,
    reduceOutput: streamState,
    streamPipeline: [
      { step: '1. Source Stream', detail: 'EventStream Ingestion (Record-by-Record FIFO)' },
      { step: '2. Watermark & Timestamps', detail: 'EventTime Assigner & BoundedOutOfOrderness' },
      { step: '3. KeyedStream Partition', detail: 'KeyBy(r -> r.Producto) Stateful Partitioning' },
      { step: '4. Managed State Accumulator', detail: 'RocksDB StateBackend / In-Memory Checkpoints' },
      { step: '5. Sink Emission', detail: 'Real-time Aggregated Output Stream' }
    ],
    logs
  };
};

/**
 * Generador de Matriz de Comparativa Técnica
 */
export const getTechnicalComparisonMatrix = () => [
  {
    criterion: 'Paradigma de Ejecución',
    hadoop: 'Batch tradicional (Map-Reduce en 2 fases)',
    spark: 'In-Memory Micro-Batch / RDD DAG',
    flink: 'True Streaming (Evento a evento nativo)',
    winner: 'flink'
  },
  {
    criterion: 'Latencia y Rendimiento',
    hadoop: 'Alta (~18.4 s) por persistencia intermedia en HDFS',
    spark: 'Ultra baja (~1.2 s) por cálculo 100% en RAM',
    flink: 'Mínima / Tiempo Real (~0.8 s) en pipelines streaming',
    winner: 'flink'
  },
  {
    criterion: 'Uso de Memoria vs. Disco',
    hadoop: 'Intensivo en Disco I/O (Spill obligatorio en Shuffle)',
    spark: 'Intensivo en RAM (Spill a disco solo si se excede RAM)',
    flink: 'Optimizado en RAM con Managed State (RocksDB)',
    winner: 'spark'
  },
  {
    criterion: 'Tolerancia a Fallos',
    hadoop: 'Reejecución de tareas Map/Reduce desde HDFS',
    spark: 'Linaje de RDDs (Recalcula solo la partición perdida)',
    flink: 'Checkpoints Chandy-Lamport (Exactamente una vez)',
    winner: 'flink'
  },
  {
    criterion: 'Complejidad de Código',
    hadoop: 'Alta (Clases separadas Mapper, Reducer, Driver Java)',
    spark: 'Baja / Declarativa (DataFrames, SQL, PySpark)',
    flink: 'Media-Baja (DataStream / Table API fluida)',
    winner: 'spark'
  },
  {
    criterion: 'Casos de Uso Ideales',
    hadoop: 'ETL nocturno masivo en Terabytes/Petabytes',
    spark: 'Machine Learning iterativo y Analítica OLAP interactiva',
    flink: 'Detección de fraude, alertas IoT y Streaming continuo',
    winner: 'all'
  }
];
