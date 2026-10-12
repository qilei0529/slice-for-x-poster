export type CircularTransitionOrigin = {
  x: number;
  y: number;
};

export type CircularTransitionOptions = {
  origin: CircularTransitionOrigin;
  onUpdate: () => void;
  duration?: number;
};

export type CircularTransitionConfig = {
  duration: number;
  startRadius: number;
  endPadding: number;
  pointCount: number;
  waveCount: number;
  waveAmplitude: number;
  jitterAmplitude: number;
};

export const defaultCircularTransitionConfig: CircularTransitionConfig = {
  duration: 1000,
  startRadius: 8,
  endPadding: 24,
  pointCount: 24,
  waveCount: 6,
  waveAmplitude: 0.1,
  jitterAmplitude: 0.05,
};

const TRANSITION_DURATION = "--theme-transition-duration";
const TRANSITION_START_SHAPE = "--theme-transition-start-shape";
const TRANSITION_END_SHAPE = "--theme-transition-end-shape";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function roundCoordinate(value: number) {
  return Math.round(value * 100) / 100;
}

type Point = {
  x: number;
  y: number;
};

function getWaveProfile(config: CircularTransitionConfig) {
  const phase = Math.random() * Math.PI * 2;
  const twist = Math.random() * Math.PI * 2;
  const profile: number[] = [];

  for (let index = 0; index < config.pointCount; index += 1) {
    const angle = (Math.PI * 2 * index) / config.pointCount;
    const wave = Math.sin(angle * config.waveCount + phase) * config.waveAmplitude;
    const secondaryWave =
      Math.sin(angle * (config.waveCount * 0.5) + twist) * (config.waveAmplitude * 0.35);
    const jitter = (Math.random() * 2 - 1) * config.jitterAmplitude;
    profile.push(Math.max(0.72, 1 + wave + secondaryWave + jitter));
  }

  return profile;
}

function getPathPoints(
  origin: CircularTransitionOrigin,
  radius: number,
  radiusProfile: readonly number[],
) {
  const angleOffset = -Math.PI / 2;
  const step = (Math.PI * 2) / radiusProfile.length;

  return radiusProfile.map((multiplier, index) => {
    const angle = angleOffset + step * index;
    const pointRadius = radius * multiplier;
    const x = roundCoordinate(origin.x + Math.cos(angle) * pointRadius);
    const y = roundCoordinate(origin.y + Math.sin(angle) * pointRadius);
    return { x, y };
  });
}

function getMidpoint(pointA: Point, pointB: Point) {
  return {
    x: roundCoordinate((pointA.x + pointB.x) / 2),
    y: roundCoordinate((pointA.y + pointB.y) / 2),
  };
}

type ViewportSize = {
  width: number;
  height: number;
};

function getTransitionViewport(): ViewportSize {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function supportsShapeClipPath() {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("clip-path", "shape(from 0% 0%, close)")
  );
}

function toPercent(value: number, size: number) {
  return `${roundCoordinate((value / size) * 100)}%`;
}

function formatPair(point: Point, viewport: ViewportSize) {
  return `${toPercent(point.x, viewport.width)} ${toPercent(point.y, viewport.height)}`;
}

function pathFromPoints(points: readonly Point[]) {
  const firstMidpoint = getMidpoint(points[points.length - 1], points[0]);
  const commands = [`M ${firstMidpoint.x} ${firstMidpoint.y}`];

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const nextPoint = points[(index + 1) % points.length];
    const midpoint = getMidpoint(point, nextPoint);

    commands.push(`Q ${point.x} ${point.y} ${midpoint.x} ${midpoint.y}`);
  }

  commands.push("Z");
  return `path("${commands.join(" ")}")`;
}

function shapeFromPoints(points: readonly Point[], viewport: ViewportSize) {
  const firstMidpoint = getMidpoint(points[points.length - 1], points[0]);
  const commands = [`from ${formatPair(firstMidpoint, viewport)}`];

  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const nextPoint = points[(index + 1) % points.length];
    const midpoint = getMidpoint(point, nextPoint);

    commands.push(
      `curve to ${formatPair(midpoint, viewport)} with ${formatPair(point, viewport)} from origin`,
    );
  }

  commands.push("close");
  return `shape(${commands.join(", ")})`;
}

function shapeFromRadius(
  origin: CircularTransitionOrigin,
  radius: number,
  radiusProfile: readonly number[],
  viewport: ViewportSize,
) {
  const vertices = getPathPoints(origin, radius, radiusProfile);

  if (supportsShapeClipPath()) {
    return shapeFromPoints(vertices, viewport);
  }

  return pathFromPoints(vertices);
}

function getRevealRadius(
  origin: CircularTransitionOrigin,
  endPadding: number,
  radiusProfile: readonly number[],
  viewport: { width: number; height: number },
) {
  const maxDistance = Math.hypot(
    Math.max(origin.x, viewport.width - origin.x),
    Math.max(origin.y, viewport.height - origin.y),
  );
  const minMultiplier = Math.min(...radiusProfile);

  return (maxDistance + endPadding) / minMultiplier;
}

function setTransitionVariables(
  origin: CircularTransitionOrigin,
  config: CircularTransitionConfig,
  duration: number,
) {
  const viewport = getTransitionViewport();
  const radiusProfile = getWaveProfile(config);
  const startShape = shapeFromRadius(
    origin,
    config.startRadius,
    radiusProfile,
    viewport,
  );
  const endShape = shapeFromRadius(
    origin,
    getRevealRadius(origin, config.endPadding, radiusProfile, viewport),
    radiusProfile,
    viewport,
  );
  const root = document.documentElement;
  root.style.setProperty(TRANSITION_DURATION, `${duration}ms`);
  root.style.setProperty(TRANSITION_START_SHAPE, startShape);
  root.style.setProperty(TRANSITION_END_SHAPE, endShape);
}

function clearTransitionVariables() {
  const root = document.documentElement;
  root.style.removeProperty(TRANSITION_DURATION);
  root.style.removeProperty(TRANSITION_START_SHAPE);
  root.style.removeProperty(TRANSITION_END_SHAPE);
}

export function circularTransition(
  options: CircularTransitionOptions,
  config: CircularTransitionConfig = defaultCircularTransitionConfig,
): Promise<void> {
  const { origin, onUpdate } = options;
  const duration = options.duration ?? config.duration;

  if (typeof window === "undefined" || prefersReducedMotion()) {
    onUpdate();
    return Promise.resolve();
  }

  if (!document.startViewTransition) {
    onUpdate();
    return Promise.resolve();
  }

  setTransitionVariables(origin, config, duration);

  const transition = document.startViewTransition(() => {
    onUpdate();
  });

  return transition.finished
    .catch(() => undefined)
    .finally(clearTransitionVariables);
}

export function getTransitionOrigin(
  event?: Pick<MouseEvent, "clientX" | "clientY"> | null,
): CircularTransitionOrigin {
  if (event) {
    return { x: event.clientX, y: event.clientY };
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}
