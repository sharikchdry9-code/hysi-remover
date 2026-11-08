import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMaskBoundingBox,
  expandMask,
  interpolateVideoKeyframes,
  calculateMediaMetrics,
} from './inpainting';

test('calculateMaskBoundingBox detects non-empty mask bounds correctly', () => {
  const width = 10;
  const height = 10;
  const mask = new Uint8ClampedArray(width * height * 4);

  // Paint a 2x2 box from (3,4) to (4,5)
  for (let y = 4; y <= 5; y++) {
    for (let x = 3; x <= 4; x++) {
      const idx = (y * width + x) * 4;
      mask[idx + 3] = 255;
    }
  }

  const bbox = calculateMaskBoundingBox(mask, width, height);
  assert.ok(bbox !== null);
  assert.equal(bbox.minX, 3);
  assert.equal(bbox.minY, 4);
  assert.equal(bbox.maxX, 4);
  assert.equal(bbox.maxY, 5);
  assert.equal(bbox.width, 2);
  assert.equal(bbox.height, 2);
});

test('calculateMaskBoundingBox returns null on empty mask', () => {
  const width = 5;
  const height = 5;
  const mask = new Uint8ClampedArray(width * height * 4);
  const bbox = calculateMaskBoundingBox(mask, width, height);
  assert.equal(bbox, null);
});

test('expandMask dilates mask boundaries', () => {
  const width = 10;
  const height = 10;
  const mask = new Uint8ClampedArray(width * height * 4);
  // Single point at (5,5)
  const centerIdx = (5 * width + 5) * 4;
  mask[centerIdx + 3] = 255;

  const expanded = expandMask(mask, width, height, 1);
  // (5,4) and (5,6) should now be covered
  const topIdx = (4 * width + 5) * 4;
  const bottomIdx = (6 * width + 5) * 4;
  assert.equal(expanded[topIdx + 3], 255);
  assert.equal(expanded[bottomIdx + 3], 255);
});

test('interpolateVideoKeyframes smoothly interpolates intermediate frames', () => {
  const keyframes = [
    { frame: 0, x: 100, y: 100, radius: 20 },
    { frame: 10, x: 200, y: 300, radius: 40 },
  ];

  const mid = interpolateVideoKeyframes(keyframes, 5);
  assert.ok(mid !== null);
  assert.equal(mid.x, 150);
  assert.equal(mid.y, 200);
  assert.equal(mid.radius, 30);

  // Before first frame
  const before = interpolateVideoKeyframes(keyframes, -5);
  assert.equal(before?.x, 100);

  // After last frame
  const after = interpolateVideoKeyframes(keyframes, 20);
  assert.equal(after?.x, 200);
});

test('calculateMediaMetrics preserves aspect ratio', () => {
  const metrics = calculateMediaMetrics(3840, 2160, 1920);
  assert.equal(metrics.width, 1920);
  assert.equal(metrics.height, 1080);
  assert.equal(metrics.scale, 0.5);
  assert.ok(Math.abs(metrics.aspectRatio - 16 / 9) < 0.001);
});
