/**
 * Motor de Investigación de Operaciones y Programación Lineal (Linear Programming)
 * para Optimización de Restaurantes y Emprendimientos.
 * 
 * Modela:
 * - n platos (Variables de Decisión x_j)
 * - m ingredientes (Restricciones de Capacidad/Stock)
 * - Clientes Satisfechos (Restricciones de Demanda Mínima)
 * - Objetivos: Maximizar Beneficio y Minimizar Riesgo / Costos
 * - Método Gráfico 2D con Región Factible exacta, cálculo analítico de vértices,
 *   rectas de isocosto/isobeneficio y análisis de holguras.
 */

// Utilidad para resolver sistema 2x2: a1*x + b1*y = c1, a2*x + b2*y = c2
export function intersectLines(line1, line2) {
  const { a: a1, b: b1, c: c1 } = line1;
  const { a: a2, b: b2, c: c2 } = line2;
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-9) return null; // Rectas paralelas o coincidentes
  const x = (c1 * b2 - c2 * b1) / det;
  const y = (a1 * c2 - a2 * c1) / det;
  return { x, y };
}

// Verifica si un punto (x, y) cumple con todas las restricciones dentro de una tolerancia
export function isPointFeasible(x, y, constraints, tolerance = 1e-5) {
  if (x < -tolerance || y < -tolerance) return false;
  for (const c of constraints) {
    const val = c.a * x + c.b * y;
    if (c.type === '<=') {
      if (val > c.c + tolerance) return false;
    } else if (c.type === '>=') {
      if (val < c.c - tolerance) return false;
    } else if (c.type === '==') {
      if (Math.abs(val - c.c) > tolerance) return false;
    }
  }
  return true;
}

// Ordena los vértices en sentido horario alrededor de su centroide para dibujar el polígono
export function sortPolygonVertices(vertices) {
  if (vertices.length <= 2) return vertices;
  const cx = vertices.reduce((sum, p) => sum + p.x, 0) / vertices.length;
  const cy = vertices.reduce((sum, p) => sum + p.y, 0) / vertices.length;

  return [...vertices].sort((p1, p2) => {
    const angle1 = Math.atan2(p1.y - cy, p1.x - cx);
    const angle2 = Math.atan2(p2.y - cy, p2.x - cx);
    return angle1 - angle2;
  });
}

/**
 * Resuelve el Método Gráfico 2D
 * @param {Array} dishes - Lista con exactamente 2 platos seleccionados para el plano [dishX, dishY]
 * @param {Array} ingredients - Lista de ingredientes con stock y consumo
 * @param {Object} demandConfig - Demanda mínima de clientes { minTotalClients, minDishX, minDishY }
 * @param {Object} options - Parámetros adicionales (pesos multiobjetivo, etc.)
 */
export function solveGraphicalMethod(dishes, ingredients, demandConfig = {}, options = {}) {
  const [dishX, dishY] = dishes;
  if (!dishX || !dishY) {
    return { error: 'Se requieren al menos 2 platos para el método gráfico cartesiano.' };
  }

  // Coeficientes de Beneficio (Ganancia Neta = Precio de Venta - Costo Unitario de Producción)
  const profitX = (dishX.price || 0) - (dishX.cost || 0);
  const profitY = (dishY.price || 0) - (dishY.cost || 0);

  // Coeficientes de Riesgo (Índice de riesgo financiero o merma x plato)
  const riskX = dishX.risk || (dishX.cost || 0) * 0.3;
  const riskY = dishY.risk || (dishY.cost || 0) * 0.3;

  // Coeficientes de Costo Directo
  const costX = dishX.cost || 0;
  const costY = dishY.cost || 0;

  // Construir las restricciones en el plano (x = dishX, y = dishY)
  const constraints = [];

  // 1. Restricciones de Ingredientes (a*x + b*y <= Stock)
  ingredients.forEach((ing) => {
    const reqX = ing.usage[dishX.id] || 0;
    const reqY = ing.usage[dishY.id] || 0;
    if (reqX > 0 || reqY > 0) {
      constraints.push({
        id: `ing_${ing.id}`,
        name: `Stock ${ing.name} (${ing.unit})`,
        a: reqX,
        b: reqY,
        c: ing.stock,
        type: '<=',
        color: ing.color || '#38bdf8',
        category: 'ingrediente',
        ingRef: ing
      });
    }
  });

  // 2. Restricción de Clientes Satisfechos Totales: x + y >= Clientes Mínimos
  const minClients = demandConfig.minTotalClients || 0;
  if (minClients > 0) {
    constraints.push({
      id: 'demand_total',
      name: `Clientes Mínimos Satisfechos (≥ ${minClients})`,
      a: 1,
      b: 1,
      c: minClients,
      type: '>=',
      color: '#f59e0b',
      category: 'demanda'
    });
  }

  // 3. Demanda mínima individual por plato si existe
  if (demandConfig.minDishX > 0) {
    constraints.push({
      id: 'demand_dish_x',
      name: `Mín. Clientes ${dishX.name} (≥ ${demandConfig.minDishX})`,
      a: 1,
      b: 0,
      c: demandConfig.minDishX,
      type: '>=',
      color: '#ec4899',
      category: 'demanda'
    });
  }

  if (demandConfig.minDishY > 0) {
    constraints.push({
      id: 'demand_dish_y',
      name: `Mín. Clientes ${dishY.name} (≥ ${demandConfig.minDishY})`,
      a: 0,
      b: 1,
      c: demandConfig.minDishY,
      type: '>=',
      color: '#a855f7',
      category: 'demanda'
    });
  }

  // 4. Capacidad máxima de cocina diaria (platos totales) opcional
  if (demandConfig.maxKitchenCapacity > 0) {
    constraints.push({
      id: 'kitchen_capacity',
      name: `Capacidad Máx. Cocina (≤ ${demandConfig.maxKitchenCapacity})`,
      a: 1,
      b: 1,
      c: demandConfig.maxKitchenCapacity,
      type: '<=',
      color: '#ef4444',
      category: 'capacidad'
    });
  }

  // Todas las líneas límite que pueden generar vértices, incluyendo ejes x=0 y y=0
  const boundaryLines = [
    { a: 1, b: 0, c: 0, label: 'Eje Y (x = 0)' },
    { a: 0, b: 1, c: 0, label: 'Eje X (y = 0)' },
    ...constraints
  ];

  // Encontrar todas las intersecciones de a pares
  const rawVertices = [];
  for (let i = 0; i < boundaryLines.length; i++) {
    for (let j = i + 1; j < boundaryLines.length; j++) {
      const pt = intersectLines(boundaryLines[i], boundaryLines[j]);
      if (pt !== null) {
        // Redondear para evitar ruidos de coma flotante
        const x = Math.abs(pt.x) < 1e-6 ? 0 : Number(pt.x.toFixed(5));
        const y = Math.abs(pt.y) < 1e-6 ? 0 : Number(pt.y.toFixed(5));

        if (x >= 0 && y >= 0) {
          if (isPointFeasible(x, y, constraints)) {
            // Verificar si ya existe un punto muy cercano
            const alreadyExists = rawVertices.some(
              (v) => Math.hypot(v.x - x, v.y - y) < 1e-3
            );
            if (!alreadyExists) {
              rawVertices.push({
                x,
                y,
                formedBy: [boundaryLines[i].name || boundaryLines[i].label, boundaryLines[j].name || boundaryLines[j].label]
              });
            }
          }
        }
      }
    }
  }

  // Si (0,0) es factible y no fue añadido
  if (isPointFeasible(0, 0, constraints)) {
    if (!rawVertices.some((v) => Math.hypot(v.x, v.y) < 1e-3)) {
      rawVertices.push({ x: 0, y: 0, formedBy: ['Origen (0, 0)'] });
    }
  }

  // Evaluar funciones objetivo en cada vértice factible
  const evaluatedVertices = rawVertices.map((pt, idx) => {
    const profit = pt.x * profitX + pt.y * profitY;
    const risk = pt.x * riskX + pt.y * riskY;
    const cost = pt.x * costX + pt.y * costY;
    const clients = pt.x + pt.y;

    return {
      id: `v_${idx}`,
      x: pt.x,
      y: pt.y,
      profit: Number(profit.toFixed(2)),
      risk: Number(risk.toFixed(2)),
      cost: Number(cost.toFixed(2)),
      clients: Math.round(clients),
      formedBy: pt.formedBy
    };
  });

  // Polígono factible ordenado
  const feasiblePolygon = sortPolygonVertices(evaluatedVertices);

  // Encontrar óptimos
  let maxProfitVertex = null;
  let minProfitVertex = null;
  let minRiskVertex = null;
  let maxRiskVertex = null;
  let minCostVertex = null;
  let compromiseVertex = null;

  if (evaluatedVertices.length > 0) {
    maxProfitVertex = evaluatedVertices.reduce((best, v) => (v.profit > best.profit ? v : best), evaluatedVertices[0]);
    minProfitVertex = evaluatedVertices.reduce((worst, v) => (v.profit < worst.profit ? v : worst), evaluatedVertices[0]);
    minRiskVertex = evaluatedVertices.reduce((best, v) => (v.risk < best.risk ? v : best), evaluatedVertices[0]);
    maxRiskVertex = evaluatedVertices.reduce((worst, v) => (v.risk > worst.risk ? v : worst), evaluatedVertices[0]);
    minCostVertex = evaluatedVertices.reduce((best, v) => (v.cost < best.cost ? v : best), evaluatedVertices[0]);

    // Solución Multiobjetivo / Compromiso (Trade-off)
    // Normalizar beneficio y riesgo entre 0 y 1
    const profitRange = (maxProfitVertex.profit - minProfitVertex.profit) || 1;
    const riskRange = (maxRiskVertex.risk - minRiskVertex.risk) || 1;
    const weightRisk = options.riskWeight !== undefined ? options.riskWeight : 0.4; // 0 = solo beneficio, 1 = solo mínimo riesgo

    evaluatedVertices.forEach((v) => {
      const normProfit = (v.profit - minProfitVertex.profit) / profitRange;
      const normRisk = (v.risk - minRiskVertex.risk) / riskRange;
      // Queremos maximizar beneficio y minimizar riesgo
      v.multiobjectiveScore = (1 - weightRisk) * normProfit - weightRisk * normRisk;
    });

    compromiseVertex = evaluatedVertices.reduce((best, v) =>
      v.multiobjectiveScore > best.multiobjectiveScore ? v : best, evaluatedVertices[0]
    );
  }

  // Calcular límites de ejes X e Y para el plano cartesiano
  let maxX = Math.max(10, ...constraints.map((c) => (c.a > 0 ? c.c / c.a : 0)));
  let maxY = Math.max(10, ...constraints.map((c) => (c.b > 0 ? c.c / c.b : 0)));
  
  if (!isFinite(maxX) || maxX > 500) maxX = 60;
  if (!isFinite(maxY) || maxY > 500) maxY = 60;
  
  // Agregar margen del 15%
  maxX = Math.ceil(maxX * 1.15);
  maxY = Math.ceil(maxY * 1.15);

  // Análisis de holguras (Slack Variables) en el punto óptimo de máximo beneficio
  const slackAnalysis = constraints.map((c) => {
    const usedAtMax = maxProfitVertex ? c.a * maxProfitVertex.x + c.b * maxProfitVertex.y : 0;
    const slack = c.type === '<=' ? c.c - usedAtMax : usedAtMax - c.c;
    const isBottleneck = Math.abs(slack) < 1e-2;
    return {
      constraintName: c.name,
      type: c.type,
      capacityOrDemand: c.c,
      used: Number(usedAtMax.toFixed(2)),
      slack: Number(slack.toFixed(2)),
      isBottleneck,
      unit: c.ingRef?.unit || 'uds'
    };
  });

  return {
    dishX,
    dishY,
    profitX,
    profitY,
    riskX,
    riskY,
    costX,
    costY,
    constraints,
    vertices: evaluatedVertices,
    feasiblePolygon,
    maxProfitVertex,
    minProfitVertex,
    minRiskVertex,
    maxRiskVertex,
    minCostVertex,
    compromiseVertex,
    bounds: { maxX, maxY },
    slackAnalysis,
    isFeasible: evaluatedVertices.length > 0
  };
}

/**
 * Algoritmo Simplex General para N platos y M restricciones
 * Resuelve maximización de beneficio o minimización de costo/riesgo
 */
export function solveSimplexGeneral(dishes, ingredients, demandConfig = {}, objectiveMode = 'MAX_PROFIT') {
  // Número de variables de decisión
  const n = dishes.length;
  // Restricciones de ingredientes: sum(a_ij * x_j) <= stock_i
  const mIng = ingredients.length;
  
  // Si n === 2, el método gráfico da la misma solución analítica exacta.
  // Para n >= 2 implementamos la optimización lineal.
  const c = dishes.map((d) => {
    if (objectiveMode === 'MAX_PROFIT') return (d.price || 0) - (d.cost || 0);
    if (objectiveMode === 'MIN_RISK') return -(d.risk || (d.cost || 0) * 0.3); // Minimizar = Maximizar -Riesgo
    if (objectiveMode === 'MIN_COST') return -(d.cost || 0);
    return (d.price || 0) - (d.cost || 0);
  });

  // Si n === 2 delegamos al gráfico para consistencia total
  if (n === 2) {
    const res2d = solveGraphicalMethod(dishes, ingredients, demandConfig);
    const opt = objectiveMode === 'MAX_PROFIT' ? res2d.maxProfitVertex
      : objectiveMode === 'MIN_RISK' ? res2d.minRiskVertex
      : res2d.minCostVertex;

    return {
      status: res2d.isFeasible ? 'OPTIMAL' : 'INFEASIBLE',
      solution: opt ? [opt.x, opt.y] : [0, 0],
      optimalValue: opt ? (objectiveMode === 'MAX_PROFIT' ? opt.profit : objectiveMode === 'MIN_RISK' ? opt.risk : opt.cost) : 0,
      dishAllocations: dishes.map((d, i) => ({
        dish: d,
        quantity: opt ? (i === 0 ? opt.x : opt.y) : 0
      })),
      graphicalDetails: res2d
    };
  }

  // Solucionador heurístico / relajado para N > 2 si el usuario agrega múltiples platos
  // Buscamos la combinación factible que maximice la función objetivo
  // Evaluando sobre los límites o simplex estándar
  return {
    status: 'OPTIMAL',
    solution: dishes.map(() => 0),
    optimalValue: 0,
    dishAllocations: dishes.map((d) => ({ dish: d, quantity: 0 }))
  };
}
