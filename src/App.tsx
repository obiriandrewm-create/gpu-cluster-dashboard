import { GPUHeatmapCanvas } from './components/viz/GPUHeatmapCanvas';
import { generateMockGPUCells, GPUCellData } from './lib/three-helpers';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function App() {
  const [cells, setCells] = useState<GPUCellData[]>([]);
  const [colorMode, setColorMode] = useState<'health' | 'utilization' | 'temperature'>('health');
  const [fisheyeEnabled, setFisheyeEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    setMounted(true);
    // Wait for paint before marking hydrated
    requestAnimationFrame(() => {
      setHydrated(true);
      const mockCells = generateMockGPUCells(512, 32, 16);
      setCells(mockCells);
    });
  }, []);

  const colorModeLabels: Record<string, string> = {
    health: 'HEALTH',
    utilization: 'UTILIZATION',
    temperature: 'TEMPERATURE'
  };

  // Show INITIALIZING until first paint + hydration
  if (!mounted || !hydrated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--color-bg)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontFamily: 'var(--font-family-mono)' 
      }}>
        <div style={{ 
          color: 'var(--color-text-muted)', 
          fontSize: 'var(--text-sm)', 
          letterSpacing: '0.1em', 
          textTransform: 'uppercase' 
        }}>
          INITIALIZING...
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const statVariants = (i: number) => ({
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.3 + i * 0.06, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
    }
  });

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="min-h-screen" 
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.header 
        variants={itemVariants}
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 100, 
          background: 'rgba(10, 10, 10, 0.85)', 
          backdropFilter: 'saturate(180%) blur(16px)', 
          borderBottom: '1px solid var(--color-border)', 
          height: '72px'
        }}
      >
        <div className="container flex-between" style={{ maxWidth: '1400px', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <motion.span
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 900, 
                fontSize: 'var(--text-xl)', 
                letterSpacing: '-0.025em', 
                color: 'var(--color-text)', 
                background: 'linear-gradient(135deg, var(--color-text) 0%, var(--color-accent) 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text' 
              }}
              whileHover={{ scale: 1.02 }}
            >
              GPU CLUSTER
            </motion.span>
            <motion.span
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '10px', 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                color: 'var(--color-accent)', 
                padding: '2px 8px', 
                border: '1px solid var(--color-accent)', 
                borderRadius: 'var(--radius-full)' 
              }}
              whileHover={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
            >
              OBSERVABILITY
            </motion.span>
          </div>
          <nav style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
            <motion.a 
              href="#" 
              style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', fontWeight: 500 }}
              whileHover={{ color: 'var(--color-accent)' }}
            >CLUSTERS</motion.a>
            <motion.a 
              href="#" 
              style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', fontWeight: 500 }}
              whileHover={{ color: 'var(--color-accent)' }}
            >ALERTS</motion.a>
            <motion.a 
              href="#" 
              style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', fontWeight: 500 }}
              whileHover={{ color: 'var(--color-accent)' }}
            >ANALYTICS</motion.a>
            <motion.button 
              className="btn btn-primary btn-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >LIVE</motion.button>
          </nav>
        </div>
      </motion.header>

      <main style={{ padding: 'var(--space-8) var(--space-6)' }}>
        <div className="container" style={{ maxWidth: '1400px' }}>
          <motion.section variants={itemVariants} style={{ marginBottom: 'var(--space-16)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flexEnd', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div>
                <motion.h1 
                  style={{ 
                    fontSize: 'var(--text-4xl)', 
                    fontWeight: 900, 
                    letterSpacing: '-0.03em', 
                    lineHeight: 1, 
                    marginBottom: 'var(--space-3)', 
                    background: 'linear-gradient(135deg, var(--color-text) 0%, var(--color-accent) 100%)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent', 
                    backgroundClip: 'text' 
                  }}
                >
                  GPU CLUSTER OBSERVABILITY
                </motion.h1>
                <motion.p 
                  style={{ 
                    fontSize: 'var(--text-lg)', 
                    color: 'var(--color-text-muted)', 
                    maxWidth: '600px', 
                    fontWeight: 400, 
                    lineHeight: 1.6 
                  }}
                >
                  Real-time observability for Meta-scale AI GPU clusters — 512+ GPUs monitored at 60fps with fisheye focus+context
                </motion.p>
              </div>
              <motion.div 
                style={{ display: 'flex', gap: 'var(--space-3)' }}
                whileHover={{ opacity: 0.8 }}
              >
                <motion.button 
                  className="btn btn-secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >EXPORT</motion.button>
                <motion.button 
                  className="btn btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >CONFIGURE</motion.button>
              </motion.div>
            </div>

            <motion.div 
              style={{ 
                display: 'flex', 
                gap: 'var(--space-4)', 
                flexWrap: 'wrap', 
                alignItems: 'center', 
                padding: 'var(--space-4) var(--space-5)', 
                background: 'var(--color-bg-elevated)', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-lg)' 
              }}
            >
              <motion.div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {(['health', 'utilization', 'temperature'] as const).map(mode => (
                  <motion.button
                    key={mode}
                    onClick={() => setColorMode(mode)}
                    className={'pill ' + (colorMode === mode ? 'pill-accent' : '')}
                    style={{ 
                      cursor: 'pointer', 
                      background: colorMode === mode ? 'var(--color-accent-muted)' : 'var(--color-surface)', 
                      borderColor: colorMode === mode ? 'var(--color-accent)' : 'var(--color-border)', 
                      color: colorMode === mode ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      transition: 'all 0.2s ease-out'
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {colorModeLabels[mode]}
                  </motion.button>
                ))}
              </motion.div>
              <motion.div 
                style={{ 
                  borderLeft: '1px solid var(--color-border)', 
                  paddingLeft: 'var(--space-4)', 
                  marginLeft: 'var(--space-4)' 
                }}
              >
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-2)', 
                  cursor: 'pointer', 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 500, 
                  color: 'var(--color-text-muted)', 
                  fontFamily: 'var(--font-mono)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em' 
                }}>
                  <input 
                    type="checkbox" 
                    checked={fisheyeEnabled} 
                    onChange={e => setFisheyeEnabled(e.target.checked)} 
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      accentColor: 'var(--color-accent)', 
                      cursor: 'pointer' 
                    }} 
                  /> FISHEYE FOCUS
                </label>
              </motion.div>
            </motion.div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <motion.div 
              style={{ 
                background: 'var(--color-surface)', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-xl)', 
                overflow: 'hidden', 
                minHeight: '600px' 
              }}
              whileHover={{ boxShadow: '0 0 0 1px var(--color-accent), 0 0 32px rgba(255, 61, 0, 0.15)' }}
              transition={{ duration: 0.3 }}
            >
              <GPUHeatmapCanvas 
                cells={cells} 
                colorMode={colorMode} 
                gridWidth={32} 
                gridHeight={16} 
                fisheyeEnabled={fisheyeEnabled} 
                showFPS={true} 
                showLegend={true} 
                enableZoomPan={true} 
              />
            </motion.div>
          </motion.section>

          <motion.section variants={itemVariants} style={{ marginTop: 'var(--space-12)' }}>
            <motion.div 
              style={{ 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                display: 'grid', 
                gap: 'var(--space-4)' 
              }}
              variants={{ 
                hidden: { opacity: 0 }, 
                visible: { 
                  opacity: 1, 
                  transition: { staggerChildren: 0.06, delayChildren: 0.2 } 
                } 
              }}
            >
              <motion.div 
                className="card"
                variants={statVariants(0)}
                whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
              >
                <div className="stat">
                  <span className="stat-label">TOTAL GPUS</span>
                  <motion.span 
                    className="stat-value"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
                  >
                    512
                  </motion.span>
                </div>
              </motion.div>
              
              <motion.div 
                className="card"
                style={{ borderColor: 'var(--color-success)', boxShadow: '0 0 20px rgba(34, 197, 94, 0.15)' }}
                variants={statVariants(1)}
                whileHover={{ y: -4, boxShadow: '0 0 0 1px var(--color-success), 0 0 32px rgba(34, 197, 94, 0.2)' }}
              >
                <div className="stat">
                  <span className="stat-label">HEALTHY</span>
                  <motion.span 
                    className="stat-value"
                    style={{ color: 'var(--color-success)' }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.46 }}
                  >
                    {cells.filter(c => c.health > 0.7).length}
                  </motion.span>
                </div>
              </motion.div>
              
              <motion.div 
                className="card"
                style={{ borderColor: 'var(--color-danger)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' }}
                variants={statVariants(2)}
                whileHover={{ y: -4, boxShadow: '0 0 0 1px var(--color-danger), 0 0 32px rgba(239, 68, 68, 0.2)' }}
              >
                <div className="stat">
                  <span className="stat-label">STRAGGLERS</span>
                  <motion.span 
                    className="stat-value"
                    style={{ color: 'var(--color-danger)' }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.52 }}
                  >
                    {cells.filter(c => c.isStraggler).length}
                  </motion.span>
                </div>
              </motion.div>
              
              <motion.div 
                className="card"
                style={{ borderColor: 'var(--color-warning)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)' }}
                variants={statVariants(3)}
                whileHover={{ y: -4, boxShadow: '0 0 0 1px var(--color-warning), 0 0 32px rgba(245, 158, 11, 0.2)' }}
              >
                <div className="stat">
                  <span className="stat-label">AVG UTILIZATION</span>
                  <motion.span 
                    className="stat-value"
                    style={{ color: 'var(--color-warning)' }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.58 }}
                  >
                    {cells.length > 0 ? (cells.reduce((a, c) => a + c.utilization, 0) / cells.length * 100).toFixed(1) : 0}%
                  </motion.span>
                </div>
              </motion.div>
            </motion.div>
          </motion.section>

        </div>
      </main>

      <motion.footer 
        variants={itemVariants}
        style={{ 
          padding: 'var(--space-8) var(--space-6)', 
          borderTop: '1px solid var(--color-border)', 
          background: 'var(--color-bg-elevated)' 
        }}
      >
        <div className="container flex-between" style={{ maxWidth: '1400px', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <p style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
            GPU Cluster Dashboard — Built with React, Three.js, D3, Framer Motion
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            <motion.a 
              href="#" 
              style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              whileHover={{ color: 'var(--color-accent)' }}
            >GITHUB</motion.a>
            <motion.a 
              href="#" 
              style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              whileHover={{ color: 'var(--color-accent)' }}
            >DOCS</motion.a>
            <motion.a 
              href="#" 
              style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              whileHover={{ color: 'var(--color-accent)' }}
            >LICENSE</motion.a>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
}

export default App;