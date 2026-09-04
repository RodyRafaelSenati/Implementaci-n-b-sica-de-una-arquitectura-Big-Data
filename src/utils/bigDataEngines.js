/**
 * DATASTORE S.A.C. - Motores de Procesamiento Distribuido Big Data
 * Implementación de algoritmos reales y simulación arquitectónica de:
 * 1. Hadoop MapReduce (Batch basado en disco HDFS)
 * 2. Apache Spark (In-Memory RDDs & DataFrames)
 * 3. Apache Flink (Stream Processing & Event-Driven)
 */

// Función auxiliar para buscar valor en objeto insensible a mayúsculas/acentos
const getFieldValue = (obj, possibleKeys) => {
  if (!obj || typeof obj !== 'object') return '';
  const objKeys = Object.keys(obj);
  for (const pKey of possibleKeys) {
    const pNorm = pKey.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    for (const k of objKeys) {
      const kNorm = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      if (kNorm === pNorm && obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') {
        return String(obj[k]).trim();
      }
    }
  }
  return '';
};

// Limpieza y Validación de Datos Flexible para cualquier CSV subido
export const cleanAndValidateDataset = (rawRows) => {
  if (!rawRows || !Array.isArray(rawRows)) {
    return { initialCount: 0, removedCount: 0, cleanCount: 0, cleanRows: [] };
  }

  const initialCount = rawRows.length;
  const seenKeys = new Set();
  const cleanRows = [];
  let removedCount = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || typeof row !== 'object') {
      removedCount++;
      continue;
    }
    
    const fecha = getFieldValue(row, ['Fecha', 'fecha', 'Date', 'date', 'FECHA', 'Timestamp', 'time']);
    const producto = getFieldValue(row, ['Producto', 'producto', 'Product', 'product', 'Item', 'item', 'PRODUCTO', 'Descripcion', 'Description', 'Name', 'Nombre']);
    const categoria = getFieldValue(row, ['Categoría', 'Categoria', 'categoria', 'Category', 'category', 'CATEGORIA', 'Linea', 'Type', 'Tipo']) || 'General';
    const cantidadStr = getFieldValue(row, ['Cantidad', 'cantidad', 'Quantity', 'quantity', 'Qty', 'qty', 'Unidades', 'Units', 'CANTIDAD', 'Count']);
    const precioStr = getFieldValue(row, ['Precio', 'precio', 'Price', 'price', 'Unit_Price', 'Precio_Unitario', 'PRECIO', 'Valor', 'Rate']);
    const ciudad = getFieldValue(row, ['Ciudad', 'ciudad', 'City', 'city', 'Sede', 'sede', 'Location', 'CIUDAD', 'Region', 'Sucursal']) || 'Lima';

    if (!producto) {
      removedCount++;
      continue;
    }

    // Normalizar Cantidad y Precio
    let cantidad = parseInt(String(cantidadStr).replace(/[^0-9]/g, ''), 10);
    let cleanPrecioStr = String(precioStr).replace(/[^0-9.,]/g, '').replace(',', '.');
    let precio = parseFloat(cleanPrecioStr);

    if (isNaN(cantidad) || cantidad <= 0) cantidad = 1;
    if (isNaN(precio) || precio <= 0) precio = 100.0;

    // Normalizar Fecha a ISO YYYY-MM-DD
    let isoDate = fecha || new Date().toISOString().slice(0, 10);
    if (fecha.includes('/')) {
      const parts = fecha.split('/');
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        isoDate = `${y}-${m}-${d}`;
      }
    } else if (fecha.includes('-')) {
      const parts = fecha.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          isoDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
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
      fecha: isoDate,
      Producto: producto,
      producto: producto,
      Categoría: categoria,
      categoria: categoria,
      Cantidad: cantidad,
      cantidad: cantidad,
      Precio: precio,
      precio: precio,
      Ciudad: ciudad,
      ciudad: ciudad,
      Total_Venta: totalVenta,
      totalVenta: totalVenta
    });
  }

  return {
    initialCount,
    removedCount,
    cleanCount: cleanRows.length,
    cleanRows
  };
};

// Helper seguro para extraer Producto, Cantidad y Total_Venta de cualquier fila
export const extractRowMetrics = (row) => {
  const prod = row.Producto || row.producto || row.Product || row.product || row.Item || row.item || row.Nombre || row.nombre || 'Item General';
  const cant = Number(row.Cantidad ?? row.cantidad ?? row.Quantity ?? row.quantity ?? row.Qty ?? row.qty ?? 1);
  const prec = Number(row.Precio ?? row.precio ?? row.Price ?? row.price ?? 0);
  const venta = Number(row.Total_Venta ?? row.total_venta ?? row.totalVenta ?? (cant * prec));
  return {
    producto: prod.trim(),
    cantidad: isNaN(cant) ? 1 : cant,
    totalVenta: isNaN(venta) ? (cant * prec) : venta
  };
};

// Evalúa si una fila cumple con la condición de filtrado específica de cada motor
export const matchesFilterCondition = (row, filter = {}) => {
  if (!filter || !filter.type || filter.type === 'ALL' || filter.type === 'none') {
    return true;
  }

  const { type, value, minValue, maxValue } = filter;
  const rowCity = (row.Ciudad || row.ciudad || '').trim();
  const rowCategory = (row.Categoría || row.categoria || '').trim();
  const rowProduct = (row.Producto || row.producto || '').trim();
  const { cantidad, totalVenta } = extractRowMetrics(row);

  switch (type) {
    case 'CITY':
      return !value || value === 'ALL' || rowCity.toLowerCase() === String(value).toLowerCase();

    case 'CATEGORY':
      return !value || value === 'ALL' || rowCategory.toLowerCase() === String(value).toLowerCase();

    case 'PRODUCT':
      return !value || value === 'ALL' || rowProduct.toLowerCase() === String(value).toLowerCase();

    case 'MIN_AMOUNT':
      return totalVenta >= (Number(value ?? minValue) || 0);

    case 'MAX_AMOUNT':
      return totalVenta <= (Number(value ?? maxValue) || Infinity);

    case 'MIN_UNITS':
      return cantidad >= (Number(value ?? minValue) || 0);

    case 'HIGH_TICKET':
      return totalVenta >= (Number(value) || 1000);

    case 'MULTI':
      if (filter.city && filter.city !== 'ALL' && rowCity.toLowerCase() !== filter.city.toLowerCase()) {
        return false;
      }
      if (filter.category && filter.category !== 'ALL' && rowCategory.toLowerCase() !== filter.category.toLowerCase()) {
        return false;
      }
      if (filter.minAmount && totalVenta < Number(filter.minAmount)) {
        return false;
      }
      if (filter.minUnits && cantidad < Number(filter.minUnits)) {
        return false;
      }
      return true;

    default:
      return true;
  }
};

/**
 * 1. MOTOR HADOOP MAPREDUCE
 * Simulación del flujo Map ➔ Shuffle & Sort ➔ Reduce ➔ HDFS Output con soporte de Filtrado en Mapper
 */
export const runHadoopMapReduce = (dataset, filterConfig = { type: 'ALL' }) => {
  const safeData = Array.isArray(dataset) ? dataset : [];
  const startTime = performance.now();

  // FASE 1: MAPPER + Filtro en InputFormat / Mapper
  const mapOutput = [];
  const mapSamples = [];
  let mapperFilteredOut = 0;

  for (let i = 0; i < safeData.length; i++) {
    const row = safeData[i];
    if (!matchesFilterCondition(row, filterConfig)) {
      mapperFilteredOut++;
      continue;
    }

    const { producto, cantidad, totalVenta } = extractRowMetrics(row);
    const mapTuple = {
      key: producto,
      value: {
        ventas: totalVenta,
        unidades: cantidad
      }
    };
    mapOutput.push(mapTuple);
    if (mapSamples.length < 6) {
      mapSamples.push(mapTuple);
    }
  }

  // FASE 2: SHUFFLE & SORT
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
    `# Filtro Mapper: ${filterConfig.label || filterConfig.type || 'Sin Filtro (ALL)'}`,
    "# Formato: [Producto]\\t[Total_Unidades]\\t[Total_Facturacion_PEN]"
  ];
  Object.values(reduceOutput).forEach(r => {
    hdfsLines.push(`${r.producto}\t${r.totalUnidades}\t${r.totalVentas.toFixed(2)}`);
  });

  // Latencia proporcional al volumen de datos filtrados
  const baseLatency = (mapOutput.length * 0.92) + (mapperFilteredOut * 0.15) + 180;
  const durationMs = Math.round(baseLatency);

  const logs = [
    `[INFO] org.apache.hadoop.mapreduce.JobSubmitter: Submitting tokens for job: job_${Date.now()}_0001`,
    `[INFO] org.apache.hadoop.mapreduce.JobSubmitter: Cleaning staging directory hdfs://datastore_namenode:9000/tmp/hadoop-yarn/staging`,
    `[INFO] org.apache.hadoop.yarn.client.api.impl.YarnClientImpl: Submitted application application_${Date.now()}_0001`,
    `[INFO] org.apache.hadoop.mapreduce.Job: Running job on dataset with ${safeData.length} input records`,
    filterConfig && filterConfig.type !== 'ALL'
      ? `[INFO] org.apache.hadoop.mapreduce.lib.input.FileInputFilter: Mapper Predicate applied [${filterConfig.label || filterConfig.type}]. Filtered ${mapOutput.length}/${safeData.length} records (${mapperFilteredOut} pruned).`
      : `[INFO] org.apache.hadoop.mapreduce.Job: No Mapper Predicate Filter (Processing 100% of input split).`,
    `[INFO] org.apache.hadoop.mapred.Task: Task map done. Mapped ${mapOutput.length} records into ${productList.length} unique keys.`,
    `[INFO] org.apache.hadoop.mapred.Task: Shuffle & Sort completed. Spill to disk committed: ${(mapOutput.length * 0.00008).toFixed(2)} MB`,
    `[INFO] org.apache.hadoop.mapred.Task: Task reduce done. Aggregated ${productList.length} products.`,
    `[INFO] org.apache.hadoop.mapreduce.Job: Job completed successfully in ${(durationMs/1000).toFixed(2)} s`,
    `[INFO] org.apache.hadoop.mapreduce.Job: Output written to hdfs://datastore_namenode:9000/datastore/output/part-r-00000`
  ];

  return {
    engine: 'Hadoop MapReduce',
    executionTimeMs: durationMs,
    latencyFormatted: `${(durationMs / 1000).toFixed(2)} s`,
    memoryUsedMB: 1024,
    diskSpillMB: parseFloat((mapOutput.length * 0.00008).toFixed(2)) || 0.1,
    totalInputRecords: safeData.length,
    filteredRecords: mapOutput.length,
    prunedRecords: mapperFilteredOut,
    filterConfig,
    mapSamples,
    shuffleSamples,
    reduceOutput,
    hdfsText: hdfsLines.join('\n'),
    logs
  };
};

/**
 * 2. MOTOR APACHE SPARK
 * In-Memory RDD / DataFrame Transformation & DAG Execution con Catalyst Predicate Pushdown
 */
export const runApacheSpark = (dataset, filterConfig = { type: 'ALL' }) => {
  const safeData = Array.isArray(dataset) ? dataset : [];
  const startTime = performance.now();

  const aggregation = {};
  let passedCount = 0;
  let prunedCount = 0;

  for (let i = 0; i < safeData.length; i++) {
    const row = safeData[i];
    if (!matchesFilterCondition(row, filterConfig)) {
      prunedCount++;
      continue;
    }
    passedCount++;

    const { producto, cantidad, totalVenta } = extractRowMetrics(row);
    if (!aggregation[producto]) {
      aggregation[producto] = {
        producto: producto,
        totalUnidades: 0,
        totalVentas: 0,
        transacciones: 0
      };
    }
    aggregation[producto].totalUnidades += cantidad;
    aggregation[producto].totalVentas += totalVenta;
    aggregation[producto].transacciones += 1;
  }

  Object.values(aggregation).forEach(a => {
    a.totalVentas = Math.round(a.totalVentas * 100) / 100;
  });

  // Generación dinámica del código PySpark según el filtro
  let filterPyCode = '# Sin filtro aplicado (DataFrame completo)';
  if (filterConfig.type === 'CITY') {
    filterPyCode = `df_filtered = df.filter(col("Ciudad") == "${filterConfig.value || 'Lima'}")`;
  } else if (filterConfig.type === 'CATEGORY') {
    filterPyCode = `df_filtered = df.filter(col("Categoría") == "${filterConfig.value || 'Laptops'}")`;
  } else if (filterConfig.type === 'MIN_AMOUNT') {
    filterPyCode = `df_filtered = df.filter(col("Total_Venta") >= ${filterConfig.value || 500})`;
  } else if (filterConfig.type === 'MIN_UNITS') {
    filterPyCode = `df_filtered = df.filter(col("Cantidad") >= ${filterConfig.value || 3})`;
  } else if (filterConfig.type === 'MULTI') {
    filterPyCode = `df_filtered = df.filter((col("Ciudad") == "${filterConfig.city || 'Lima'}") & (col("Total_Venta") >= ${filterConfig.minAmount || 200}))`;
  }

  // Latencia Spark en memoria proporcional a registros evaluados
  const baseLatency = (passedCount * 0.058) + (prunedCount * 0.008) + 55;
  const durationMs = Math.round(baseLatency);

  const logs = [
    `[INFO] org.apache.spark.SparkContext: Running Spark version 3.4.1 (Java 17 / Scala 2.12)`,
    `[INFO] org.apache.spark.SparkContext: Submitted application: DatastoreProductAggregationApp`,
    `[INFO] org.apache.spark.internal.Logging: Created SparkSession with master local[4]`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: Ingested ${safeData.length} records into DataFrame / ParallelCollectionRDD`,
    filterConfig && filterConfig.type !== 'ALL'
      ? `[INFO] org.apache.spark.sql.execution.FilterExec: Catalyst Optimizer Predicate Pushdown [${filterConfig.label || filterConfig.type}]: Evaluated ${passedCount}/${safeData.length} records in RAM (${prunedCount} pruned).`
      : `[INFO] org.apache.spark.sql.execution.FileSourceScanExec: Scanning full partition without predicates.`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: Got job 0 (collect) with 4 output partitions`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: Submitting ResultStage 1 (In-Memory Pipeline, Zero Disk Spill)`,
    `[INFO] org.apache.spark.scheduler.TaskSetManager: Finished tasks in stage 1.0 (TID 0-3, PROCESS_LOCAL)`,
    `[INFO] org.apache.spark.scheduler.DAGScheduler: Job 0 finished: collect() took ${(durationMs/1000).toFixed(3)} s`
  ];

  const dagStages = [
    { id: 'Stage 0', name: 'ParallelCollectionRDD / Ingestion', transformation: `source.read(${safeData.length} rows)` }
  ];

  if (filterConfig && filterConfig.type !== 'ALL') {
    dagStages.push({
      id: 'Stage 1 (Filter)',
      name: 'Catalyst Predicate Pushdown',
      transformation: filterPyCode.replace('df_filtered = ', '')
    });
    dagStages.push({
      id: 'Stage 2',
      name: 'ShuffleExchange / PartitionBy(Hash)',
      transformation: 'groupBy(Producto)'
    });
    dagStages.push({
      id: 'Stage 3',
      name: 'AggregateInPlace / RAM Accumulator',
      transformation: 'sum(Cantidad), sum(Total_Venta)'
    });
    dagStages.push({
      id: 'Stage 4',
      name: 'Action: collect()',
      transformation: `Result Array to Driver (${Object.keys(aggregation).length} SKUs)`
    });
  } else {
    dagStages.push({ id: 'Stage 1', name: 'ShuffleExchange / PartitionBy(Hash)', transformation: 'groupBy(Producto)' });
    dagStages.push({ id: 'Stage 2', name: 'AggregateInPlace / RAM Accumulator', transformation: 'sum(Cantidad), sum(Total_Venta)' });
    dagStages.push({ id: 'Stage 3', name: 'Action: collect()', transformation: 'Result Array to Driver' });
  }

  return {
    engine: 'Apache Spark',
    executionTimeMs: durationMs,
    latencyFormatted: `${(durationMs / 1000).toFixed(2)} s`,
    memoryUsedMB: Math.min(1024, Math.max(128, Math.round(passedCount * 0.025))),
    diskSpillMB: 0.0,
    partitions: 4,
    totalInputRecords: safeData.length,
    filteredRecords: passedCount,
    prunedRecords: prunedCount,
    filterConfig,
    filterPyCode,
    reduceOutput: aggregation,
    dagStages,
    logs
  };
};

/**
 * 3. MOTOR APACHE FLINK
 * Stream Processing & Event-Driven Stateful Aggregation con FilterFunction
 */
export const runApacheFlink = (dataset, filterConfig = { type: 'ALL' }) => {
  const safeData = Array.isArray(dataset) ? dataset : [];
  const startTime = performance.now();

  const streamState = {};
  let passedCount = 0;
  let prunedCount = 0;

  for (let i = 0; i < safeData.length; i++) {
    const row = safeData[i];
    if (!matchesFilterCondition(row, filterConfig)) {
      prunedCount++;
      continue;
    }
    passedCount++;

    const { producto, cantidad, totalVenta } = extractRowMetrics(row);
    const fecha = row.Fecha || row.fecha || '2026-01-01';
    if (!streamState[producto]) {
      streamState[producto] = {
        producto: producto,
        totalUnidades: 0,
        totalVentas: 0,
        transacciones: 0,
        lastEventTime: fecha
      };
    }
    streamState[producto].totalUnidades += cantidad;
    streamState[producto].totalVentas += totalVenta;
    streamState[producto].transacciones += 1;
    streamState[producto].lastEventTime = fecha;
  }

  Object.values(streamState).forEach(s => {
    s.totalVentas = Math.round(s.totalVentas * 100) / 100;
  });

  let totalCheckpoints = Math.max(2, Math.min(24, Math.round(passedCount / 1500)));

  // Generación dinámica de código PyFlink según el filtro
  let filterFlinkCode = '# Sin filtro en el flujo continuo';
  if (filterConfig.type === 'CITY') {
    filterFlinkCode = `filtered_stream = stream.filter(lambda row: row.Ciudad == "${filterConfig.value || 'Lima'}")`;
  } else if (filterConfig.type === 'CATEGORY') {
    filterFlinkCode = `filtered_stream = stream.filter(lambda row: row.Categoría == "${filterConfig.value || 'Laptops'}")`;
  } else if (filterConfig.type === 'MIN_AMOUNT') {
    filterFlinkCode = `filtered_stream = stream.filter(lambda row: row.Total_Venta >= ${filterConfig.value || 500})`;
  } else if (filterConfig.type === 'MIN_UNITS') {
    filterFlinkCode = `filtered_stream = stream.filter(lambda row: row.Cantidad >= ${filterConfig.value || 3})`;
  } else if (filterConfig.type === 'MULTI') {
    filterFlinkCode = `filtered_stream = stream.filter(lambda r: r.Ciudad == "${filterConfig.city || 'Lima'}" and r.Total_Venta >= ${filterConfig.minAmount || 200})`;
  }

  // Latencia Flink Stream proporcional
  const baseLatency = (passedCount * 0.038) + (prunedCount * 0.005) + 38;
  const durationMs = Math.round(baseLatency);

  const logs = [
    `[INFO] org.apache.flink.runtime.minicluster.MiniCluster: Starting Flink MiniCluster v1.17.1 (1 TaskManagers, 4 Slots)`,
    `[INFO] org.apache.flink.runtime.dispatcher.StandaloneDispatcher: Dispatcher initialized with JobGraph: DatastoreStreamJob`,
    `[INFO] org.apache.flink.runtime.executiongraph.ExecutionGraph: Job DatastoreStreamJob switched to state RUNNING.`,
    `[INFO] org.apache.flink.streaming.runtime.tasks.StreamTask: Ingesting ${safeData.length} stream events into StreamExecutionEnvironment`,
    filterConfig && filterConfig.type !== 'ALL'
      ? `[INFO] org.apache.flink.streaming.api.operators.StreamFilter: FilterFunction [${filterConfig.label || filterConfig.type}] passed ${passedCount}/${safeData.length} events to KeyedStream (${prunedCount} filtered).`
      : `[INFO] org.apache.flink.streaming.runtime.tasks.StreamTask: Ingesting 100% of event stream without filter operator.`,
    `[INFO] org.apache.flink.runtime.checkpoint.CheckpointCoordinator: Completed checkpoint ${totalCheckpoints} (State: 100% Consistent, 0 Loss)`,
    `[INFO] org.apache.flink.runtime.executiongraph.ExecutionGraph: Stream Job reached EOF. Flushed state to Sink in ${(durationMs/1000).toFixed(3)} s`
  ];

  const streamPipeline = [
    { step: '1. Source Stream', detail: `EventStream Ingestion (${safeData.length} events)` }
  ];

  if (filterConfig && filterConfig.type !== 'ALL') {
    streamPipeline.push({
      step: '2. FilterFunction',
      detail: filterFlinkCode.replace('filtered_stream = ', '')
    });
    streamPipeline.push({ step: '3. Watermark & Timestamps', detail: 'EventTime Assigner & BoundedOutOfOrderness' });
    streamPipeline.push({ step: '4. KeyedStream Partition', detail: 'KeyBy(r -> r.Producto) Stateful Partitioning' });
    streamPipeline.push({ step: '5. Managed State & Sink', detail: `RocksDB StateBackend -> ${Object.keys(streamState).length} SKUs Sink` });
  } else {
    streamPipeline.push({ step: '2. Watermark & Timestamps', detail: 'EventTime Assigner & BoundedOutOfOrderness' });
    streamPipeline.push({ step: '3. KeyedStream Partition', detail: 'KeyBy(r -> r.Producto) Stateful Partitioning' });
    streamPipeline.push({ step: '4. Managed State Accumulator', detail: 'RocksDB StateBackend / In-Memory Checkpoints' });
    streamPipeline.push({ step: '5. Sink Emission', detail: 'Real-time Aggregated Output Stream' });
  }

  return {
    engine: 'Apache Flink',
    executionTimeMs: durationMs,
    latencyFormatted: `${(durationMs / 1000).toFixed(2)} s`,
    memoryUsedMB: Math.min(512, Math.max(64, Math.round(passedCount * 0.015))),
    diskSpillMB: 0.0,
    checkpointsCompleted: totalCheckpoints,
    totalInputRecords: safeData.length,
    filteredRecords: passedCount,
    prunedRecords: prunedCount,
    filterConfig,
    filterFlinkCode,
    reduceOutput: streamState,
    streamPipeline,
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
    hadoop: 'Alta por persistencia intermedia en HDFS (Spill a disco)',
    spark: 'Ultra baja por cálculo 100% en memoria RAM',
    flink: 'Mínima en micro-pipelining y streaming continuo',
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
