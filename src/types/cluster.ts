export interface GPU {
  id: string;
  nodeId: string;
  index: number;
  name: string;
  memoryTotal: number;
  memoryUsed: number;
  utilization: number;
  temperature: number;
  powerDraw: number;
  powerLimit: number;
  clockSpeed: number;
  maxClockSpeed: number;
  fanSpeed: number;
  health: 'healthy' | 'degraded' | 'critical';
  stragglerScore?: number;
  lastCheckpoint?: string;
  checkpointProgress?: number;
}

export interface Node {
  id: string;
  name: string;
  gpus: GPU[];
  cpuUsage: number;
  memoryUsage: number;
  networkRx: number;
  networkTx: number;
  health: 'healthy' | 'degraded' | 'critical';
}

export interface Cluster {
  id: string;
  name: string;
  nodes: Node[];
  totalGPUs: number;
  healthyGPUs: number;
  degradedGPUs: number;
  criticalGPUs: number;
  avgUtilization: number;
  totalMemoryUsed: number;
  totalMemoryTotal: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  bandwidth: number;
  utilization: number;
  latency: number;
  packetLoss: number;
  congestion: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface NetworkTopology {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface NetworkNode {
  id: string;
  name: string;
  type: 'switch' | 'server' | 'router';
  x: number;
  y: number;
  health: 'healthy' | 'degraded' | 'critical';
}

export interface Straggler {
  gpuId: string;
  nodeId: string;
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  firstDetected: string;
  lastUpdate: string;
  metrics: {
    utilization: number;
    memoryUtilization: number;
    temperature: number;
    powerDraw: number;
    clockThrottle: number;
  };
  timeline: StragglerEvent[];
}

export interface StragglerEvent {
  timestamp: string;
  score: number;
  eventType: 'detected' | 'escalated' | 'resolved' | 'updated';
  details: string;
}

export interface StragglerScoreDistribution {
  score: number;
  count: number;
  percentage: number;
}

export interface Checkpoint {
  id: string;
  jobId: string;
  jobName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'restarting';
  progress: number;
  size: number;
  throughput: number;
  startTime: string;
  estimatedCompletion: string;
  gpuIds: string[];
  restarts: number;
  lastRestart?: string;
  phase: 'save' | 'load' | 'verify';
}

export interface CheckpointMetrics {
  totalCheckpoints: number;
  completedCheckpoints: number;
  failedCheckpoints: number;
  avgThroughput: number;
  avgSize: number;
  totalRestarts: number;
  successRate: number;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface RealTimeConfig {
  enabled: boolean;
  interval: number;
  sseEndpoint: string;
  wsEndpoint?: string;
}

export interface DashboardConfig {
  clusterId: string;
  refreshInterval: number;
  timeRange: TimeRange;
  realTime: RealTimeConfig;
  theme: 'light' | 'dark' | 'high-contrast';
}