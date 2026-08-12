/* Growthline — vrai fond "Plasma" en WebGL2 (léger : résolution interne réduite,
   se met en pause hors écran via IntersectionObserver, comme hero-gridscan.js).
   Cible tout <canvas data-plasma>. */
(function(){
  "use strict";
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvases = document.querySelectorAll('canvas[data-plasma]');
  if(!canvases.length) return;

  var vertexSrc = '#version 300 es\n' +
    'precision highp float;\n' +
    'in vec4 position;\n' +
    'void main(){ gl_Position = position; }';

  var fragmentSrc = '#version 300 es\n' +
    'precision mediump float;\n' +
    'out vec4 O;\n' +
    'uniform vec2 resolution;\n' +
    'uniform float time;\n' +
    'void main(){\n' +
    '  vec2 uv = gl_FragCoord.xy / resolution.xy;\n' +
    '  vec2 p = (uv - 0.5) * 2.0;\n' +
    '  p.x *= resolution.x / max(resolution.y, 1.0);\n' +
    '  float t = time * 0.22;\n' +
    '  float v = 0.0;\n' +
    '  v += sin(p.x * 2.6 + t);\n' +
    '  v += sin(p.y * 3.4 + t * 1.3);\n' +
    '  v += sin((p.x + p.y) * 3.0 + t * 0.8);\n' +
    '  v += sin(sqrt(p.x*p.x + p.y*p.y + 1.0) * 4.2 - t * 1.15);\n' +
    '  v *= 0.25;\n' +
    '  vec3 lightA = vec3(0.914, 0.918, 0.929);\n' +
    '  vec3 lightB = vec3(0.957, 0.961, 0.965);\n' +
    '  vec3 violet = vec3(0.46, 0.33, 0.91);\n' +
    '  vec3 blue = vec3(0.22, 0.42, 0.79);\n' +
    '  vec3 base = mix(lightA, lightB, uv.y);\n' +
    '  vec3 glow = mix(violet, blue, uv.x * 0.7 + uv.y * 0.3);\n' +
    '  float glowAmt = smoothstep(-0.1, 0.95, v);\n' +
    '  vec3 col = mix(base, glow, glowAmt * 0.16);\n' +
    '  O = vec4(col, 1.0);\n' +
    '}';

  canvases.forEach(function(canvas){
    var gl = canvas.getContext('webgl2', {antialias:false, alpha:false, powerPreference:'low-power'});
    if(!gl){ return; }

    function compile(type, src){
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(s)); }
      return s;
    }
    var program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){ console.error(gl.getProgramInfoLog(program)); return; }
    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1, -1,-1, 1,1, 1,-1]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    var resLoc = gl.getUniformLocation(program, 'resolution');
    var timeLoc = gl.getUniformLocation(program, 'time');

    var SCALE = 0.55; /* résolution interne réduite : reste net une fois flouté en CSS, coûte bien moins cher */
    var raf = null, running = false, start = null;

    function resize(){
      var w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      var h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
      if(canvas.width !== w || canvas.height !== h){
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function drawFrame(tMs){
      if(start === null) start = tMs;
      resize();
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, (tMs - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function loop(t){
      drawFrame(t);
      if(running) raf = requestAnimationFrame(loop);
    }
    function play(){
      if(running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function pause(){
      running = false;
      if(raf) cancelAnimationFrame(raf);
      raf = null;
    }

    if(reduced){
      drawFrame(0);
      return;
    }

    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting) play(); else pause();
        });
      }, {threshold:0.01});
      io.observe(canvas);
    } else {
      play();
    }

    window.addEventListener('resize', function(){ resize(); });
  });
})();
