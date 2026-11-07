/**
 * useWebGL - WebGL context and capability detection hook
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebGLCapabilities {
  /** WebGL version (1 or 2) */
  version: 1 | 2;
  /** Maximum texture size */
  maxTextureSize: number;
  /** Maximum vertex attributes */
  maxVertexAttribs: number;
  /** Maximum vertex uniforms */
  maxVertexUniforms: number;
  /** Maximum fragment uniforms */
  maxFragmentUniforms: number;
  /** Maximum varying vectors */
  maxVaryingVectors: number;
  /** Maximum render buffer size */
  maxRenderbufferSize: number;
  /** Supports float textures */
  floatTextures: boolean;
  /** Supports half-float textures */
  halfFloatTextures: boolean;
  /** Supports instanced arrays */
  instancedArrays: boolean;
  /** Supports vertex array objects */
  vertexArrayObjects: boolean;
  /** Supports depth textures */
  depthTextures: boolean;
  /** Supports standard derivatives */
  standardDerivatives: boolean;
  /** Supports compressed textures (S3TC) */
  compressedTexturesS3TC: boolean;
  /** Supports compressed textures (ETC) */
  compressedTexturesETC: boolean;
  /** Supports compressed textures (ASTC) */
  compressedTexturesASTC: boolean;
  /** Supports anisotropic filtering */
  anisotropicFiltering: number;
  /** Vendor string */
  vendor: string;
  /** Renderer string */
  renderer: string;
  /** Shading language version */
  shadingLanguageVersion: string;
}

export interface UseWebGLOptions {
  /** Canvas element ref */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** WebGL context attributes */
  contextAttributes?: WebGLContextAttributes;
  /** Whether to auto-detect capabilities */
  autoDetect?: boolean;
  /** Callback when context is lost */
  onContextLost?: (event: Event) => void;
  /** Callback when context is restored */
  onContextRestored?: (event: Event) => void;
}

export interface UseWebGLReturn {
  /** WebGL rendering context */
  gl: WebGLRenderingContext | WebGL2RenderingContext | null;
  /** Detected capabilities */
  capabilities: WebGLCapabilities | null;
  /** Whether WebGL is supported */
  isSupported: boolean;
  /** Whether context was lost */
  isContextLost: boolean;
  /** Get context attributes */
  getContextAttributes: () => WebGLContextAttributes | null;
  /** Force context loss (for testing) */
  loseContext: () => void;
  /** Restore context */
  restoreContext: () => void;
}

/**
 * Default WebGL context attributes for high performance
 */
const DEFAULT_CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: false,
  antialias: true,
  depth: true,
  stencil: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
  powerPreference: 'high-performance',
  failIfMajorPerformanceCaveat: false,
  desynchronized: true,
};

/**
 * Detect WebGL capabilities from context
 */
function detectCapabilities(gl: WebGLRenderingContext | WebGL2RenderingContext): WebGLCapabilities {
  const isWebGL2 = gl instanceof WebGL2RenderingContext;
  
  // Get extensions
  const extFloatTexture = gl.getExtension('OES_texture_float');
  const extHalfFloatTexture = gl.getExtension('OES_texture_half_float');
  const extInstancedArrays = gl.getExtension('ANGLE_instanced_arrays');
  const extVAO = gl.getExtension('OES_vertex_array_object');
  const extDepthTexture = gl.getExtension('WEBGL_depth_texture');
  const extStandardDerivatives = gl.getExtension('OES_standard_derivatives');
  const extS3TC = gl.getExtension('WEBGL_compressed_texture_s3tc');
  const extETC = gl.getExtension('WEBGL_compressed_texture_etc');
  const extASTC = gl.getExtension('WEBGL_compressed_texture_astc');
  const extAnisotropic = gl.getExtension('EXT_texture_filter_anisotropic');

  return {
    version: isWebGL2 ? 2 : 1,
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
    maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
    maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
    maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    floatTextures: !!extFloatTexture,
    halfFloatTextures: !!extHalfFloatTexture,
    instancedArrays: !!extInstancedArrays,
    vertexArrayObjects: !!extVAO || isWebGL2,
    depthTextures: !!extDepthTexture || isWebGL2,
    standardDerivatives: !!extStandardDerivatives,
    compressedTexturesS3TC: !!extS3TC,
    compressedTexturesETC: !!extETC,
    compressedTexturesASTC: !!extASTC,
    anisotropicFiltering: extAnisotropic 
      ? gl.getParameter(extAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
      : 1,
    vendor: gl.getParameter(gl.VENDOR),
    renderer: gl.getParameter(gl.RENDERER),
    shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
  };
}

/**
 * Hook for WebGL context management and capability detection
 */
export function useWebGL(options: UseWebGLOptions): UseWebGLReturn {
  const {
    canvasRef,
    contextAttributes = DEFAULT_CONTEXT_ATTRIBUTES,
    autoDetect = true,
    onContextLost,
    onContextRestored,
  } = options;

  const glRef = useRef<WebGLRenderingContext | WebGL2RenderingContext | null>(null);
  const canvasRefInternal = useRef<HTMLCanvasElement | null>(null);
  const [capabilities, setCapabilities] = useState<WebGLCapabilities | null>(null);
  const [isContextLost, setIsContextLost] = useState(false);

  // Initialize WebGL context
  const initializeContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas === canvasRefInternal.current) return;

    canvasRefInternal.current = canvas;

    // Try WebGL2 first, fallback to WebGL1
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = 
      canvas.getContext('webgl2', contextAttributes);
    
    if (!gl) {
      gl = (canvas.getContext('webgl', contextAttributes) ||
           canvas.getContext('experimental-webgl', contextAttributes)) as WebGLRenderingContext | null;
    }

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;
    setIsContextLost(false);

    // Detect capabilities
    if (autoDetect) {
      const caps = detectCapabilities(gl);
      setCapabilities(caps);
    }

    // Context loss handlers
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setIsContextLost(true);
      onContextLost?.(event);
    };

    const handleContextRestored = (event: Event) => {
      setIsContextLost(false);
      // Re-detect capabilities after restore
      if (autoDetect && glRef.current) {
        const caps = detectCapabilities(glRef.current);
        setCapabilities(caps);
      }
      onContextRestored?.(event);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    // Store cleanup function on canvas
    (canvas as any).__webglCleanup = () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [canvasRef, contextAttributes, autoDetect, onContextLost, onContextRestored]);

  // Get context attributes
  const getContextAttributes = useCallback((): WebGLContextAttributes | null => {
    return glRef.current?.getContextAttributes() ?? null;
  }, []);

  // Force context loss
  const loseContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ext = canvas.getContext('webgl')?.getExtension('WEBGL_lose_context') ||
                    canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context');
      if (ext) {
        (ext as any).loseContext();
      }
    }
  }, [canvasRef]);

  // Restore context
  const restoreContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ext = canvas.getContext('webgl')?.getExtension('WEBGL_lose_context') ||
                    canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context');
      if (ext) {
        (ext as any).restoreContext();
      }
    }
  }, [canvasRef]);

  // Initialize on mount and when canvas changes
  useEffect(() => {
    initializeContext();
    
    return () => {
      const canvas = canvasRef.current;
      if (canvas && (canvas as any).__webglCleanup) {
        (canvas as any).__webglCleanup();
      }
      glRef.current = null;
      canvasRefInternal.current = null;
    };
  }, [initializeContext]);

  // Re-initialize when canvas ref changes
  useEffect(() => {
    if (canvasRef.current && canvasRef.current !== canvasRefInternal.current) {
      initializeContext();
    }
  }, [canvasRef.current, initializeContext]);

  return {
    gl: glRef.current,
    capabilities,
    isSupported: glRef.current !== null,
    isContextLost,
    getContextAttributes,
    loseContext,
    restoreContext,
  };
}

/**
 * Hook for checking WebGL support without creating a context
 */
export function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setSupported(!!gl);
  }, []);

  return supported ?? false;
}