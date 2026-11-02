import React from 'react';
import { ChefHat, TrendingUp, ShieldAlert, DollarSign, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { PRESETS } from '../utils/presets';

export default function Navbar({
  selectedPresetId,
  onSelectPreset,
  objectiveMode,
  onChangeObjectiveMode,
  riskWeight,
  onChangeRiskWeight,
  onReset
}) {
  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Logo y Título */}
        <div className="navbar-brand">
          <div className="logo-icon-box">
            <ChefHat className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="brand-title">OptiGastro PL</h1>
              <span className="badge-tech">Investigación de Operaciones</span>
            </div>
            <p className="brand-subtitle">
              Programación Lineal: Máximo Beneficio & Mínimo Riesgo en Restaurantes
            </p>
          </div>
        </div>

        {/* Selector de Presets de Restaurantes Reales */}
        <div className="navbar-actions">
          <div className="preset-selector-group">
            <label className="text-2xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Caso / Tipo de Emprendimiento:
            </label>
            <select
              className="select-preset"
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de Reset */}
          <button
            type="button"
            className="btn-reset"
            onClick={onReset}
            title="Restablecer valores originales del caso"
          >
            <RotateCcw className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Barra de Modos de Optimización */}
      <div className="navbar-modes-strip">
        <div className="modes-label flex items-center gap-1.5 text-xs text-gray-300 font-semibold">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Función Objetivo a Optimizar:</span>
        </div>

        <div className="modes-buttons-group">
          <button
            type="button"
            className={`mode-tab ${objectiveMode === 'MAX_PROFIT' ? 'active-emerald' : ''}`}
            onClick={() => onChangeObjectiveMode('MAX_PROFIT')}
          >
            <TrendingUp className="w-4 h-4" />
            <span>1. Maximizar Beneficio Neto</span>
          </button>

          <button
            type="button"
            className={`mode-tab ${objectiveMode === 'MIN_RISK' ? 'active-cyan' : ''}`}
            onClick={() => onChangeObjectiveMode('MIN_RISK')}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>2. Minimizar Riesgo / Merma</span>
          </button>

          <button
            type="button"
            className={`mode-tab ${objectiveMode === 'MIN_COST' ? 'active-sky' : ''}`}
            onClick={() => onChangeObjectiveMode('MIN_COST')}
          >
            <DollarSign className="w-4 h-4" />
            <span>3. Minimizar Costo de Insumos</span>
          </button>

          <button
            type="button"
            className={`mode-tab ${objectiveMode === 'COMPROMISE' ? 'active-purple' : ''}`}
            onClick={() => onChangeObjectiveMode('COMPROMISE')}
          >
            <Sparkles className="w-4 h-4" />
            <span>4. Balance Multiobjetivo</span>
          </button>
        </div>

        {/* Deslizador de peso para Multiobjetivo si está activo */}
        {objectiveMode === 'COMPROMISE' && (
          <div className="risk-slider-box">
            <span className="text-2xs text-gray-300">Aversión al Riesgo: <strong>{Math.round(riskWeight * 100)}%</strong></span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={riskWeight}
              onChange={(e) => onChangeRiskWeight(Number(e.target.value))}
              className="slider-weight"
            />
          </div>
        )}
      </div>
    </header>
  );
}
