/* Growthline — fond "liquide" du hero (WebGL2 natif, sans Three.js/React).
   Porté depuis un composant de référence (LiquidBackground, react-three-fiber) :
   même shader (deux sinusoïdes croisées, mix de deux tons), même logique de
   lerp de la souris, mais en WebGL2 brut pour rester sur l'architecture
   statique du site — pas de build step, pas de dépendance React ajoutée.
   Couleurs converties en noir/blanc pur pour rester cohérent avec le thème
   monochrome du hero (le shader d'origine était déjà quasi-monochrome). */
(function () {
  "use strict";

  var canvas = document.getElementById("heroLiquidBg");
  if (!canvas) return;

  var gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) { canvas.style.background = "#020202"; return; }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;

  var vertexSrc =
    "#version 300 es\n" +
    "in vec2 position;\n" +
    "void main(){ gl_Position = vec4(position, 0.0, 1.0); }";

  var fragmentSrc =
    "#version 300 es\n" +
    "precision mediump float;\n" +
    "out vec4 fragColor;\n" +
    "uniform vec2 uResolution;\n" +
    "uniform float uTime;\n" +
    "uniform vec2 uMouse;\n" +
    "void main(){\n" +
    "  vec2 uv = gl_FragCoord.xy / uResolution.xy;\n" +
    "  float t = uTime * 0.15;\n" +
    "  vec2 m = uMouse * 0.1;\n" +
    "  float c = smoothstep(0.0, 1.0, (sin(uv.x * 8.0 + t + m.x * 12.0) + sin(uv.y * 6.0 - t + m.y * 12.0)) * 0.5 + 0.5);\n" +
    "  vec3 col = mix(vec3(0.008), vec3(0.10), c);\n" +
    "  fragColor = vec4(col, 1.0);\n" +
    "}";

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); }
    return s;
  }

  var program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(program)); return; }
  gl.useProgram(program);

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  var posLoc = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  var resLoc = gl.getUniformLocation(program, "uResolution");
  var timeLoc = gl.getUniformLocation(program, "uTime");
  var mouseLoc = gl.getUniformLocation(program, "uMouse");

  var dpr = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1));
  function resize() {
    dpr = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1));
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize);
  resize();

  var mouse = { x: 0, y: 0 };
  var mouseTarget = { x: 0, y: 0 };
  if (canHover) {
    window.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseTarget.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    });
  }

  var visible = true;
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible = entry.isIntersecting; });
    });
    io.observe(canvas);
  }

  var running = true;
  document.addEventListener("visibilitychange", function () { running = !document.hidden; });

  function render(now) {
    if (visible && running) {
      mouse.x += (mouseTarget.x - mouse.x) * 0.05;
      mouse.y += (mouseTarget.y - mouse.y) * 0.05;
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, now * 1e-3);
      gl.uniform2f(mouseLoc, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    if (!reduceMotion) requestAnimationFrame(render);
  }
  if (reduceMotion) {
    gl.uniform2f(resLoc, canvas.width, canvas.height);
    gl.uniform1f(timeLoc, 0);
    gl.uniform2f(mouseLoc, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  } else {
    requestAnimationFrame(render);
  }
})();
