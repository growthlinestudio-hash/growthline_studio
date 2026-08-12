/* =============================================================================
   Growthline — GridScan (hero uniquement)
   Porté en WebGL2 natif depuis le composant React "GridScan" (three.js +
   postprocessing) fourni par l'utilisateur : même logique de grille en
   perspective (raymarch simplifié) + faisceau de scan périodique, sans les
   dépendances React/three.js/face-api.js (le suivi webcam n'a pas été
   demandé et n'a pas sa place ici). Le survol de la souris pilote le skew/
   tilt/yaw de la grille avec le même lissage (smoothDamp) que l'original.
   Couleurs adaptées à la palette Growthline (violet/cyan) au lieu des tokens
   clairs du prompt d'origine (pensés pour une autre UI).
   ============================================================================= */
(function () {
  'use strict';

  var hero = document.querySelector('.hero');
  var canvas = document.getElementById('heroGridScan');
  if (!hero || !canvas) return;

  var gl = canvas.getContext('webgl2', { alpha: true, antialias: true });
  if (!gl) { return; } // le fond CSS statique (.hero::before) sert de repli

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

  var vertSrc =
    '#version 300 es\n' +
    'in vec2 position;\n' +
    'void main(){ gl_Position = vec4(position, 0.0, 1.0); }';

  var fragSrc =
    '#version 300 es\n' +
    'precision highp float;\n' +
    'out vec4 fragColor;\n' +
    'uniform vec3 iResolution;\n' +
    'uniform float iTime;\n' +
    'uniform vec2 uSkew;\n' +
    'uniform float uTilt;\n' +
    'uniform float uYaw;\n' +
    'uniform vec3 uLinesColor;\n' +
    'uniform vec3 uScanColor;\n' +
    'uniform float uGridScale;\n' +
    'uniform float uScanOpacity;\n' +
    'uniform float uScanDuration;\n' +
    'uniform float uScanDelay;\n' +
    'uniform float uNoise;\n' +
    '\n' +
    'float smoother01(float a, float b, float x){\n' +
    '  float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0);\n' +
    '  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\n' +
    '}\n' +
    '\n' +
    'void main(){\n' +
    '  vec2 fragCoord = gl_FragCoord.xy;\n' +
    '  vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;\n' +
    '\n' +
    '  vec3 ro = vec3(0.0);\n' +
    '  vec3 rd = normalize(vec3(p, 2.0));\n' +
    '\n' +
    '  float cR = cos(uTilt), sR = sin(uTilt);\n' +
    '  rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;\n' +
    '  float cY = cos(uYaw), sY = sin(uYaw);\n' +
    '  rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;\n' +
    '\n' +
    '  vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));\n' +
    '  rd.xy += skew * rd.z;\n' +
    '\n' +
    '  float minT = 1e20;\n' +
    '  float gridScale = max(1e-5, uGridScale);\n' +
    '  float fadeStrength = 2.0;\n' +
    '  vec2 gridUV = vec2(0.0);\n' +
    '  float hitIsY = 1.0;\n' +
    '\n' +
    '  for (int i = 0; i < 4; i++){\n' +
    '    float isY = float(i < 2);\n' +
    '    float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);\n' +
    '    float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);\n' +
    '    float den = isY * rd.y + (1.0 - isY) * rd.x;\n' +
    '    float t = num / den;\n' +
    '    vec3 h = ro + rd * t;\n' +
    '    float depthBoost = smoothstep(0.0, 3.0, h.z);\n' +
    '    h.xy += skew * 0.15 * depthBoost;\n' +
    '    bool use = t > 0.0 && t < minT;\n' +
    '    gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;\n' +
    '    minT = use ? t : minT;\n' +
    '    hitIsY = use ? isY : hitIsY;\n' +
    '  }\n' +
    '\n' +
    '  vec3 hit = ro + rd * minT;\n' +
    '  float dist = length(hit - ro);\n' +
    '\n' +
    '  float fx = fract(gridUV.x);\n' +
    '  float fy = fract(gridUV.y);\n' +
    '  float ax = min(fx, 1.0 - fx);\n' +
    '  float ay = min(fy, 1.0 - fy);\n' +
    '  float wx = fwidth(gridUV.x);\n' +
    '  float wy = fwidth(gridUV.y);\n' +
    '  float halfPx = 0.5;\n' +
    '  float tx = halfPx * wx;\n' +
    '  float ty = halfPx * wy;\n' +
    '  float lineX = 1.0 - smoothstep(tx, tx + wx, ax);\n' +
    '  float lineY = 1.0 - smoothstep(ty, ty + wy, ay);\n' +
    '  float lineMask = max(lineX, lineY);\n' +
    '\n' +
    '  float fade = exp(-dist * fadeStrength);\n' +
    '\n' +
    '  float dur = max(0.05, uScanDuration);\n' +
    '  float del = max(0.0, uScanDelay);\n' +
    '  float scanZMax = 2.0;\n' +
    '  float sigma = 0.36;\n' +
    '  float sigmaA = sigma * 2.0;\n' +
    '\n' +
    '  float cycle = dur + del;\n' +
    '  float tCycle = mod(iTime, cycle);\n' +
    '  float phase = clamp((tCycle - del) / dur, 0.0, 1.0);\n' +
    '  float scanZ = phase * scanZMax;\n' +
    '  float dz = abs(hit.z - scanZ);\n' +
    '  float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));\n' +
    '  float taper = 0.35;\n' +
    '  float headFade = smoother01(0.0, taper, phase);\n' +
    '  float tailFade = 1.0 - smoother01(1.0 - taper, 1.0, phase);\n' +
    '  float phaseWindow = headFade * tailFade;\n' +
    '  float pulse = lineBand * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);\n' +
    '  float auraBand = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA));\n' +
    '  float aura = (auraBand * 0.3) * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);\n' +
    '\n' +
    '  vec3 gridCol = uLinesColor * lineMask * fade;\n' +
    '  vec3 scanCol = uScanColor * pulse;\n' +
    '  vec3 scanAura = uScanColor * aura;\n' +
    '  vec3 color = gridCol + scanCol + scanAura;\n' +
    '\n' +
    '  float n = fract(sin(dot(fragCoord + vec2(iTime * 123.4), vec2(12.9898, 78.233))) * 43758.5453123);\n' +
    '  color += (n - 0.5) * uNoise;\n' +
    '  color = clamp(color, 0.0, 1.0);\n' +
    '\n' +
    '  float alpha = clamp(max(lineMask * fade, pulse + aura), 0.0, 1.0);\n' +
    '  fragColor = vec4(color, alpha);\n' +
    '}';

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('GridScan shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, vertSrc);
  var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return;

  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('GridScan program link error:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  var posLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  var uniforms = {};
  ['iResolution', 'iTime', 'uSkew', 'uTilt', 'uYaw', 'uLinesColor', 'uScanColor',
    'uGridScale', 'uScanOpacity', 'uScanDuration', 'uScanDelay', 'uNoise'
  ].forEach(function (name) { uniforms[name] = gl.getUniformLocation(program, name); });

  // Palette Growthline : lignes magenta sourdes, faisceau de scan magenta-clair lumineux.
  function srgbToLinear(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function hexToLinear(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255;
    var g = parseInt(hex.slice(3, 5), 16) / 255;
    var b = parseInt(hex.slice(5, 7), 16) / 255;
    return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  }
  var LINES_COLOR = hexToLinear('#F2B8DA');
  var SCAN_COLOR = hexToLinear('#FF2D9E');

  gl.uniform3f(uniforms.uLinesColor, LINES_COLOR[0], LINES_COLOR[1], LINES_COLOR[2]);
  gl.uniform3f(uniforms.uScanColor, SCAN_COLOR[0], SCAN_COLOR[1], SCAN_COLOR[2]);
  gl.uniform1f(uniforms.uGridScale, 0.16);
  gl.uniform1f(uniforms.uScanOpacity, 0.5);
  gl.uniform1f(uniforms.uScanDuration, 2.2);
  gl.uniform1f(uniforms.uScanDelay, 2.6);
  gl.uniform1f(uniforms.uNoise, 0.012);

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = hero.clientWidth, h = hero.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform3f(uniforms.iResolution, canvas.width, canvas.height, dpr);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // ---------- Souris → skew/tilt/yaw, avec un lissage type smoothDamp ----------
  var lookTarget = { x: 0, y: 0 };
  var lookCurrent = { x: 0, y: 0 };
  var lookVel = { x: 0, y: 0 };
  var smoothTime = 0.28;
  var skewScale = 0.14;
  var tiltScale = 0.2;

  function smoothDamp(current, target, vel, dt) {
    var omega = 2 / smoothTime;
    var x = omega * dt;
    var exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    var changeX = current.x - target.x;
    var changeY = current.y - target.y;
    var tempX = (vel.x + omega * changeX) * dt;
    var tempY = (vel.y + omega * changeY) * dt;
    vel.x = (vel.x - omega * tempX) * exp;
    vel.y = (vel.y - omega * tempY) * exp;
    return {
      x: target.x + (changeX + tempX) * exp,
      y: target.y + (changeY + tempY) * exp
    };
  }

  if (canHover) {
    var leaveTimer = null;
    hero.addEventListener('mousemove', function (e) {
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
      var rect = hero.getBoundingClientRect();
      var nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      var ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      lookTarget.x = nx; lookTarget.y = ny;
    }, { passive: true });
    hero.addEventListener('mouseleave', function () {
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(function () { lookTarget.x = 0; lookTarget.y = 0; }, 250);
    }, { passive: true });
  }

  // ---------- Boucle de rendu ----------
  var start = performance.now();
  var last = start;
  var raf = 0;
  var visible = true;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    var dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
    last = now;

    if (!reduceMotion) {
      lookCurrent = smoothDamp(lookCurrent, lookTarget, lookVel, dt);
    }

    var skewX = lookCurrent.x * skewScale;
    var skewY = -lookCurrent.y * skewScale;
    gl.uniform2f(uniforms.uSkew, skewX, skewY);
    gl.uniform1f(uniforms.uTilt, lookCurrent.y * tiltScale);
    gl.uniform1f(uniforms.uYaw, Math.max(-0.5, Math.min(0.5, lookCurrent.x * tiltScale)));
    gl.uniform1f(uniforms.iTime, reduceMotion ? 0 : (now - start) / 1000);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  var io = new IntersectionObserver(function (entries) {
    visible = entries[0] ? entries[0].isIntersecting : true;
  });
  io.observe(hero);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') visible = false;
    else if (io.takeRecords) visible = true;
  });

  raf = requestAnimationFrame(frame);
})();
