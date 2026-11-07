import { GPUHeatmapCanvas } from './components/viz/GPUHeatmapCanvas';
import { generateMockGPUCells, GPUCellData } from './lib/three-helpers';
import { useState, useEffect } from 'react';

function App() {
  const [cells, setCells] = useState<GPUCellData[]>([]);

  useEffect(() => {
    const mockCells = generateMockGPUCells(512, 32, 16);
    setCells(mockCells);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', padding: 20 }}>
      <h1>GPU Cluster Dashboard</h1>
      <GPUHeatmapCanvas
        cells={cells}
        colorMode="health"
        gridWidth={32}
        gridHeight={16}
        fisheyeEnabled={true}
        showFPS={true}
        showLegend={true}
      />
    </div>
  );
}

export default App;
