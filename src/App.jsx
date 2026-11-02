import React, { useState, useMemo } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import CartesianPlane from './components/CartesianPlane';
import ParetoPlane from './components/ParetoPlane';
import OptimalSummaryCard from './components/OptimalSummaryCard';
import DishesManager from './components/DishesManager';
import IngredientsManager from './components/IngredientsManager';
import RecipeMatrix from './components/RecipeMatrix';
import DemandManager from './components/DemandManager';
import MathematicalFormulation from './components/MathematicalFormulation';
import { PRESETS } from './utils/presets';
import { solveGraphicalMethod } from './utils/lpSolver';
import { 
  BarChart2, 
  Settings2, 
  Split, 
  HelpCircle, 
  ChefHat, 
  TrendingUp,
  Download,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  // Preset seleccionado inicialmente: Pizzería Napolitana
  const [selectedPresetId, setSelectedPresetId] = useState('pizzeria');

  // Estado del modelo
  const [currentPreset, setCurrentPreset] = useState(() => PRESETS[0]);
  const [dishes, setDishes] = useState(() => PRESETS[0].dishes);
  const [ingredients, setIngredients] = useState(() => PRESETS[0].ingredients);
  const [demand, setDemand] = useState(() => PRESETS[0].demand);

  // Par de platos seleccionados para el plano cartesiano 2D (IDs de los platos)
  const [selectedPair, setSelectedPair] = useState(() => [PRESETS[0].dishes[0].id, PRESETS[0].dishes[1].id]);

  // Modo de Optimización: 'MAX_PROFIT', 'MIN_RISK', 'MIN_COST', 'COMPROMISE'
  const [objectiveMode, setObjectiveMode] = useState('MAX_PROFIT');
  const [riskWeight, setRiskWeight] = useState(0.4);

  // Vista de gráficos: 'graphical', 'pareto', 'both'
  const [planeViewTab, setPlaneViewTab] = useState('graphical');

  // Vértice seleccionado interactivamente
  const [selectedVertexId, setSelectedVertexId] = useState(null);

  // Cambiar de preset (cargar caso)
  const handleSelectPreset = (presetId) => {
    const found = PRESETS.find(p => p.id === presetId) || PRESETS[0];
    setSelectedPresetId(presetId);
    setCurrentPreset(found);
    setDishes(found.dishes);
    setIngredients(found.ingredients);
    setDemand(found.demand);
    setSelectedPair([found.dishes[0].id, found.dishes[1].id]);
    setSelectedVertexId(null);
  };

  // Restablecer al preset actual
  const handleReset = () => {
    handleSelectPreset(selectedPresetId);
  };

  // Obtener los 2 platos activos para el plano 2D
  const activeDishes = useMemo(() => {
    const d1 = dishes.find(d => d.id === selectedPair[0]) || dishes[0];
    const d2 = dishes.find(d => d.id === selectedPair[1]) || dishes[1];
    return [d1, d2];
  }, [dishes, selectedPair]);

  // Ejecutar el motor de Programación Lineal y Método Gráfico
  const solution = useMemo(() => {
    return solveGraphicalMethod(activeDishes, ingredients, demand, { riskWeight });
  }, [activeDishes, ingredients, demand, riskWeight]);

  return (
    <div className="app-layout">
      {/* Barra de navegación superior con presets y modos */}
      <Navbar
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        objectiveMode={objectiveMode}
        onChangeObjectiveMode={setObjectiveMode}
        riskWeight={riskWeight}
        onChangeRiskWeight={setRiskWeight}
        onReset={handleReset}
      />

      <main className="main-content">
        {/* Banner descriptivo del caso */}
        <div className="case-banner">
          <div className="case-banner-content">
            <span className="case-badge">Caso Activo</span>
            <h2 className="case-title">{currentPreset.name}</h2>
            <p className="case-desc">{currentPreset.description}</p>
          </div>
          <div className="case-meta-tags">
            <span className="meta-tag">🍽 {dishes.length} Platos en Carta</span>
            <span className="meta-tag">📦 {ingredients.length} Insumos Limitantes</span>
            <span className="meta-tag">👥 Meta: ≥ {demand.minTotalClients || 0} Clientes</span>
          </div>
        </div>

        {/* Panel Superior: Tarjetas de Resumen Ejecutivo y Cuellos de Botella */}
        <OptimalSummaryCard
          solution={solution}
          objectiveMode={objectiveMode}
        />

        {/* Sección Central: Planos Cartesianos */}
        <div className="plane-section-wrapper">
          <div className="section-toolbar">
            <div className="toolbar-left">
              <h3 className="toolbar-title flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
                <span>Visualización en el Plano Cartesiano</span>
              </h3>
            </div>

            {/* Selector de pestañas de visualización */}
            <div className="plane-view-tabs">
              <button
                type="button"
                className={`tab-btn ${planeViewTab === 'graphical' ? 'active' : ''}`}
                onClick={() => setPlaneViewTab('graphical')}
              >
                Método Gráfico 2D (x₁ vs x₂)
              </button>
              <button
                type="button"
                className={`tab-btn ${planeViewTab === 'pareto' ? 'active' : ''}`}
                onClick={() => setPlaneViewTab('pareto')}
              >
                Plano Riesgo vs Beneficio (Pareto)
              </button>
              <button
                type="button"
                className={`tab-btn ${planeViewTab === 'both' ? 'active' : ''}`}
                onClick={() => setPlaneViewTab('both')}
              >
                <Split className="w-3.5 h-3.5 mr-1" />
                Vista Dual Paralela
              </button>
            </div>
          </div>

          <div className={`planes-container ${planeViewTab === 'both' ? 'grid-dual' : ''}`}>
            {(planeViewTab === 'graphical' || planeViewTab === 'both') && (
              <CartesianPlane
                solution={solution}
                objectiveMode={objectiveMode}
                onSelectVertex={(v) => setSelectedVertexId(v.id)}
                selectedVertexId={selectedVertexId}
              />
            )}

            {(planeViewTab === 'pareto' || planeViewTab === 'both') && (
              <ParetoPlane
                solution={solution}
                onSelectVertex={(v) => setSelectedVertexId(v.id)}
                selectedVertexId={selectedVertexId}
              />
            )}
          </div>
        </div>

        {/* Sección Inferior: Control Dinámico de Insumos, Platos, Demanda y Receta */}
        <div className="config-grid">
          {/* Matriz de Recetas y Consumo */}
          <div className="config-full-width">
            <RecipeMatrix
              dishes={dishes}
              ingredients={ingredients}
              onChangeIngredients={setIngredients}
            />
          </div>

          {/* Gestión de Platos */}
          <div className="config-col">
            <DishesManager
              dishes={dishes}
              onChangeDishes={setDishes}
              selectedPair={selectedPair}
              onSelectPair={setSelectedPair}
            />
          </div>

          {/* Gestión de Ingredientes y Sliders de Stock */}
          <div className="config-col">
            <IngredientsManager
              ingredients={ingredients}
              onChangeIngredients={setIngredients}
            />
          </div>

          {/* Demanda de Clientes Satisfechos */}
          <div className="config-col">
            <DemandManager
              demand={demand}
              onChangeDemand={setDemand}
              dishX={activeDishes[0]}
              dishY={activeDishes[1]}
            />
          </div>

          {/* Formulación Matemática Didáctica */}
          <div className="config-col">
            <MathematicalFormulation
              solution={solution}
              objectiveMode={objectiveMode}
            />
          </div>
        </div>
      </main>

      <footer className="footer-root">
        <div className="footer-content">
          <p className="footer-text">
            <strong>OptiGastro PL</strong> — Sistema de Programación Lineal e Investigación de Operaciones para Restaurantes y Emprendimientos.
          </p>
          <p className="footer-subtext">
            Calcula la combinación óptima de producción que maximiza el beneficio neto y minimiza el riesgo de mermas bajo restricciones de stock y demanda.
          </p>
        </div>
      </footer>
    </div>
  );
}
