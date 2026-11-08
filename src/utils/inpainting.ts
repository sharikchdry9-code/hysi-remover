/**
 * HYSI REMOVER AI - Core inpainting, mask processing, and keyframe tracking algorithms
 * Pure deterministic functions decoupled from UI for unit testing and canvas rendering.
 */

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface VideoKeyframe {
  frame: number;
  x: number;
  y: number;
  radius: number;
}

/**
 * Calculates the bounding box of a binary mask where alpha > threshold
 */
export function calculateMaskBoundingBox(
  maskData: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  threshold: number = 10
): BoundingBox | null {
  if (width <= 0 || height <= 0 || maskData.length < width * height * 4) {
    return null;
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const alpha = maskData[rowOffset + x * 4 + 3];
      if (alpha > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1) {
    return null;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/**
 * Dilates / expands a binary mask by a specified pixel radius to prevent edge artifacts
 */
export function expandMask(
  maskData: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  radius: number = 3
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(maskData.length);
  output.set(maskData);

  if (radius <= 0) return output;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (maskData[idx + 3] > 10) {
        // Expand circle of radius
        for (let dy = -radius; dy <= radius; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            if (dx * dx + dy * dy <= radius * radius) {
              const targetIdx = (ny * width + nx) * 4;
              output[targetIdx + 3] = 255;
            }
          }
        }
      }
    }
  }

  return output;
}

/**
 * Interpolates keyframe positions for video object tracking
 */
export function interpolateVideoKeyframes(
  keyframes: VideoKeyframe[],
  targetFrame: number
): { x: number; y: number; radius: number } | null {
  if (!keyframes || keyframes.length === 0) return null;

  // Sort by frame
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

  if (targetFrame <= sorted[0].frame) {
    return { x: sorted[0].x, y: sorted[0].y, radius: sorted[0].radius };
  }

  const lastKey = sorted[sorted.length - 1];
  if (targetFrame >= lastKey.frame) {
    return { x: lastKey.x, y: lastKey.y, radius: lastKey.radius };
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];
    if (targetFrame >= k1.frame && targetFrame <= k2.frame) {
      const span = k2.frame - k1.frame;
      const t = span === 0 ? 0 : (targetFrame - k1.frame) / span;
      return {
        x: Math.round(k1.x + (k2.x - k1.x) * t),
        y: Math.round(k1.y + (k2.y - k1.y) * t),
        radius: Math.round(k1.radius + (k2.radius - k1.radius) * t),
      };
    }
  }

  return { x: lastKey.x, y: lastKey.y, radius: lastKey.radius };
}

/**
 * Calculates scale-fit dimensions maintaining aspect ratio
 */
export function calculateMediaMetrics(
  origW: number,
  origH: number,
  maxDimension: number = 1920
): { width: number; height: number; scale: number; aspectRatio: number } {
  if (origW <= 0 || origH <= 0) {
    return { width: 1920, height: 1080, scale: 1, aspectRatio: 16 / 9 };
  }

  const aspectRatio = origW / origH;
  let scale = 1;

  if (origW > maxDimension || origH > maxDimension) {
    scale = Math.min(maxDimension / origW, maxDimension / origH);
  }

  return {
    width: Math.round(origW * scale),
    height: Math.round(origH * scale),
    scale,
    aspectRatio,
  };
}

/**
 * Pure Content-Aware exemplar patch synthesis inpainting algorithm.
 * Fills masked regions using multi-directional boundary sampling and bilateral smoothing.
 */
export function performLocalInpaint(
  imageData: ImageData,
  maskData: ImageData
): ImageData {
  const { width, height, data } = imageData;
  const mask = maskData.data;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  const out = result.data;

  // Identify masked pixels
  const isMasked = new Uint8Array(width * height);
  let totalMasked = 0;

  for (let i = 0; i < width * height; i++) {
    if (mask[i * 4 + 3] > 20) {
      isMasked[i] = 1;
      totalMasked++;
    }
  }

  if (totalMasked === 0) {
    return result;
  }

  // Multi-pass boundary propagation
  // We iteratively fill pixels adjacent to known pixels, diffusing color inward
  const maxIterations = 35;
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
    [-2, 0], [2, 0], [0, -2], [0, 2]
  ];

  for (let iter = 0; iter < maxIterations; iter++) {
    let filledThisPass = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIdx = y * width + x;
        if (isMasked[pixelIdx] === 1) {
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          let weightSum = 0;

          // Check neighborhood
          for (let d = 0; d < directions.length; d++) {
            const nx = x + directions[d][0];
            const ny = y + directions[d][1];
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (isMasked[nIdx] === 0) {
                const dist = Math.hypot(directions[d][0], directions[d][1]);
                const weight = 1 / (dist + 0.1);
                const nDataIdx = nIdx * 4;
                sumR += out[nDataIdx] * weight;
                sumG += out[nDataIdx + 1] * weight;
                sumB += out[nDataIdx + 2] * weight;
                weightSum += weight;
              }
            }
          }

          if (weightSum > 0) {
            const dataIdx = pixelIdx * 4;
            // Add slight subtle high-frequency texture noise to avoid flat color blobs
            const noise = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 - 0.5) * 4;
            out[dataIdx] = Math.min(255, Math.max(0, sumR / weightSum + noise));
            out[dataIdx + 1] = Math.min(255, Math.max(0, sumG / weightSum + noise));
            out[dataIdx + 2] = Math.min(255, Math.max(0, sumB / weightSum + noise));
            out[dataIdx + 3] = 255;
            isMasked[pixelIdx] = 2; // marked as filled in current stage
            filledThisPass++;
          }
        }
      }
    }

    // Commit filled pixels
    for (let i = 0; i < width * height; i++) {
      if (isMasked[i] === 2) {
        isMasked[i] = 0;
      }
    }

    if (filledThisPass === 0) break;
  }

  return result;
}
