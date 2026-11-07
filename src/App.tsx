import { GPUHeatmapCanvas } from './components/viz/GPUHeatmapCanvas';
import { generateMockGPUCells, GPUCellData } from './lib/three-helpers';
import { useState, useEffect } from 'react';

function App() {
  const [cells, setCells] = useState<GPUCellData[]>([]);
  const [colorMode, setColorMode] = useState<'health' | 'utilization' | 'temperature'>('health');
  const [fisheyeEnabled, setFisheyeEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  // const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mockCells = generateMockGPUCells(512, 32, 16);
    setCells(mockCells);
    // setTimeout(() => setVisible(true), 50);
  }, []);

  const colorModeLabels: Record<string, string> = {
    health: 'HEALTH',
    utilization: 'UTILIZATION',
    temperature: 'TEMPERATURE'
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-family-mono)' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>INITIALIZING...</div>
      </div>
    );
  }

  const headerStyle = { position: 'sticky' as const, top: 0, zIndex: 100, background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)' };
  const containerStyle = { maxWidth: '1400px' };
  const headerContentStyle = { display: 'flex', alignItems: 'center', gap: 'var(--space-3)' };
  const titleStyle = { fontFamily: 'var(--font-family-display)', fontWeight: 900, fontSize: 'var(--text-xl)', letterSpacing: '-0.02em', color: 'var(--color-text)', background: 'linear-gradient(135deg, var(--color-text) 0%, var(--color-accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' };
  const badgeStyle = { fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'var(--color-accent)', padding: '2px 8px', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-pill)' };
  const navStyle = { display: 'flex', gap: 'var(--space-6)', alignItems: 'center' };
  const navLinkStyle = { color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', fontWeight: 500 };
  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-family-mono)' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>INITIALIZING...</div>
      </div>
    );
  }

  const footerLinkStyle = { color: 'var(--color-text-subtle)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-mono)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header style={headerStyle}>
        <div className="container flex-between" style={containerStyle}>
          <div style={headerContentStyle}>
            <span style={titleStyle}>GPU CLUSTER</span>
            <span style={badgeStyle}>OBSERVABILITY</span>
          </div>
          <nav style={navStyle}>
            <a href="#" style={navLinkStyle}>CLUSTERS</a>
            <a href="#" style={navLinkStyle}>ALERTS</a>
            <a href="#" style={navLinkStyle}>ANALYTICS</a>
            <button className="btn btn-primary btn-sm">LIVE</button>
          </nav>
        </div>
      </header>

      <main style={{ padding: 'var(--space-8) var(--space-6)' }}>
        <div className="container" style={{ maxWidth: '1400px' }}>
          
          <section style={{ marginBottom: 'var(--space-12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div>
                <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 'var(--space-2)', background: 'linear-gradient(135deg, var(--color-text) 0%, var(--color-accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>GPU CLUSTER OBSERVABILITY</h1>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)', maxWidth: '600px', fontWeight: 400, lineHeight: 1.6 }}>Real-time observability for Meta-scale AI GPU clusters — 512+ GPUs monitored at 60fps with fisheye focus+context</p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button className="btn btn-secondary">EXPORT</button>
                <button className="btn btn-primary">CONFIGURE</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center', padding: 'var(--space-4) var(--space-5)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {(['health', 'utilization', 'temperature'] as const).map(mode => (
                  <button key={mode} onClick={() => setColorMode(mode)} className={'pill ' + (colorMode === mode ? 'pill-accent' : '')} style={{ cursor: 'pointer', background: colorMode === mode ? 'var(--color-accent-muted)' : 'var(--color-surface)', borderColor: colorMode === mode ? 'var(--color-accent)' : 'var(--color-border)', color: colorMode === mode ? 'var(--color-accent)' : 'var(--color-text-muted)', transition: 'all 0.2s ease-out' }}>{colorModeLabels[mode]}</button>
                ))}
              </div>
              <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: 'var(--space-4)', marginLeft: 'var(--space-4)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <input type="checkbox" checked={fisheyeEnabled} onChange={e => setFisheyeEnabled(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent)', cursor: 'pointer' }} /> FISHEYE FOCUS
                </label>
              </div>
            </div>
          </section>

          <section>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', minHeight: '600px' }}>
              <GPUHeatmapCanvas cells={cells} colorMode={colorMode} gridWidth={32} gridHeight={16} fisheyeEnabled={fisheyeEnabled} showFPS={true} showLegend={true} enableZoomPan={true} />
            </div>
          </section>

          <section style={{ marginTop: 'var(--space-12)' }}>
            <div style={{ gridTemplateColumns: 'repeat(4, 1fr)', display: 'grid', gap: 'var(--space-4)' }}>
              <div className="card"><div className="stat"><span className="stat-label">TOTAL GPUS</span><span className="stat-value">512</span></div></div>
              <div className="card" style={{ borderColor: 'var(--color-success)', boxShadow: '0 0 20px rgba(34, 197, 94, 0.15)' }}><div className="stat"><span className="stat-label">HEALTHY</span><span className="stat-value" style={{ color: 'var(--color-success)' }}>{cells.filter(c => c.health > 0.7).length}</span></div></div>
              <div className="card" style={{ borderColor: 'var(--color-danger)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' }}><div className="stat"><span className="stat-label">STRAGGLERS</span><span className="stat-value" style={{ color: 'var(--color-danger)' }}>{cells.filter(c => c.isStraggler).length}</span></div></div>
              <div className="card" style={{ borderColor: 'var(--color-warning)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)' }}><div className="stat"><span className="stat-label">AVG UTILIZATION</span><span className="stat-value" style={{ color: 'var(--color-warning)' }}>{cells.length > 0 ? (cells.reduce((a, c) => a + c.utilization, 0) / cells.length * 100).toFixed(1) : 0}%</span></div></div>
            </div>
          </section>

        </div>
      </main>

      <footer style={{ padding: 'var(--space-8) var(--space-6)', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}>
        <div className="container flex-between" style={{ maxWidth: '1400px', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <p style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-mono)' }}>GPU Cluster Dashboard — Built with React, Three.js, D3, Framer Motion</p>
          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            <a href="#" style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-family-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GITHUB</a>
            <a href="#" style={footerLinkStyle}>DOCS</a>
            <a href="#" style={footerLinkStyle}>LICENSE</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
