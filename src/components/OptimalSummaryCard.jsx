import React from 'react';
import { DollarSign, AlertCircle, Users, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function OptimalSummaryCard({ solution, objectiveMode }) {
  const {
    dishX,
    dishY,
    maxProfitVertex,
    minRiskVertex,
    minCostVertex,
    compromiseVertex,
    slackAnalysis = [],
    isFeasible
  } = solution;

  // Seleccionar la solución según el modo actual
  const currentOptimal = 
    objectiveMode === 'MAX_PROFIT' ? maxProfitVertex :
    objectiveMode === 'MIN_RISK' ? minRiskVertex :
    objectiveMode === 'MIN_COST' ? minCostVertex :
    compromiseVertex;

  if (!isFeasible || !currentOptimal) {
    return (
      <div className="alert-infeasible">
        <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
        <div>
          <h4 className="font-bold text-red-200">¡Región Factible Vacía! (Infactibilidad)</h4>
          <p className="text-xs text-red-300 mt-1">
            Las restricciones actuales son incompatibles entre sí (por ejemplo, la demanda de clientes supera el stock de ingredientes disponibles).
            Aumenta el inventario de insumos o flexibiliza la demanda mínima.
          </p>
        </div>
      </div>
    );
  }

  const bottlenecks = slackAnalysis.filter(s => s.isBottleneck);
  const slacks = slackAnalysis.filter(s => !s.isBottleneck && s.slack > 0);

  return (
    <div className="summary-dashboard">
      <div className="kpi-grid">
        {/* KPI 1: Beneficio Neto */}
        <div className="kpi-card kpi-emerald">
          <div className="kpi-header">
            <span className="kpi-label">Beneficio Neto Óptimo (Z*)</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="kpi-value text-emerald-400">
            ${currentOptimal.profit.toFixed(2)}
          </div>
          <div className="kpi-subtext">
            Margen operativo total después de costos
          </div>
        </div>

        {/* KPI 2: Riesgo / Merma */}
        <div className="kpi-card kpi-amber">
          <div className="kpi-header">
            <span className="kpi-label">Riesgo Financiero / Merma</span>
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="kpi-value text-amber-400">
            ${currentOptimal.risk.toFixed(2)}
          </div>
          <div className="kpi-subtext">
            Exposición a desperdicio y volatilidad
          </div>
        </div>

        {/* KPI 3: Costo de Producción */}
        <div className="kpi-card kpi-sky">
          <div className="kpi-header">
            <span className="kpi-label">Costo Insumos Directo</span>
            <DollarSign className="w-5 h-5 text-sky-400" />
          </div>
          <div className="kpi-value text-sky-400">
            ${currentOptimal.cost.toFixed(2)}
          </div>
          <div className="kpi-subtext">
            Presupuesto requerido para el servicio
          </div>
        </div>

        {/* KPI 4: Clientes Satisfechos */}
        <div className="kpi-card kpi-purple">
          <div className="kpi-header">
            <span className="kpi-label">Clientes / Platos Servidos</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="kpi-value text-purple-300">
            {currentOptimal.clients} comensales
          </div>
          <div className="kpi-subtext">
            Demanda total satisfecha
          </div>
        </div>
      </div>

      {/* Plan de Producción Recomendado */}
      <div className="plan-banner">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-gray-100">Plan de Cocina Óptimo Recomendado</h4>
        </div>
        <div className="plan-recipe-pills">
          <div className="plan-pill pill-x">
            <span className="font-semibold">{dishX.name}:</span>
            <strong className="text-emerald-400 text-lg mx-1.5">{currentOptimal.x}</strong>
            <span className="text-xs text-gray-300">porciones a preparar</span>
          </div>
          <span className="text-gray-400 font-bold">+</span>
          <div className="plan-pill pill-y">
            <span className="font-semibold">{dishY.name}:</span>
            <strong className="text-cyan-400 text-lg mx-1.5">{currentOptimal.y}</strong>
            <span className="text-xs text-gray-300">porciones a preparar</span>
          </div>
        </div>
      </div>

      {/* Análisis de Restricciones Activas y Holguras */}
      <div className="slack-analysis-card">
        <h4 className="slack-title">Diagnóstico de Insumos (Variables de Holgura y Cuellos de Botella)</h4>
        <div className="slack-lists-grid">
          {/* Cuellos de Botella (Restricciones Activas) */}
          <div className="bottlenecks-box">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Cuellos de Botella (Restricciones Activas - Holgura = 0):</span>
            </div>
            {bottlenecks.length > 0 ? (
              <ul className="space-y-1">
                {bottlenecks.map((b, idx) => (
                  <li key={`bn-${idx}`} className="bottleneck-tag">
                    <span className="font-medium text-gray-200">{b.constraintName}</span>
                    <span className="text-amber-400 text-xs font-mono">Consumo 100% ({b.used} / {b.capacityOrDemand})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">No hay restricciones agotadas al 100%.</p>
            )}
            <p className="text-2xs text-gray-400 mt-2 italic">
              💡 Para aumentar las ganancias, compra más unidades de estos insumos agotados.
            </p>
          </div>

          {/* Insumos con Sobrante (Holgura > 0) */}
          <div className="slacks-box">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Insumos Sobrantes (Holgura Positiva):</span>
            </div>
            {slacks.length > 0 ? (
              <ul className="space-y-1">
                {slacks.map((s, idx) => (
                  <li key={`sl-${idx}`} className="slack-tag">
                    <span className="font-medium text-gray-200">{s.constraintName}</span>
                    <span className="text-sky-300 text-xs font-mono">
                      Sobra: {s.slack} {s.unit} (Usado: {s.used}/{s.capacityOrDemand})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">Todos los insumos fueron aprovechados con holgura cero.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
