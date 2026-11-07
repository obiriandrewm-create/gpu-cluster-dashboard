// Mock data generator for GPU Cluster Dashboard
// Generates realistic mock data for 10K-129K GPUs

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface GPU {
  id: string;
  cluster: string;
  rack: string;
  position: { x: number; y: number; z: number };
  health: 'healthy' | 'degraded' | 'failed' | 'maintenance';
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  powerDraw: number;
  lastCheckpoint: number;
  stragglerScore: number;
  networkRx: number;
  networkTx: number;
  model: string;
  driverVersion: string;
}

interface NetworkLink {
  source: string;
  target: string;
  bandwidth: number;
  utilization: number;
  latency: number;
  health: 'healthy' | 'congested' | 'failed';
  type: 'IB' | 'RoCE' | 'Ethernet';
}

interface Checkpoint {
  id: string;
  cluster: string;
  startTime: number;
  endTime: number | null;
  status: 'running' | 'completed' | 'failed' | 'restarting';
  progress: number;
  size: number;
  gpusInvolved: string[];
}

interface Alert {
  id: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  source: string;
  message: string;
  acknowledged: boolean;
  gpuIds?: string[];
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomGaussian(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function generateGPUs(count: number): GPU[] {
  const clusters = ['cluster-a', 'cluster-b', 'cluster-c', 'cluster-d', 'cluster-e'];
  const racks = Array.from({ length: 50 }, (_, i) => `rack-${String(i + 1).padStart(3, '0')}`);
  const models = ['H100', 'A100', 'H200'];
  const drivers = ['550.90.07', '550.107.02', '550.120.00'];
  
  const gpus: GPU[] = [];
  
  for (let i = 0; i < count; i++) {
    const cluster = randomChoice(clusters);
    const rack = randomChoice(racks);
    const healthRand = Math.random();
    let health: GPU['health'] = 'healthy';
    if (healthRand < 0.02) health = 'failed';
    else if (healthRand < 0.05) health = 'degraded';
    else if (healthRand < 0.07) health = 'maintenance';
    
    const baseUtil = health === 'healthy' ? 0.75 : health === 'degraded' ? 0.45 : 0;
    const utilization = Math.max(0, Math.min(1, randomGaussian(baseUtil, 0.15)));
    
    gpus.push({
      id: `gpu-${String(i + 1).padStart(6, '0')}`,
      cluster,
      rack,
      position: {
        x: Math.random() * 100,
        y: Math.random() * 50,
        z: Math.random() * 20,
      },
      health,
      utilization,
      memoryUsed: Math.floor(utilization * 80 * 1024), // MB
      memoryTotal: 80 * 1024, // 80GB for H100
      temperature: Math.floor(randomGaussian(health === 'healthy' ? 65 : 75, 5)),
      powerDraw: Math.floor(randomGaussian(health === 'healthy' ? 550 : 300, 50)),
      lastCheckpoint: Date.now() - Math.random() * 3600000,
      stragglerScore: health === 'healthy' ? Math.random() * 0.2 : Math.random() * 0.5 + 0.3,
      networkRx: Math.random() * 200, // Gbps
      networkTx: Math.random() * 200,
      model: randomChoice(models),
      driverVersion: randomChoice(drivers),
    });
  }
  
  return gpus;
}

function generateNetworkLinks(gpus: GPU[]): NetworkLink[] {
  const links: NetworkLink[] = [];
  const gpuMap = new Map(gpus.map(g => [g.id, g]));
  
  for (const gpu of gpus) {
    const neighbors = gpus
      .filter(g => g.rack === gpu.rack && g.id !== gpu.id)
      .slice(0, 4);
    
    for (const neighbor of neighbors) {
      if (links.some(l => (l.source === gpu.id && l.target === neighbor.id) || (l.source === neighbor.id && l.target === gpu.id))) continue;
      
      const healthRand = Math.random();
      let health: NetworkLink['health'] = 'healthy';
      if (healthRand < 0.01) health = 'failed';
      else if (healthRand < 0.05) health = 'congested';
      
      links.push({
        source: gpu.id,
        target: neighbor.id,
        bandwidth: 400, // Gbps
        utilization: health === 'healthy' ? Math.random() * 0.6 : health === 'congested' ? 0.8 + Math.random() * 0.2 : 0,
        latency: health === 'healthy' ? Math.random() * 2 : 5 + Math.random() * 10,
        health,
        type: randomChoice(['IB', 'RoCE', 'Ethernet']),
      });
    }
  }
  
  return links;
}

function generateCheckpoints(gpus: GPU[]): Checkpoint[] {
  const checkpoints: Checkpoint[] = [];
  const clusters = [...new Set(gpus.map(g => g.cluster))];
  
  for (const cluster of clusters) {
    const clusterGPUs = gpus.filter(g => g.cluster === cluster);
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now() - Math.random() * 86400000;
      const statusRand = Math.random();
      let status: Checkpoint['status'] = 'completed';
      if (statusRand < 0.1) status = 'failed';
      else if (statusRand < 0.15) status = 'restarting';
      else if (statusRand < 0.2) status = 'running';
      
      checkpoints.push({
        id: `ckpt-${cluster}-${String(i + 1).padStart(3, '0')}`,
        cluster,
        startTime,
        endTime: status === 'running' ? null : startTime + Math.random() * 3600000,
        status,
        progress: status === 'running' ? Math.random() * 0.8 : 1,
        size: Math.floor(Math.random() * 500 + 100) * 1024 * 1024 * 1024, // GB
        gpusInvolved: clusterGPUs.slice(0, Math.floor(clusterGPUs.length * 0.8)).map(g => g.id),
      });
    }
  }
  
  return checkpoints;
}

function generateAlerts(gpus: GPU[]): Alert[] {
  const alerts: Alert[] = [];
  const failedGPUs = gpus.filter(g => g.health === 'failed');
  const degradedGPUs = gpus.filter(g => g.health === 'degraded');
  const congestedLinks = Math.floor(Math.random() * 10);
  
  for (const gpu of failedGPUs.slice(0, 5)) {
    alerts.push({
      id: `alert-${gpu.id}-${Date.now()}`,
      timestamp: Date.now() - Math.random() * 3600000,
      severity: 'critical',
      source: gpu.id,
      message: `GPU ${gpu.id} in ${gpu.rack} reported as FAILED. Temperature: ${gpu.temperature}°C`,
      acknowledged: Math.random() < 0.5,
      gpuIds: [gpu.id],
    });
  }
  
  for (const gpu of degradedGPUs.slice(0, 10)) {
    alerts.push({
      id: `alert-${gpu.id}-${Date.now()}`,
      timestamp: Date.now() - Math.random() * 7200000,
      severity: 'warning',
      source: gpu.id,
      message: `GPU ${gpu.id} showing degraded performance. Utilization: ${(gpu.utilization * 100).toFixed(1)}%`,
      acknowledged: Math.random() < 0.7,
      gpuIds: [gpu.id],
    });
  }
  
  for (let i = 0; i < congestedLinks; i++) {
    alerts.push({
      id: `alert-network-${i}-${Date.now()}`,
      timestamp: Date.now() - Math.random() * 1800000,
      severity: 'warning',
      source: `network-link-${i}`,
      message: `Network congestion detected on link ${i}. Utilization > 90%`,
      acknowledged: Math.random() < 0.6,
    });
  }
  
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
}

function main() {
  const gpuCount = parseInt(process.env.GPU_COUNT || '10000', 10);
  const outputDir = join(__dirname, '..', 'public', 'mock-data');
  
  mkdirSync(outputDir, { recursive: true });
  
  console.log(`Generating mock data for ${gpuCount} GPUs...`);
  
  const gpus = generateGPUs(gpuCount);
  const networkLinks = generateNetworkLinks(gpus);
  const checkpoints = generateCheckpoints(gpus);
  const alerts = generateAlerts(gpus);
  
  writeFileSync(join(outputDir, 'gpus.json'), JSON.stringify(gpus, null, 2));
  writeFileSync(join(outputDir, 'network-links.json'), JSON.stringify(networkLinks, null, 2));
  writeFileSync(join(outputDir, 'checkpoints.json'), JSON.stringify(checkpoints, null, 2));
  writeFileSync(join(outputDir, 'alerts.json'), JSON.stringify(alerts, null, 2));
  
  const summary = {
    generatedAt: new Date().toISOString(),
    gpuCount: gpus.length,
    networkLinks: networkLinks.length,
    checkpoints: checkpoints.length,
    alerts: alerts.length,
    clusters: [...new Set(gpus.map(g => g.cluster))],
    healthDistribution: {
      healthy: gpus.filter(g => g.health === 'healthy').length,
      degraded: gpus.filter(g => g.health === 'degraded').length,
      failed: gpus.filter(g => g.health === 'failed').length,
      maintenance: gpus.filter(g => g.health === 'maintenance').length,
    },
    avgUtilization: gpus.reduce((sum, g) => sum + g.utilization, 0) / gpus.length,
  };
  
  writeFileSync(join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));
  
  console.log('Mock data generated successfully!');
  console.log(JSON.stringify(summary, null, 2));
}

main();