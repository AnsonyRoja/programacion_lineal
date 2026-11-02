import React from 'react';
import { BookOpen, Check } from 'lucide-react';

export default function MathematicalFormulation({ solution, objectiveMode }) {
  const {
    dishX,
    dishY,
    profitX,
    profitY,
    riskX,
    riskY,
    costX,
    costY,
    constraints = []
  } = solution;

  return (
    <div className="math-formulation-card">
      <div className="math-header">
        <div className="icon-badge-sky">
          <BookOpen className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h3 className="section-title">Modelo Matemático Formal (Investigación de Operaciones)</h3>
          <p className="section-desc">
            Formulación canónica de Programación Lineal generada dinámicamente para el caso actual
          </p>
        </div>
      </div>

      <div className="math-content">
        {/* 1. Variables de Decisión */}
        <div className="math-section">
          <h4 className="math-section-title">1. Variables de Decisión:</h4>
          <ul className="math-list">
            <li>
              <code className="code-var">x₁</code>: Cantidad de porciones a producir de <strong>{dishX.name}</strong>.
            </li>
            <li>
              <code className="code-var">x₂</code>: Cantidad de porciones a producir de <strong>{dishY.name}</strong>.
            </li>
          </ul>
        </div>

        {/* 2. Función Objetivo */}
        <div className="math-section">
          <h4 className="math-section-title">2. Funciones Objetivo:</h4>
          <div className="math-equation-box">
            <div className="font-semibold text-emerald-400">
              [OBJETIVO 1: Máximo Beneficio Neto]
            </div>
            <div className="text-sm font-mono text-gray-200 mt-1">
              MAXIMIZAR Z = ({dishX.price} - {dishX.cost})·x₁ + ({dishY.price} - {dishY.cost})·x₂
            </div>
            <div className="text-xs font-mono text-emerald-300">
              ➔ Z = {profitX.toFixed(2)}·x₁ + {profitY.toFixed(2)}·x₂
            </div>

            <div className="font-semibold text-cyan-400 mt-3">
              [OBJETIVO 2: Mínimo Riesgo Financiero / Merma]
            </div>
            <div className="text-sm font-mono text-gray-200 mt-1">
              MINIMIZAR R = {riskX.toFixed(2)}·x₁ + {riskY.toFixed(2)}·x₂
            </div>

            <div className="font-semibold text-sky-400 mt-3">
              [OBJETIVO 3: Mínimo Costo de Insumos]
            </div>
            <div className="text-sm font-mono text-gray-200 mt-1">
              MINIMIZAR C = {costX.toFixed(2)}·x₁ + {costY.toFixed(2)}·x₂
            </div>
          </div>
        </div>

        {/* 3. Restricciones del Sistema */}
        <div className="math-section">
          <h4 className="math-section-title">3. Sujeto a las Restricciones (S.A.):</h4>
          <div className="math-constraints-grid">
            {constraints.map((c, idx) => (
              <div key={`math-c-${idx}`} className="math-constraint-pill">
                <span className="font-mono text-sky-300 font-bold">
                  {c.a}·x₁ + {c.b}·x₂ {c.type} {c.c}
                </span>
                <span className="text-2xs text-gray-400">({c.name})</span>
              </div>
            ))}
            <div className="math-constraint-pill bg-slate-900 border border-slate-700">
              <span className="font-mono text-amber-300 font-bold">x₁, x₂ ≥ 0</span>
              <span className="text-2xs text-gray-400">(Condición de No Negatividad)</span>
            </div>
          </div>
        </div>

        {/* 4. Teorema Fundamental */}
        <div className="math-note">
          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-300">
            <strong>Teorema Fundamental de la Programación Lineal:</strong> Dado que la región factible es un polígono convexo cerrado, 
            la solución óptima (máximo o mínimo) se localiza indefectiblemente en al menos uno de los <strong>vértices extremos</strong> del polígono. 
            El algoritmo evalúa todos los puntos de intersección válidos para identificar la cúspide de ganancia y el valle de menor riesgo.
          </p>
        </div>
      </div>
    </div>
  );
}
