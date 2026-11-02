import React, { useState, useMemo, useRef } from 'react';
import { 
  Maximize2, 
  TrendingUp, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Target, 
  HelpCircle,
  Crosshair,
  Sparkles,
  Layers
} from 'lucide-react';

export default function CartesianPlane({
  solution,
  objectiveMode = 'MAX_PROFIT', // 'MAX_PROFIT', 'MIN_RISK', 'MIN_COST', 'COMPROMISE'
  onSelectVertex,
  selectedVertexId
}) {
  const {
    dishX,
    dishY,
    profitX,
    profitY,
    riskX,
    riskY,
    costX,
    costY,
    constraints = [],
    feasiblePolygon = [],
    vertices = [],
    maxProfitVertex,
    minRiskVertex,
    minCostVertex,
    compromiseVertex,
    bounds = { maxX: 50, maxY: 50 },
    isFeasible
  } = solution;

  // Estados visuales interactivos
  const [showIsoLine, setShowIsoLine] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [visibleConstraints, setVisibleConstraints] = useState(() => {
    const initial = {};
    constraints.forEach(c => { initial[c.id] = true; });
    return initial;
  });
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredConstraint, setHoveredConstraint] = useState(null);

  const svgRef = useRef(null);

  // Dimensiones del SVG
  const width = 640;
  const height = 540;
  const padding = { top: 40, right: 40, bottom: 65, left: 75 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Escala cartesiana (X hacia la derecha, Y hacia arriba)
  const maxX = bounds.maxX || 40;
  const maxY = bounds.maxY || 40;

  const scaleX = (val) => padding.left + (val / maxX) * plotWidth;
  const scaleY = (val) => height - padding.bottom - (val / maxY) * plotHeight;

  const invertX = (px) => Math.max(0, ((px - padding.left) / plotWidth) * maxX);
  const invertY = (py) => Math.max(0, ((height - padding.bottom - py) / plotHeight) * maxY);

  // Ticks para los ejes
  const xTicks = useMemo(() => {
    const step = maxX <= 20 ? 2 : maxX <= 60 ? 5 : 10;
    const ticks = [];
    for (let i = 0; i <= maxX; i += step) ticks.push(i);
    return ticks;
  }, [maxX]);

  const yTicks = useMemo(() => {
    const step = maxY <= 20 ? 2 : maxY <= 60 ? 5 : 10;
    const ticks = [];
    for (let i = 0; i <= maxY; i += step) ticks.push(i);
    return ticks;
  }, [maxY]);

  // Generar path del polígono factible
  const polygonPointsAttr = useMemo(() => {
    if (!feasiblePolygon || feasiblePolygon.length < 3) return '';
    return feasiblePolygon
      .map(p => `${scaleX(p.x)},${scaleY(p.y)}`)
      .join(' ');
  }, [feasiblePolygon, maxX, maxY]);

  // Manejo de movimiento de cursor interactivo en el plano
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (
      clientX >= padding.left &&
      clientX <= width - padding.right &&
      clientY >= padding.top &&
      clientY <= height - padding.bottom
    ) {
      const curX = invertX(clientX);
      const curY = invertY(clientY);

      // Evaluar factibilidad del punto del cursor
      const profit = curX * profitX + curY * profitY;
      const risk = curX * riskX + curY * riskY;
      const cost = curX * costX + curY * costY;

      const violated = [];
      constraints.forEach(c => {
        const val = c.a * curX + c.b * curY;
        if (c.type === '<=' && val > c.c + 1e-3) violated.push(c.name);
        if (c.type === '>=' && val < c.c - 1e-3) violated.push(c.name);
      });

      setHoveredPoint({
        px: clientX,
        py: clientY,
        x: Number(curX.toFixed(1)),
        y: Number(curY.toFixed(1)),
        profit: Number(profit.toFixed(2)),
        risk: Number(risk.toFixed(2)),
        cost: Number(cost.toFixed(2)),
        isFeasible: violated.length === 0,
        violated
      });
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Toggle de visibilidad de restricciones
  const toggleConstraint = (id) => {
    setVisibleConstraints(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
  };

  // Punto óptimo principal según el modo seleccionado
  const activeOptimal = useMemo(() => {
    if (objectiveMode === 'MAX_PROFIT') return maxProfitVertex;
    if (objectiveMode === 'MIN_RISK') return minRiskVertex;
    if (objectiveMode === 'MIN_COST') return minCostVertex;
    if (objectiveMode === 'COMPROMISE') return compromiseVertex;
    return maxProfitVertex;
  }, [objectiveMode, maxProfitVertex, minRiskVertex, minCostVertex, compromiseVertex]);

  // Línea de isobeneficio / isocosto pasando por el punto óptimo
  const isoLineData = useMemo(() => {
    if (!activeOptimal || !showIsoLine) return null;
    let ca = profitX;
    let cb = profitY;
    let targetVal = activeOptimal.profit;

    if (objectiveMode === 'MIN_RISK') {
      ca = riskX;
      cb = riskY;
      targetVal = activeOptimal.risk;
    } else if (objectiveMode === 'MIN_COST') {
      ca = costX;
      cb = costY;
      targetVal = activeOptimal.cost;
    }

    if (Math.abs(cb) < 1e-6 && Math.abs(ca) < 1e-6) return null;

    // Calcular puntos de corte en el marco [0, maxX] y [0, maxY]
    const pts = [];
    if (Math.abs(cb) > 1e-6) {
      // x = 0 -> y = targetVal / cb
      const yAt0 = targetVal / cb;
      if (yAt0 >= 0 && yAt0 <= maxY * 1.5) pts.push({ x: 0, y: yAt0 });

      // x = maxX -> y = (targetVal - ca * maxX) / cb
      const yAtMax = (targetVal - ca * maxX) / cb;
      if (yAtMax >= 0 && yAtMax <= maxY * 1.5) pts.push({ x: maxX, y: yAtMax });
    }

    if (Math.abs(ca) > 1e-6) {
      // y = 0 -> x = targetVal / ca
      const xAt0 = targetVal / ca;
      if (xAt0 >= 0 && xAt0 <= maxX * 1.5 && !pts.some(p => Math.abs(p.x - xAt0) < 1e-3)) {
        pts.push({ x: xAt0, y: 0 });
      }
      // y = maxY -> x = (targetVal - cb * maxY) / ca
      const xAtMax = (targetVal - cb * maxY) / ca;
      if (xAtMax >= 0 && xAtMax <= maxX * 1.5 && !pts.some(p => Math.abs(p.x - xAtMax) < 1e-3)) {
        pts.push({ x: xAtMax, y: maxY });
      }
    }

    if (pts.length >= 2) {
      return {
        x1: scaleX(pts[0].x),
        y1: scaleY(pts[0].y),
        x2: scaleX(pts[1].x),
        y2: scaleY(pts[1].y),
        value: targetVal,
        label: objectiveMode === 'MAX_PROFIT' ? `Z* = $${targetVal.toFixed(2)} (Isobeneficio)` : `C* = $${targetVal.toFixed(2)} (Isocosto/Riesgo)`
      };
    }
    return null;
  }, [activeOptimal, showIsoLine, objectiveMode, profitX, profitY, riskX, riskY, costX, costY, maxX, maxY]);

  return (
    <div className="cartesian-card">
      <div className="cartesian-header">
        <div className="cartesian-title-group">
          <div className="icon-badge">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="plane-heading">Plano Cartesiano de Optimización (Investigación de Operaciones)</h2>
            <p className="plane-subheading">
              Método Gráfico: Región Factible, Restricciones de Insumos y Puntos Óptimos
            </p>
          </div>
        </div>

        <div className="plane-controls">
          <button
            type="button"
            className={`btn-pill ${showIsoLine ? 'active' : ''}`}
            onClick={() => setShowIsoLine(!showIsoLine)}
            title="Activar/desactivar recta objetivo de Isobeneficio"
          >
            <TrendingUp className="w-4 h-4 mr-1.5" />
            Línea Iso-Z
          </button>
          <button
            type="button"
            className={`btn-pill ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Mostrar u ocultar cuadrícula milimétrica"
          >
            <Layers className="w-4 h-4 mr-1.5" />
            Cuadrícula
          </button>
        </div>
      </div>

      <div className="cartesian-body-layout">
        {/* Contenedor del Gráfico SVG */}
        <div className="svg-wrapper">
          <svg
            ref={svgRef}
            className="cartesian-svg"
            viewBox={`0 0 ${width} ${height}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Gradiente para la Región Factible */}
              <linearGradient id="feasibleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.18" />
              </linearGradient>

              {/* Patrón de líneas para zona sombreada */}
              <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.25" />
              </pattern>

              {/* Filtro de resplandor para los óptimos */}
              <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Cuadrícula Cartesiana */}
            {showGrid && (
              <g className="grid-lines" stroke="#334155" strokeWidth="0.6" strokeDasharray="2 3">
                {xTicks.map((xVal) => (
                  <line
                    key={`grid-x-${xVal}`}
                    x1={scaleX(xVal)}
                    y1={padding.top}
                    x2={scaleX(xVal)}
                    y2={height - padding.bottom}
                  />
                ))}
                {yTicks.map((yVal) => (
                  <line
                    key={`grid-y-${yVal}`}
                    x1={padding.left}
                    y1={scaleY(yVal)}
                    x2={width - padding.right}
                    y2={scaleY(yVal)}
                  />
                ))}
              </g>
            )}

            {/* Región Factible Sombreada */}
            {isFeasible && polygonPointsAttr && (
              <g className="feasible-region-group">
                <polygon
                  points={polygonPointsAttr}
                  fill="url(#feasibleGradient)"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  strokeDasharray="5 3"
                  className="feasible-polygon"
                />
                <polygon
                  points={polygonPointsAttr}
                  fill="url(#diagonalHatch)"
                />
              </g>
            )}

            {/* Rectas de Restricciones (Ingredientes, Demanda, Capacidad) */}
            <g className="constraints-lines">
              {constraints.map((c) => {
                if (visibleConstraints[c.id] === false) return null;

                // Calcular 2 puntos de intersección con los bordes del plano
                let p1 = null;
                let p2 = null;

                if (Math.abs(c.b) > 1e-6) {
                  // Cuando x = 0
                  const y0 = c.c / c.b;
                  // Cuando x = maxX
                  const yMax = (c.c - c.a * maxX) / c.b;
                  p1 = { x: 0, y: y0 };
                  p2 = { x: maxX, y: yMax };
                } else if (Math.abs(c.a) > 1e-6) {
                  // Recta vertical x = c/a
                  const xConst = c.c / c.a;
                  p1 = { x: xConst, y: 0 };
                  p2 = { x: xConst, y: maxY };
                }

                if (!p1 || !p2) return null;

                const isHov = hoveredConstraint === c.id;

                return (
                  <g key={`line-group-${c.id}`} onMouseEnter={() => setHoveredConstraint(c.id)} onMouseLeave={() => setHoveredConstraint(null)}>
                    <line
                      x1={scaleX(p1.x)}
                      y1={scaleY(p1.y)}
                      x2={scaleX(p2.x)}
                      y2={scaleY(p2.y)}
                      stroke={c.color || '#38bdf8'}
                      strokeWidth={isHov ? 3.5 : 2}
                      strokeOpacity={isHov ? 1 : 0.8}
                      className="transition-all duration-200"
                    />
                    {/* Etiqueta flotante con nombre de la restricción */}
                    {p2.y >= 0 && p2.y <= maxY && (
                      <text
                        x={scaleX(Math.min(maxX * 0.85, Math.max(0, p2.x)))}
                        y={scaleY(Math.max(1, Math.min(maxY - 1, p2.y))) - 6}
                        fill={c.color || '#38bdf8'}
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                        className="pointer-events-none select-none"
                      >
                        {c.a}x₁ + {c.b}x₂ {c.type} {c.c}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Recta de Isobeneficio / Isocosto (Z*) */}
            {isoLineData && (
              <g className="iso-objective-line">
                <line
                  x1={isoLineData.x1}
                  y1={isoLineData.y1}
                  x2={isoLineData.x2}
                  y2={isoLineData.y2}
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  filter="url(#glow-gold)"
                />
                <text
                  x={(isoLineData.x1 + isoLineData.x2) / 2 + 10}
                  y={(isoLineData.y1 + isoLineData.y2) / 2 - 10}
                  fill="#fbbf24"
                  fontSize="11"
                  fontWeight="bold"
                  className="select-none"
                >
                  {isoLineData.label}
                </text>
              </g>
            )}

            {/* Ejes Cartesiano X e Y */}
            <g className="axes" stroke="#94a3b8" strokeWidth="2">
              {/* Eje X */}
              <line
                x1={padding.left}
                y1={height - padding.bottom}
                x2={width - padding.right + 15}
                y2={height - padding.bottom}
              />
              {/* Flecha Eje X */}
              <polygon
                points={`${width - padding.right + 20},${height - padding.bottom} ${width - padding.right + 13},${height - padding.bottom - 4} ${width - padding.right + 13},${height - padding.bottom + 4}`}
                fill="#94a3b8"
              />

              {/* Eje Y */}
              <line
                x1={padding.left}
                y1={height - padding.bottom}
                x2={padding.left}
                y2={padding.top - 15}
              />
              {/* Flecha Eje Y */}
              <polygon
                points={`${padding.left},${padding.top - 20} ${padding.left - 4},${padding.top - 13} ${padding.left + 4},${padding.top - 13}`}
                fill="#94a3b8"
              />
            </g>

            {/* Números y marcas en los ejes */}
            <g className="axis-ticks" fill="#94a3b8" fontSize="10" textAnchor="middle">
              {xTicks.map((xVal) => (
                <g key={`tick-x-${xVal}`} transform={`translate(${scaleX(xVal)}, ${height - padding.bottom})`}>
                  <line y2="5" stroke="#94a3b8" strokeWidth="1.5" />
                  <text y="18">{xVal}</text>
                </g>
              ))}

              {yTicks.map((yVal) => (
                <g key={`tick-y-${yVal}`} transform={`translate(${padding.left}, ${scaleY(yVal)})`}>
                  <line x2="-5" stroke="#94a3b8" strokeWidth="1.5" />
                  <text x="-12" y="3.5" textAnchor="end">{yVal}</text>
                </g>
              ))}
            </g>

            {/* Etiquetas de los Ejes (Plato 1 y Plato 2) */}
            <text
              x={width / 2 + 20}
              y={height - 18}
              fill="#f8fafc"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              Eje X: Cantidad de {dishX.name} (x₁) [porciones / platos]
            </text>

            <text
              x={-(height / 2)}
              y={22}
              fill="#f8fafc"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              transform="rotate(-90)"
            >
              Eje Y: Cantidad de {dishY.name} (x₂) [porciones / platos]
            </text>

            {/* Vértices Calculados en el Polígono Factible */}
            {vertices.map((v) => {
              const isMaxProfit = maxProfitVertex && Math.hypot(v.x - maxProfitVertex.x, v.y - maxProfitVertex.y) < 1e-3;
              const isMinRisk = minRiskVertex && Math.hypot(v.x - minRiskVertex.x, v.y - minRiskVertex.y) < 1e-3;
              const isCompromise = compromiseVertex && Math.hypot(v.x - compromiseVertex.x, v.y - compromiseVertex.y) < 1e-3;
              const isSelected = selectedVertexId === v.id;

              const cx = scaleX(v.x);
              const cy = scaleY(v.y);

              return (
                <g
                  key={v.id}
                  className="vertex-marker cursor-pointer"
                  onClick={() => onSelectVertex && onSelectVertex(v)}
                >
                  {/* Halo pulsante para los óptimos */}
                  {isMaxProfit && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="14"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      opacity="0.8"
                      className="animate-ping"
                    />
                  )}
                  {isMinRisk && !isMaxProfit && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="12"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      opacity="0.8"
                      className="animate-ping"
                    />
                  )}

                  {/* Círculo del vértice */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 8 : isMaxProfit ? 7 : 5.5}
                    fill={isMaxProfit ? '#10b981' : isMinRisk ? '#06b6d4' : isCompromise ? '#8b5cf6' : '#f8fafc'}
                    stroke={isSelected ? '#fbbf24' : '#0f172a'}
                    strokeWidth="2.5"
                    filter={isMaxProfit ? 'url(#glow-gold)' : undefined}
                  />

                  {/* Etiqueta flotante permanente sobre el punto */}
                  <g transform={`translate(${cx + 10}, ${cy - 10})`}>
                    <rect
                      x="-4"
                      y="-14"
                      width={isMaxProfit ? 130 : 85}
                      height="20"
                      rx="4"
                      fill="#0f172a"
                      fillOpacity="0.85"
                      stroke={isMaxProfit ? '#10b981' : isMinRisk ? '#06b6d4' : '#475569'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="0"
                      fill={isMaxProfit ? '#34d399' : isMinRisk ? '#38bdf8' : '#e2e8f0'}
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {isMaxProfit ? `★ MÁX: (${v.x}, ${v.y})` : isMinRisk ? `🛡 MÍN: (${v.x}, ${v.y})` : `(${v.x}, ${v.y})`}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Cursor interactivo de exploración en tiempo real */}
            {hoveredPoint && (
              <g className="cursor-probe pointer-events-none">
                <line
                  x1={hoveredPoint.px}
                  y1={padding.top}
                  x2={hoveredPoint.px}
                  y2={height - padding.bottom}
                  stroke="#fbbf24"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <line
                  x1={padding.left}
                  y1={hoveredPoint.py}
                  x2={width - padding.right}
                  y2={hoveredPoint.py}
                  stroke="#fbbf24"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={hoveredPoint.px}
                  cy={hoveredPoint.py}
                  r="4"
                  fill="#fbbf24"
                />
              </g>
            )}
          </svg>

          {/* Tooltip flotante al explorar el plano con el ratón */}
          {hoveredPoint && (
            <div
              className={`plane-floating-tooltip ${hoveredPoint.isFeasible ? 'feasible' : 'infeasible'}`}
              style={{
                left: `${Math.min(width - 200, Math.max(padding.left, hoveredPoint.px + 15))}px`,
                top: `${Math.min(height - 110, Math.max(padding.top, hoveredPoint.py - 50))}px`
              }}
            >
              <div className="tooltip-header">
                <span className="font-bold">({hoveredPoint.x} {dishX.shortName}, {hoveredPoint.y} {dishY.shortName})</span>
                <span className={`status-pill ${hoveredPoint.isFeasible ? 'badge-feasible' : 'badge-infeasible'}`}>
                  {hoveredPoint.isFeasible ? '✓ Factible' : '✗ Infactible'}
                </span>
              </div>
              <div className="tooltip-metrics">
                <div>Beneficio: <strong className="text-emerald-400">${hoveredPoint.profit}</strong></div>
                <div>Riesgo: <strong className="text-amber-400">${hoveredPoint.risk}</strong></div>
                <div>Clientes: <strong>{Math.round(hoveredPoint.x + hoveredPoint.y)}</strong></div>
              </div>
              {!hoveredPoint.isFeasible && hoveredPoint.violated.length > 0 && (
                <div className="tooltip-violation">
                  Excede: {hoveredPoint.violated.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel lateral: Leyenda de Restricciones y Puntos Clave */}
        <div className="cartesian-sidebar">
          {/* Tarjeta de Máximo y Mínimo Resumen */}
          <div className="optima-summary-box">
            <div className="optima-card max-card">
              <div className="optima-card-top">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="optima-tag text-emerald-400">PUNTO DE MÁXIMO BENEFICIO</span>
              </div>
              {maxProfitVertex ? (
                <>
                  <div className="optima-coords">
                    x₁* = <strong>{maxProfitVertex.x}</strong>, x₂* = <strong>{maxProfitVertex.y}</strong>
                  </div>
                  <div className="optima-val text-emerald-400">
                    Ganancia Máx: ${maxProfitVertex.profit} USD
                  </div>
                  <div className="optima-detail">
                    {maxProfitVertex.x} {dishX.name} + {maxProfitVertex.y} {dishY.name}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-xs">Sin región factible</div>
              )}
            </div>

            <div className="optima-card min-card">
              <div className="optima-card-top">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span className="optima-tag text-cyan-400">PUNTO DE MÍNIMO RIESGO</span>
              </div>
              {minRiskVertex ? (
                <>
                  <div className="optima-coords">
                    x₁ = <strong>{minRiskVertex.x}</strong>, x₂ = <strong>{minRiskVertex.y}</strong>
                  </div>
                  <div className="optima-val text-cyan-400">
                    Riesgo Mín: ${minRiskVertex.risk} | Ganancia: ${minRiskVertex.profit}
                  </div>
                  <div className="optima-detail">
                    {minRiskVertex.x} {dishX.name} + {minRiskVertex.y} {dishY.name}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-xs">Sin región factible</div>
              )}
            </div>
          </div>

          {/* Lista de Restricciones del Plano con control para ocultar/mostrar */}
          <div className="constraints-legend-box">
            <h4 className="legend-title">Restricciones Activas en el Plano</h4>
            <div className="constraints-list">
              {constraints.map((c) => {
                const isVisible = visibleConstraints[c.id] !== false;
                const isHovered = hoveredConstraint === c.id;

                return (
                  <div
                    key={c.id}
                    className={`constraint-item ${isHovered ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredConstraint(c.id)}
                    onMouseLeave={() => setHoveredConstraint(null)}
                  >
                    <div className="constraint-color-pill" style={{ backgroundColor: c.color }} />
                    <div className="constraint-info">
                      <div className="constraint-name">{c.name}</div>
                      <div className="constraint-eq">
                        {c.a}·x₁ + {c.b}·x₂ {c.type} {c.c}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-icon-toggle"
                      onClick={() => toggleConstraint(c.id)}
                      title={isVisible ? "Ocultar recta" : "Mostrar recta"}
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabla de Vértices Factibles Evaluados */}
          <div className="vertices-table-box">
            <h4 className="legend-title">Vértices de la Región Factible (Teorema Fundamental PL)</h4>
            <div className="table-responsive">
              <table className="vertices-table">
                <thead>
                  <tr>
                    <th>Vértice (x₁, x₂)</th>
                    <th>Beneficio (Z)</th>
                    <th>Riesgo</th>
                    <th>Clientes</th>
                  </tr>
                </thead>
                <tbody>
                  {vertices.map((v) => {
                    const isMax = maxProfitVertex && Math.hypot(v.x - maxProfitVertex.x, v.y - maxProfitVertex.y) < 1e-3;
                    const isMinR = minRiskVertex && Math.hypot(v.x - minRiskVertex.x, v.y - minRiskVertex.y) < 1e-3;
                    const isRowSelected = selectedVertexId === v.id;

                    return (
                      <tr
                        key={v.id}
                        className={`vertex-row ${isMax ? 'row-max' : ''} ${isMinR ? 'row-min' : ''} ${isRowSelected ? 'row-selected' : ''}`}
                        onClick={() => onSelectVertex && onSelectVertex(v)}
                      >
                        <td>
                          <span className="font-mono">({v.x}, {v.y})</span>
                          {isMax && <span className="pill-star">★ MÁX</span>}
                          {isMinR && !isMax && <span className="pill-shield">🛡 MÍN</span>}
                        </td>
                        <td className="font-semibold text-emerald-400">${v.profit}</td>
                        <td className="text-cyan-300">${v.risk}</td>
                        <td>{v.clients}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
