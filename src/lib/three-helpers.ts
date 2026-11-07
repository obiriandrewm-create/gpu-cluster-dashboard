/**
 * Three.js Helpers - Scene, Camera, Renderer, and Instanced Mesh utilities
 * Optimized for rendering 100K+ GPU cells at 60fps using instanced rendering
 */

import * as THREE from 'three';

/**
 * Configuration options for the Three.js scene
 */
export interface ThreeSceneConfig {
  /** Canvas element to render into */
  canvas: HTMLCanvasElement;
  /** Width of the render area */
  width: number;
  /** Height of the render area */
  height: number;
  /** Device pixel ratio (for high-DPI displays) */
  pixelRatio?: number;
  /** Background color */
  backgroundColor?: number;
  /** Whether to enable shadows */
  shadows?: boolean;
  /** Tone mapping type */
  toneMapping?: THREE.ToneMapping;
  /** Tone mapping exposure */
  toneMappingExposure?: number;
}

/**
 * Camera configuration
 */
export interface CameraConfig {
  /** Field of view in degrees */
  fov?: number;
  /** Aspect ratio */
  aspect?: number;
  /** Near clipping plane */
  near?: number;
  /** Far clipping plane */
  far?: number;
  /** Initial camera position */
  position?: THREE.Vector3;
  /** Initial camera target */
  target?: THREE.Vector3;
}

/**
 * Instanced mesh configuration for GPU cells
 */
export interface InstancedMeshConfig {
  /** Number of instances (GPU cells) */
  count: number;
  /** Cell size in world units */
  cellSize: number;
  /** Gap between cells */
  cellGap: number;
  /** Grid width (cells per row) */
  gridWidth: number;
  /** Grid height (cells per column) */
  gridHeight: number;
  /** Color encoding mode */
  colorMode: 'health' | 'utilization' | 'temperature';
  /** Whether to enable fisheye distortion */
  fisheyeEnabled: boolean;
  /** Fisheye focus point (normalized 0-1) */
  fisheyeFocus?: { x: number; y: number } | undefined;
  /** Fisheye radius (normalized 0-1) */
  fisheyeRadius?: number | undefined;
  /** Fisheye strength */
  fisheyeStrength?: number | undefined;
}

/**
 * GPU cell data for instanced rendering
 */
export interface GPUCellData {
  /** Instance index */
  index: number;
  /** Grid X position */
  gridX: number;
  /** Grid Y position */
  gridY: number;
  /** Health value (0-1) */
  health: number;
  /** Utilization value (0-1) */
  utilization: number;
  /** Temperature value (0-1, normalized) */
  temperature: number;
  /** Whether this GPU is a straggler */
  isStraggler: boolean;
  /** Straggler severity (0-1) */
  stragglerSeverity: number;
  /** GPU ID for tooltip */
  gpuId: string;
  /** Node ID for tooltip */
  nodeId: string;
}

/**
 * Creates a Three.js WebGL renderer with optimal settings
 */
export function createRenderer(config: ThreeSceneConfig): THREE.WebGLRenderer {
  const {
    canvas,
    width,
    height,
    pixelRatio = Math.min(window.devicePixelRatio, 2),
    backgroundColor = 0x0a0a0a,
    shadows = false,
    toneMapping = THREE.ACESFilmicToneMapping,
    toneMappingExposure = 1.0,
  } = config;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });

  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(backgroundColor, 1);

  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  renderer.toneMapping = toneMapping;
  renderer.toneMappingExposure = toneMappingExposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Optimize for performance
  renderer.info.autoReset = false;
  renderer.sortObjects = false;

  return renderer;
}

/**
 * Creates an orthographic camera for 2D heatmap rendering
 */
export function createOrthographicCamera(config: CameraConfig = {}): THREE.OrthographicCamera {
  const {
    fov: _fov = 50,
    aspect = 1,
    near = 0.1,
    far = 1000,
    position = new THREE.Vector3(0, 0, 100),
    target = new THREE.Vector3(0, 0, 0),
  } = config;

  const frustumSize = 100;
  const camera = new THREE.OrthographicCamera(
    (-frustumSize * aspect) / 2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    -frustumSize / 2,
    near,
    far
  );

  camera.position.copy(position);
  camera.lookAt(target);
  camera.updateProjectionMatrix();

  return camera;
}

/**
 * Creates a perspective camera for 3D view
 */
export function createPerspectiveCamera(config: CameraConfig = {}): THREE.PerspectiveCamera {
  const {
    fov: _fov = 50,
    aspect = 1,
    near = 0.1,
    far = 1000,
    position = new THREE.Vector3(0, 0, 100),
    target = new THREE.Vector3(0, 0, 0),
  } = config;

  const camera = new THREE.PerspectiveCamera(_fov, aspect, near, far);
  camera.position.copy(position);
  camera.lookAt(target);
  camera.updateProjectionMatrix();

  return camera;
}

/**
 * Creates a basic scene with optimal settings
 */
export function createScene(backgroundColor = 0x0a0a0a): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(backgroundColor);
  scene.fog = new THREE.FogExp2(backgroundColor, 0.001);
  return scene;
}

/**
 * Creates an instanced mesh for GPU cells with custom shader for color encoding
 */
export function createGPUInstancedMesh(config: InstancedMeshConfig): THREE.InstancedMesh {
  const { count, cellSize, cellGap, gridWidth, gridHeight, colorMode } = config;

  // Geometry for a single cell (quad)
  const geometry = new THREE.PlaneGeometry(cellSize, cellSize);
  geometry.translate(0, 0, 0);

  // Custom shader material for color encoding and fisheye
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColorMode: { value: getColorModeIndex(colorMode) },
      uTime: { value: 0 },
      uFisheyeEnabled: { value: config.fisheyeEnabled ? 1.0 : 0.0 },
      uFisheyeFocus: { value: new THREE.Vector2(config.fisheyeFocus?.x ?? 0.5, config.fisheyeFocus?.y ?? 0.5) },
      uFisheyeRadius: { value: config.fisheyeRadius ?? 0.3 },
      uFisheyeStrength: { value: config.fisheyeStrength ?? 2.0 },
      uGridSize: { value: new THREE.Vector2(gridWidth, gridHeight) },
      uCellSize: { value: cellSize },
      uCellGap: { value: cellGap },
      uStragglerHighlight: { value: 1.0 },
    },
    vertexShader: `
      attribute vec3 instancePosition;
      attribute vec4 instanceColor;
      attribute float instanceStraggler;
      attribute float instanceStragglerSeverity;
      
      uniform float uTime;
      uniform bool uFisheyeEnabled;
      uniform vec2 uFisheyeFocus;
      uniform float uFisheyeRadius;
      uniform float uFisheyeStrength;
      uniform vec2 uGridSize;
      uniform float uCellSize;
      uniform float uCellGap;
      uniform float uStragglerHighlight;
      
      varying vec4 vColor;
      varying float vStraggler;
      varying float vStragglerSeverity;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      // Fisheye distortion function
      vec2 fisheye(vec2 uv, vec2 focus, float radius, float strength) {
        vec2 delta = uv - focus;
        float dist = length(delta);
        if (dist < radius && dist > 0.0) {
          float factor = 1.0 + strength * (1.0 - dist / radius);
          return focus + delta * factor;
        }
        return uv;
      }
      
      void main() {
        vUv = uv;
        vColor = instanceColor;
        vStraggler = instanceStraggler;
        vStragglerSeverity = instanceStragglerSeverity;
        
        vec3 pos = position;
        pos.xy += instancePosition.xy;
        vWorldPosition = pos;
        
        // Convert to normalized grid coordinates for fisheye
        vec2 gridUv = (instancePosition.xy + vec2(uCellSize + uCellGap) * 0.5) / (uGridSize * (uCellSize + uCellGap));
        
        if (uFisheyeEnabled) {
          gridUv = fisheye(gridUv, uFisheyeFocus, uFisheyeRadius, uFisheyeStrength);
          // Convert back to world coordinates
          pos.xy = gridUv * (uGridSize * (uCellSize + uCellGap)) - vec2(uCellSize + uCellGap) * 0.5;
        }
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec4 vColor;
      varying float vStraggler;
      varying float vStragglerSeverity;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      
      uniform float uStragglerHighlight;
      
      void main() {
        vec4 color = vColor;
        
        // Straggler highlight: pulsing border effect
        if (vStraggler > 0.5) {
          float borderWidth = 0.02;
          float distFromEdge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
          
          if (distFromEdge < borderWidth) {
            float pulse = 0.5 + 0.5 * sin(5.0 * 3.14159 * vStragglerSeverity + 10.0 * uStragglerHighlight);
            vec3 stragglerColor = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), vStragglerSeverity);
            color.rgb = mix(color.rgb, stragglerColor, pulse * 0.8);
          }
          
          // Subtle glow
          float glow = 1.0 - smoothstep(0.0, 0.15, distFromEdge);
          color.rgb += vec3(1.0, 0.3, 0.0) * glow * vStragglerSeverity * 0.3;
        }
        
        // Subtle grid lines
        float gridLine = step(0.98, max(vUv.x, vUv.y)) * 0.1;
        color.rgb -= vec3(gridLine);
        
        gl_FragColor = color;
      }
    `,
    transparent: false,
    depthWrite: true,
    depthTest: true,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 4), 4);
  mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

  // Custom attributes for straggler data
  const stragglerArray = new Float32Array(count);
  const stragglerSeverityArray = new Float32Array(count);
  mesh.geometry.setAttribute(
    'instanceStraggler',
    new THREE.InstancedBufferAttribute(stragglerArray, 1)
  );
  mesh.geometry.setAttribute(
    'instanceStragglerSeverity',
    new THREE.InstancedBufferAttribute(stragglerSeverityArray, 1)
  );

  mesh.frustumCulled = false; // We handle culling manually if needed

  return mesh;
}

/**
 * Updates the instanced mesh with new GPU cell data
 */
export function updateGPUInstancedMesh(
  mesh: THREE.InstancedMesh,
  cells: GPUCellData[],
  colorMode: 'health' | 'utilization' | 'temperature',
  gridWidth: number,
  gridHeight: number,
  cellSize: number,
  cellGap: number
): void {
  const count = cells.length;
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  // Update instance matrix and colors
  for (let i = 0; i < count; i++) {
    const cell = cells[i];
    if (!cell) continue;
    
    // Calculate world position from grid position
    const x = (cell.gridX - (gridWidth - 1) / 2) * (cellSize + cellGap);
    const y = ((gridHeight - 1) / 2 - cell.gridY) * (cellSize + cellGap);
    
    dummy.position.set(x, y, 0);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    
    mesh.setMatrixAt(i, dummy.matrix);

    // Set color based on mode
    const value = colorMode === 'health' ? cell.health : 
                  colorMode === 'utilization' ? cell.utilization : cell.temperature;
    color.setHSL((1.0 - value) * 0.35, 0.8, 0.5); // Green to red gradient
    
    const colorArray = mesh.instanceColor?.array as Float32Array;
    if (colorArray) {
      colorArray[i * 4 + 0] = color.r;
      colorArray[i * 4 + 1] = color.g;
      colorArray[i * 4 + 2] = color.b;
      colorArray[i * 4 + 3] = 1.0;
    }

    // Update straggler attributes
    const stragglerAttr = mesh.geometry.getAttribute('instanceStraggler') as THREE.InstancedBufferAttribute;
    const severityAttr = mesh.geometry.getAttribute('instanceStragglerSeverity') as THREE.InstancedBufferAttribute;
    
    if (stragglerAttr && severityAttr) {
      stragglerAttr.setX(i, cell.isStraggler ? 1.0 : 0.0);
      severityAttr.setX(i, cell.stragglerSeverity);
      stragglerAttr.needsUpdate = true;
      severityAttr.needsUpdate = true;
    }
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }

  // Update material uniform
  const material = mesh.material as THREE.ShaderMaterial;
  if (material.uniforms.uColorMode) {
    material.uniforms.uColorMode.value = getColorModeIndex(colorMode);
  }
}

/**
 * Converts color mode string to shader index
 */
function getColorModeIndex(mode: 'health' | 'utilization' | 'temperature'): number {
  switch (mode) {
    case 'health': return 0;
    case 'utilization': return 1;
    case 'temperature': return 2;
    default: return 0;
  }
}

/**
 * Creates a raycaster for GPU cell picking
 */
export function createGPURaycaster(
  _camera: THREE.Camera,
  _canvas: HTMLCanvasElement
): THREE.Raycaster {
  const raycaster = new THREE.Raycaster();
  raycaster.params.Mesh = { threshold: 0.01 };
  return raycaster;
}

/**
 * Converts screen coordinates to normalized device coordinates
 */
export function getNormalizedCoords(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement
): THREE.Vector2 {
  const rect = canvas.getBoundingClientRect();
  return new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1
  );
}

/**
 * Picks a GPU cell at the given screen coordinates
 */
export function pickGPUCell(
  raycaster: THREE.Raycaster,
  camera: THREE.Camera,
  mesh: THREE.InstancedMesh,
  ndc: THREE.Vector2
): { index: number; point: THREE.Vector3 } | null {
  raycaster.setFromCamera(ndc, camera);
  
  const intersects = raycaster.intersectObject(mesh, false);
  if (intersects.length > 0) {
    const intersect = intersects[0];
    if (!intersect) return null;
    return {
      index: intersect.instanceId ?? -1,
      point: intersect.point,
    };
  }
  return null;
}

/**
 * Disposes of Three.js resources to prevent memory leaks
 */
export function disposeThreeResources(
  renderer: THREE.WebGLRenderer | null,
  scene: THREE.Scene | null,
  mesh: THREE.InstancedMesh | null,
  _camera: THREE.Camera | null
): void {
  if (mesh) {
    mesh.geometry.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  }

  if (scene) {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
  }

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    const canvas = renderer.domElement;
    if (canvas && canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
  }
}

/**
 * Calculates optimal grid dimensions for a given GPU count
 */
export function calculateGridDimensions(gpuCount: number, aspectRatio: number): { width: number; height: number } {
  // Aim for roughly square cells, respecting aspect ratio
  const targetCells = Math.ceil(Math.sqrt(gpuCount * aspectRatio));
  const width = Math.min(targetCells, gpuCount);
  const height = Math.ceil(gpuCount / width);
  return { width, height };
}

/**
 * Generates mock GPU cell data for testing
 */
export function generateMockGPUCells(
  count: number,
  gridWidth: number,
  _gridHeight: number
): GPUCellData[] {
  const cells: GPUCellData[] = [];
  
  for (let i = 0; i < count; i++) {
    const gridX = i % gridWidth;
    const gridY = Math.floor(i / gridWidth);
    
    // Generate somewhat realistic distributions
    const health = 0.3 + Math.random() * 0.7; // 0.3-1.0
    const utilization = Math.random() * 0.8; // 0-0.8
    const temperature = 0.2 + Math.random() * 0.6; // 0.2-0.8
    
    // Some GPUs are stragglers
    const isStraggler = Math.random() < 0.05; // 5% stragglers
    const stragglerSeverity = isStraggler ? 0.3 + Math.random() * 0.7 : 0;
    
    cells.push({
      index: i,
      gridX,
      gridY,
      health,
      utilization,
      temperature,
      isStraggler,
      stragglerSeverity,
      gpuId: `gpu-${i}`,
      nodeId: `node-${Math.floor(i / 8)}`,
    });
  }
  
  return cells;
}