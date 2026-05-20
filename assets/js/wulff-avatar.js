(function () {
  "use strict";

  const canvases = document.querySelectorAll("[data-wulff-avatar]");
  if (!canvases.length) return;

  const COLS = 96;
  const ROWS = 56;
  const CAMERA_DISTANCE = 6;
  const UNIT = 1;
  const MODEL_RADIUS = Math.sqrt(6) * UNIT;
  const PROJECTED_RADIUS_FRACTION = 0.68;
  const FACE_DIVISIONS = 48;
  const SHADES = ".,-~:;=!*#$@";
  const LIGHT = normalize({ x: -0.42, y: -0.69, z: -0.63 });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function point(x, y, z) {
    return { x, y, z };
  }

  function add(a, b) {
    return point(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  function subtract(a, b) {
    return point(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  function cross(a, b) {
    return point(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
  }

  function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  function normalize(p) {
    const length = Math.hypot(p.x, p.y, p.z) || 1;
    return point(p.x / length, p.y / length, p.z / length);
  }

  function outwardNormal(vertices) {
    let normal = cross(subtract(vertices[1], vertices[0]), subtract(vertices[2], vertices[0]));
    const center = vertices.reduce(add, point(0, 0, 0));
    if (dot(normal, center) < 0) {
      normal = point(-normal.x, -normal.y, -normal.z);
    }
    return normalize(normal);
  }

  function rotate(p, ax, ay, az) {
    const sx = Math.sin(ax);
    const cx = Math.cos(ax);
    const sy = Math.sin(ay);
    const cy = Math.cos(ay);
    const sz = Math.sin(az);
    const cz = Math.cos(az);

    const y1 = p.y * cx - p.z * sx;
    const z1 = p.y * sx + p.z * cx;
    const x2 = p.x * cy + z1 * sy;
    const z2 = -p.x * sy + z1 * cy;

    return point(x2 * cz - y1 * sz, x2 * sz + y1 * cz, z2);
  }

  function shadeForNormal(normal) {
    const value = Math.max(-1, Math.min(1, dot(normal, LIGHT)));
    return Math.max(0, Math.min(SHADES.length - 1, Math.round(((value + 1) * (SHADES.length - 1)) / 2)));
  }

  function interpolate(a, b, c, u, v) {
    const w = FACE_DIVISIONS - u - v;
    return point(
      (a.x * w + b.x * u + c.x * v) / FACE_DIVISIONS,
      (a.y * w + b.y * u + c.y * v) / FACE_DIVISIONS,
      (a.z * w + b.z * u + c.z * v) / FACE_DIVISIONS
    );
  }

  function project(p, metrics) {
    const denominator = CAMERA_DISTANCE + p.z;
    if (denominator <= 1) return null;

    const projectedX = metrics.width * 0.5 + (p.x * metrics.focal) / denominator;
    const projectedY = metrics.height * 0.5 + (p.y * metrics.focal) / denominator;

    return {
      x: Math.floor(projectedX / metrics.cellWidth),
      y: Math.floor(projectedY / metrics.cellHeight),
      depth: denominator,
    };
  }

  function squareVertex(axis, side, u, v) {
    const fixed = side * 2 * UNIT;
    if (axis === 0) return point(fixed, u, v);
    if (axis === 1) return point(u, fixed, v);
    return point(u, v, fixed);
  }

  function buildFaces() {
    const faces = [];
    const squareCycle = [
      [0, UNIT],
      [UNIT, 0],
      [0, -UNIT],
      [-UNIT, 0],
    ];

    for (let axis = 0; axis < 3; axis += 1) {
      for (const side of [-1, 1]) {
        faces.push(squareCycle.map(([u, v]) => squareVertex(axis, side, u, v)));
      }
    }

    const hexBase = [
      [0, UNIT, 2 * UNIT],
      [UNIT, 0, 2 * UNIT],
      [2 * UNIT, 0, UNIT],
      [2 * UNIT, UNIT, 0],
      [UNIT, 2 * UNIT, 0],
      [0, 2 * UNIT, UNIT],
    ];

    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          faces.push(hexBase.map(([x, y, z]) => point(sx * x, sy * y, sz * z)));
        }
      }
    }

    return faces.map((vertices) => ({ vertices, normal: outwardNormal(vertices) }));
  }

  const faces = buildFaces();

  function putPixel(chars, shades, depth, x, y, z, shade) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
    const offset = x + COLS * y;
    if (z <= depth[offset]) {
      depth[offset] = z;
      chars[offset] = SHADES[shade];
      shades[offset] = shade;
    }
  }

  function drawTriangle(chars, shades, depth, face, a, b, c, ax, ay, az, metrics) {
    const shade = shadeForNormal(rotate(face.normal, ax, ay, az));

    for (let u = 0; u <= FACE_DIVISIONS; u += 1) {
      for (let v = 0; v <= FACE_DIVISIONS - u; v += 1) {
        const projected = project(rotate(interpolate(a, b, c, u, v), ax, ay, az), metrics);
        if (projected) {
          putPixel(chars, shades, depth, projected.x, projected.y, projected.depth, shade);
        }
      }
    }
  }

  function renderGrid(ax, ay, az, metrics) {
    const chars = new Array(COLS * ROWS).fill(" ");
    const shadeValues = new Array(COLS * ROWS).fill(0);
    const depth = new Array(COLS * ROWS).fill(Number.POSITIVE_INFINITY);

    for (const face of faces) {
      for (let i = 1; i + 1 < face.vertices.length; i += 1) {
        drawTriangle(chars, shadeValues, depth, face, face.vertices[0], face.vertices[i], face.vertices[i + 1], ax, ay, az, metrics);
      }
    }

    return { chars, shadeValues };
  }

  function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.dataset.wulffDpr = String(dpr);
    }

    return { width, height, dpr };
  }

  function drawCanvas(canvas, state) {
    const { width, height, dpr } = resizeCanvas(canvas);
    const ctx = canvas.getContext("2d");
    const rootStyles = getComputedStyle(document.documentElement);
    const textColor =
      rootStyles.getPropertyValue("--wulff-avatar-color").trim() || rootStyles.getPropertyValue("--global-text-color").trim() || "#222";
    const bgColor =
      rootStyles.getPropertyValue("--wulff-avatar-bg").trim() || rootStyles.getPropertyValue("--global-card-bg-color").trim() || "transparent";
    const cellWidth = width / COLS;
    const cellHeight = height / ROWS;
    const metrics = {
      width,
      height,
      cellWidth,
      cellHeight,
      focal: ((Math.min(width, height) * PROJECTED_RADIUS_FRACTION) / MODEL_RADIUS) * (CAMERA_DISTANCE - MODEL_RADIUS),
    };
    const { chars, shadeValues } = renderGrid(state.ax, state.ay, state.az, metrics);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${Math.max(4, Math.min(cellHeight * 0.9, cellWidth * 1.45))}px "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = textColor;

    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        const offset = x + COLS * y;
        const char = chars[offset];
        if (char === " ") continue;

        ctx.globalAlpha = 0.22 + (shadeValues[offset] / (SHADES.length - 1)) * 0.78;
        ctx.fillText(char, x * cellWidth + cellWidth * 0.5, y * cellHeight + cellHeight * 0.52);
      }
    }

    ctx.globalAlpha = 1;
  }

  function startAvatar(canvas) {
    const state = {
      ax: 0.42,
      ay: 0.33,
      az: 0,
      visible: true,
      frame: 0,
      lastTime: 0,
      lastDraw: 0,
    };

    function shouldAnimate() {
      return state.visible && !document.hidden && !reducedMotion.matches;
    }

    function tick(time) {
      if (!shouldAnimate()) {
        state.frame = 0;
        drawCanvas(canvas, state);
        return;
      }

      if (!state.lastTime) state.lastTime = time;
      const delta = Math.min(0.05, (time - state.lastTime) / 1000);
      state.lastTime = time;
      state.ax += delta * 0.38;
      state.ay += delta * 0.52;
      state.az += delta * 0.31;

      if (time - state.lastDraw > 32) {
        drawCanvas(canvas, state);
        state.lastDraw = time;
      }

      state.frame = window.requestAnimationFrame(tick);
    }

    function refreshAnimation() {
      if (state.frame) {
        window.cancelAnimationFrame(state.frame);
        state.frame = 0;
      }
      state.lastTime = 0;
      state.frame = window.requestAnimationFrame(tick);
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        state.visible = entries.some((entry) => entry.isIntersecting);
        refreshAnimation();
      });

      observer.observe(canvas);
    }

    window.addEventListener("resize", refreshAnimation);
    document.addEventListener("visibilitychange", refreshAnimation);
    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", refreshAnimation);
    } else if (typeof reducedMotion.addListener === "function") {
      reducedMotion.addListener(refreshAnimation);
    }
    refreshAnimation();
  }

  canvases.forEach(startAvatar);
})();
