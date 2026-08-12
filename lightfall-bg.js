/* Growthline — "Lightfall" (pluie de lumière animée), porté en WebGL1 vanilla depuis
   le composant React fourni (Lightfall.jsx, qui s'appuyait sur la lib "ogl" pour la
   plomberie WebGL uniquement — toute la logique visuelle vient du shader GLSL,
   repris ici à l'identique). Cible <canvas data-lightfall>. */
(function(){
  "use strict";
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvases = document.querySelectorAll('canvas[data-lightfall]');
  if(!canvases.length) return;

  var MAX_COLORS = 8;

  function hexToRGB(hex){
    var c = hex.replace('#', '');
    while(c.length < 6) c += '0';
    return [
      parseInt(c.slice(0, 2), 16) / 255,
      parseInt(c.slice(2, 4), 16) / 255,
      parseInt(c.slice(4, 6), 16) / 255
    ];
  }

  function prepColors(input){
    var base = (input && input.length ? input : ['#A6C8FF', '#5227FF', '#FF9FFC']).slice(0, MAX_COLORS);
    var count = base.length;
    var arr = [];
    for(var i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]));
    var avg = [0, 0, 0];
    for(i = 0; i < count; i++){ avg[0] += arr[i][0]; avg[1] += arr[i][1]; avg[2] += arr[i][2]; }
    avg[0] /= count; avg[1] /= count; avg[2] /= count;
    return { arr: arr, count: count, avg: avg };
  }

  var VERT = "attribute vec2 position;\n" +
    "attribute vec2 uv;\n" +
    "varying vec2 vUv;\n" +
    "void main() {\n" +
    "  vUv = uv;\n" +
    "  gl_Position = vec4(position, 0.0, 1.0);\n" +
    "}";

  var FRAG = "precision highp float;\n" +
    "uniform vec3  iResolution;\n" +
    "uniform vec2  iMouse;\n" +
    "uniform float iTime;\n" +
    "uniform vec3  uColor0;\n" +
    "uniform vec3  uColor1;\n" +
    "uniform vec3  uColor2;\n" +
    "uniform vec3  uColor3;\n" +
    "uniform vec3  uColor4;\n" +
    "uniform vec3  uColor5;\n" +
    "uniform vec3  uColor6;\n" +
    "uniform vec3  uColor7;\n" +
    "uniform int   uColorCount;\n" +
    "uniform vec3  uBgColor;\n" +
    "uniform vec3  uMouseColor;\n" +
    "uniform float uSpeed;\n" +
    "uniform int   uStreakCount;\n" +
    "uniform float uStreakWidth;\n" +
    "uniform float uStreakLength;\n" +
    "uniform float uGlow;\n" +
    "uniform float uDensity;\n" +
    "uniform float uTwinkle;\n" +
    "uniform float uZoom;\n" +
    "uniform float uBgGlow;\n" +
    "uniform float uOpacity;\n" +
    "uniform float uMouseEnabled;\n" +
    "uniform float uMouseStrength;\n" +
    "uniform float uMouseRadius;\n" +
    "varying vec2 vUv;\n" +
    "vec3 palette(float h) {\n" +
    "  int count = uColorCount;\n" +
    "  if (count < 1) count = 1;\n" +
    "  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));\n" +
    "  if (idx <= 0) return uColor0;\n" +
    "  if (idx == 1) return uColor1;\n" +
    "  if (idx == 2) return uColor2;\n" +
    "  if (idx == 3) return uColor3;\n" +
    "  if (idx == 4) return uColor4;\n" +
    "  if (idx == 5) return uColor5;\n" +
    "  if (idx == 6) return uColor6;\n" +
    "  return uColor7;\n" +
    "}\n" +
    "vec3 tanhv(vec3 x) {\n" +
    "  vec3 e = exp(-2.0 * x);\n" +
    "  return (1.0 - e) / (1.0 + e);\n" +
    "}\n" +
    "vec2 sceneC(vec2 frag, vec2 r) {\n" +
    "  vec2 P = (frag + frag - r) / r.x;\n" +
    "  float z = 0.0;\n" +
    "  float d = 1e3;\n" +
    "  vec4 O = vec4(0.0);\n" +
    "  for (int k = 0; k < 39; k++) {\n" +
    "    if (d <= 1e-4) break;\n" +
    "    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;\n" +
    "    d = 1.0 - sqrt(length(O * O));\n" +
    "    z += d;\n" +
    "  }\n" +
    "  return vec2(O.x, atan(O.z, O.y));\n" +
    "}\n" +
    "void mainImage(out vec4 o, vec2 C) {\n" +
    "  vec2 r = iResolution.xy;\n" +
    "  vec2 uv0 = (C + C - r) / r.x;\n" +
    "  float T = 0.1 * iTime * uSpeed + 9.0;\n" +
    "  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));\n" +
    "  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);\n" +
    "  vec2 c0 = sceneC(C, r);\n" +
    "  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);\n" +
    "  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);\n" +
    "  vec2 dCx = cdx - c0;\n" +
    "  vec2 dCy = cdy - c0;\n" +
    "  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);\n" +
    "  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);\n" +
    "  vec2 fw = abs(dCx) + abs(dCy);\n" +
    "  C = c0;\n" +
    "  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);\n" +
    "  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);\n" +
    "  float mGlow = 0.0;\n" +
    "  if (uMouseEnabled > 0.5) {\n" +
    "    vec2 mN = (iMouse + iMouse - r) / r.x;\n" +
    "    float md = length(uv0 - mN);\n" +
    "    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;\n" +
    "    O.rgb += uMouseColor * mGlow * 0.25;\n" +
    "  }\n" +
    "  float zr = 5e-4 * uStreakWidth;\n" +
    "  vec2 rr = vec2(max(length(fw), 1e-5));\n" +
    "  float tail = 19.0 / max(uStreakLength, 0.05);\n" +
    "  for (int m = 0; m < 16; m++) {\n" +
    "    if (m >= uStreakCount) break;\n" +
    "    float jf = float(m) + 1.0;\n" +
    "    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));\n" +
    "    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);\n" +
    "    Pp -= floor(Pp / Y + 0.5) * Y;\n" +
    "    float h = fract(8663.0 * ic);\n" +
    "    vec3 col = palette(h);\n" +
    "    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);\n" +
    "    weight *= (1.0 + mGlow * 2.0);\n" +
    "    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;\n" +
    "    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);\n" +
    "    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;\n" +
    "    C.x += Y.x / 8.0;\n" +
    "  }\n" +
    "  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));\n" +
    "  o = vec4(colr, uOpacity);\n" +
    "}\n" +
    "void main() {\n" +
    "  vec4 color;\n" +
    "  mainImage(color, vUv * iResolution.xy);\n" +
    "  gl_FragColor = color;\n" +
    "}";

  var CONFIG = {
    colors: ['#C7C2E8', '#6254E7', '#5B8DEF'],
    backgroundColor: '#241A5E',
    speed: 0.5,
    streakCount: 3,
    streakWidth: 1,
    streakLength: 1,
    glow: 1,
    density: 0.6,
    twinkle: 1,
    zoom: 3,
    backgroundGlow: 0.6,
    opacity: 1,
    mouseInteraction: true,
    mouseStrength: 0.5,
    mouseRadius: 1,
    mouseDampening: 0.15
  };

  canvases.forEach(function(canvas){
    var gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if(!gl){ return; }

    function compile(type, src){
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(s)); }
      return s;
    }
    var program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){ console.error(gl.getProgramInfoLog(program)); return; }
    gl.useProgram(program);

    var posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    var uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 2, 0, 0, 2]), gl.STATIC_DRAW);
    var uvLoc = gl.getAttribLocation(program, 'uv');
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

    var prepped = prepColors(CONFIG.colors);
    var bgRGB = hexToRGB(CONFIG.backgroundColor);

    var U = {};
    ['uColor0','uColor1','uColor2','uColor3','uColor4','uColor5','uColor6','uColor7'].forEach(function(name){
      U[name] = gl.getUniformLocation(program, name);
    });
    U.uColorCount = gl.getUniformLocation(program, 'uColorCount');
    U.uBgColor = gl.getUniformLocation(program, 'uBgColor');
    U.uMouseColor = gl.getUniformLocation(program, 'uMouseColor');
    U.uSpeed = gl.getUniformLocation(program, 'uSpeed');
    U.uStreakCount = gl.getUniformLocation(program, 'uStreakCount');
    U.uStreakWidth = gl.getUniformLocation(program, 'uStreakWidth');
    U.uStreakLength = gl.getUniformLocation(program, 'uStreakLength');
    U.uGlow = gl.getUniformLocation(program, 'uGlow');
    U.uDensity = gl.getUniformLocation(program, 'uDensity');
    U.uTwinkle = gl.getUniformLocation(program, 'uTwinkle');
    U.uZoom = gl.getUniformLocation(program, 'uZoom');
    U.uBgGlow = gl.getUniformLocation(program, 'uBgGlow');
    U.uOpacity = gl.getUniformLocation(program, 'uOpacity');
    U.uMouseEnabled = gl.getUniformLocation(program, 'uMouseEnabled');
    U.uMouseStrength = gl.getUniformLocation(program, 'uMouseStrength');
    U.uMouseRadius = gl.getUniformLocation(program, 'uMouseRadius');
    U.iResolution = gl.getUniformLocation(program, 'iResolution');
    U.iMouse = gl.getUniformLocation(program, 'iMouse');
    U.iTime = gl.getUniformLocation(program, 'iTime');

    for(var i = 0; i < MAX_COLORS; i++) gl.uniform3fv(U['uColor' + i], prepped.arr[i]);
    gl.uniform1i(U.uColorCount, prepped.count);
    gl.uniform3fv(U.uBgColor, bgRGB);
    gl.uniform3fv(U.uMouseColor, prepped.avg);
    gl.uniform1f(U.uSpeed, CONFIG.speed);
    gl.uniform1i(U.uStreakCount, Math.max(1, Math.min(16, Math.round(CONFIG.streakCount))));
    gl.uniform1f(U.uStreakWidth, CONFIG.streakWidth);
    gl.uniform1f(U.uStreakLength, CONFIG.streakLength);
    gl.uniform1f(U.uGlow, CONFIG.glow);
    gl.uniform1f(U.uDensity, CONFIG.density);
    gl.uniform1f(U.uTwinkle, CONFIG.twinkle);
    gl.uniform1f(U.uZoom, CONFIG.zoom);
    gl.uniform1f(U.uBgGlow, CONFIG.backgroundGlow);
    gl.uniform1f(U.uOpacity, CONFIG.opacity);
    gl.uniform1f(U.uMouseEnabled, CONFIG.mouseInteraction ? 1 : 0);
    gl.uniform1f(U.uMouseStrength, CONFIG.mouseStrength);
    gl.uniform1f(U.uMouseRadius, CONFIG.mouseRadius);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mouseTarget = [0, 0];
    var mouseCur = [0, 0];

    function resize(){
      var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if(canvas.width !== w || canvas.height !== h){
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform3f(U.iResolution, canvas.width, canvas.height, 1);
    }
    resize();
    var ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function onPointerMove(e){
      var rect = canvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * dpr;
      var y = (rect.height - (e.clientY - rect.top)) * dpr;
      mouseTarget = [x, y];
      if(CONFIG.mouseDampening <= 0){ mouseCur = [x, y]; }
    }
    if(CONFIG.mouseInteraction){ canvas.addEventListener('pointermove', onPointerMove); }

    var raf = 0, running = false, lastT = 0, inView = true;
    var visible = document.visibilityState === 'visible';

    function frame(t){
      raf = 0;
      if(!running) return;
      var iTime = t * 0.001;
      if(CONFIG.mouseDampening > 0){
        if(!lastT) lastT = t;
        var dt = (t - lastT) / 1000;
        lastT = t;
        var tau = Math.max(1e-4, CONFIG.mouseDampening);
        var factor = Math.min(1, 1 - Math.exp(-dt / tau));
        mouseCur[0] += (mouseTarget[0] - mouseCur[0]) * factor;
        mouseCur[1] += (mouseTarget[1] - mouseCur[1]) * factor;
      } else {
        lastT = t;
      }
      gl.uniform1f(U.iTime, iTime);
      gl.uniform2f(U.iMouse, mouseCur[0], mouseCur[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }
    function play(){ if(running) return; running = true; raf = requestAnimationFrame(frame); }
    function pause(){ running = false; if(raf) cancelAnimationFrame(raf); raf = 0; }

    if(reduced){
      gl.uniform1f(U.iTime, 0);
      gl.uniform2f(U.iMouse, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return;
    }

    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          inView = entry.isIntersecting;
          if(inView && visible) play(); else pause();
        });
      }, { threshold: 0.01 });
      io.observe(canvas);
    } else {
      play();
    }
    document.addEventListener('visibilitychange', function(){
      visible = document.visibilityState === 'visible';
      if(visible && inView) play(); else pause();
    });
  });
})();
