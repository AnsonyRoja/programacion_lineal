import React from 'react';
import { Activity, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

/**
 * Segundo Plano Cartesiano: Espacio de Objetivos (Trade-off: Riesgo vs Beneficio)
 * Eje X: Riesgo Financiero / Costo ($)
 * Eje Y: Beneficio / Margen Neto ($)
 * Dibuja la Frontera Eficiente de Pareto y destaca los extremos: Mínimo Riesgo y Máximo Beneficio
 */
export default function ParetoPlane({ solution, onSelectVertex, selectedVertexId }) {
  const { vertices = [], maxProfitVertex, minRiskVertex, compromiseVertex } = solution;

  if (!vertices || vertices.length === 0) {
    return null;
  }

  // Dimensiones del gráfico
  const width = 560;
  const height = 340;
  const padding = { top: 30, right: 30, bottom: 50, left: 65 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Extremos para escala
  const allRisks = vertices.map(v => v.risk);
  const allProfits = vertices.map(v => v.profit);

  const minR = 0;
  const maxR = Math.max(10, ...allRisks) * 1.25;
  const minP = 0;
  const maxP = Math.max(10, ...allProfits) * 1.25;

  const scaleR = (r) => padding.left + (r / maxR) * plotWidth;
  const scaleP = (p) => height - padding.bottom - (p / maxP) * plotHeight;

  // Ordenar vértices para construir la frontera de dispersión
  const sortedByRisk = [...vertices].sort((a, b) => a.risk - b.risk);

  return (
    <div className="pareto-card">
      <div className="pareto-header">
        <div className="icon-badge-amber">
          <Activity className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="plane-heading">Plano Cartesiano Objetivo: Riesgo vs. Beneficio</h3>
          <p className="plane-subheading">
            Frontera de Eficiencia de Pareto (Compromiso Operativo del Restaurante)
          </p>
        </div>
      </div>

      <div className="pareto-body">
        <svg className="pareto-svg" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="paretoAreaGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Cuadrícula suave */}
          <g stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3">
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <React.Fragment key={`pgrid-${pct}`}>
                <line
                  x1={padding.left}
                  y1={scaleP(maxP * pct)}
                  x2={width - padding.right}
                  y2={scaleP(maxP * pct)}
                />
                <line
                  x1={scaleR(maxR * pct)}
                  y1={padding.top}
                  x2={scaleR(maxR * pct)}
                  y2={height - padding.bottom}
                />
              </React.Fragment>
            ))}
          </g>

          {/* Ejes */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right + 10}
            y2={height - padding.bottom}
            stroke="#94a3b8"
            strokeWidth="1.8"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={padding.left}
            y2={padding.top - 10}
            stroke="#94a3b8"
            strokeWidth="1.8"
          />

          {/* Ticks numéricos */}
          <g fill="#94a3b8" fontSize="10" textAnchor="middle">
            {[0, 0.33, 0.66, 1].map(pct => {
              const rVal = Math.round(maxR * pct);
              return (
                <text key={`rtick-${rVal}`} x={scaleR(rVal)} y={height - padding.bottom + 18}>
                  ${rVal}
                </text>
              );
            })}
            {[0, 0.33, 0.66, 1].map(pct => {
              const pVal = Math.round(maxP * pct);
              return (
                <text key={`ptick-${pVal}`} x={padding.left - 10} y={scaleP(pVal) + 4} textAnchor="end">
                  ${pVal}
                </text>
              );
            })}
          </g>

          {/* Etiquetas Ejes */}
          <text
            x={width / 2 + 10}
            y={height - 12}
            fill="#e2e8f0"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
          >
            Eje X: Riesgo / Merma Total ($ USD) → (Menos es Mejor)
          </text>
          <text
            x={-(height / 2)}
            y={18}
            fill="#e2e8f0"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            transform="rotate(-90)"
          >
            Eje Y: Beneficio Neto ($ USD) → (Más es Mejor)
          </text>

          {/* Conexión de la frontera entre los puntos factibles */}
          {sortedByRisk.length > 1 && (
            <polyline
              points={sortedByRisk.map(v => `${scaleR(v.risk)},${scaleP(v.profit)}`).join(' ')}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Puntos de soluciones factibles */}
          {vertices.map(v => {
            const isMax = maxProfitVertex && Math.hypot(v.x - maxProfitVertex.x, v.y - maxProfitVertex.y) < 1e-3;
            const isMin = minRiskVertex && Math.hypot(v.x - minRiskVertex.x, v.y - minRiskVertex.y) < 1e-3;
            const isCom = compromiseVertex && Math.hypot(v.x - compromiseVertex.x, v.y - compromiseVertex.y) < 1e-3;
            const isSel = selectedVertexId === v.id;

            const px = scaleR(v.risk);
            const py = scaleP(v.profit);

            return (
              <g
                key={`pnode-${v.id}`}
                className="cursor-pointer"
                onClick={() => onSelectVertex && onSelectVertex(v)}
              >
                <circle
                  cx={px}
                  cy={py}
                  r={isMax || isMin || isCom ? 7 : 5}
                  fill={isMax ? '#10b981' : isMin ? '#06b6d4' : isCom ? '#8b5cf6' : '#cbd5e1'}
                  stroke={isSel ? '#fbbf24' : '#0f172a'}
                  strokeWidth="2"
                />

                {/* Etiquetas prominentes en extremos */}
                {isMax && (
                  <g transform={`translate(${px - 30}, ${py - 12})`}>
                    <rect x="-4" y="-12" width="105" height="18" rx="3" fill="#065f46" />
                    <text x="2" y="1" fill="#6ee7b7" fontSize="10" fontWeight="bold">
                      ★ Máx Beneficio (${v.profit})
                    </text>
                  </g>
                )}
                {isMin && !isMax && (
                  <g transform={`translate(${px + 10}, ${py + 10})`}>
                    <rect x="-4" y="-12" width="95" height="18" rx="3" fill="#155e75" />
                    <text x="2" y="1" fill="#67e8f9" fontSize="10" fontWeight="bold">
                      🛡 Mín Riesgo (${v.risk})
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div className="pareto-insights">
          <div className="insight-pill">
            <span className="dot dot-green" />
            <div>
              <strong>Máximo Beneficio:</strong> Produce <strong>{maxProfitVertex?.x}</strong> u. de {solution.dishX.shortName} y <strong>{maxProfitVertex?.y}</strong> u. de {solution.dishY.shortName}. Genera <strong>${maxProfitVertex?.profit}</strong> pero asume un riesgo de ${maxProfitVertex?.risk}.
            </div>
          </div>
          <div className="insight-pill">
            <span className="dot dot-cyan" />
            <div>
              <strong>Mínimo Riesgo:</strong> Produce <strong>{minRiskVertex?.x}</strong> u. de {solution.dishX.shortName} y <strong>{minRiskVertex?.y}</strong> u. de {solution.dishY.shortName}. Riesgo contenido en <strong>${minRiskVertex?.risk}</strong> con un beneficio de ${minRiskVertex?.profit}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
