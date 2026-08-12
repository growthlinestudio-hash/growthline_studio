/* =============================================================================
   Growthline — fond "silk" plein écran, thème NOIR (palette d'origine)
   Porté en vanilla JS depuis le composant React fourni par l'utilisateur
   (silk-background-animation.tsx) — même logique de génération de texture
   (bruit + motif silk animé), sans React puisque cette page n'utilise ni
   Next.js ni shadcn. Couleurs conservées telles quelles (gris-violet sur
   fond quasi noir), comme dans le composant original.

   Correctif appliqué : le canvas est désormais dimensionné de façon robuste
   (resize géré au chargement, au redimensionnement ET via ResizeObserver sur
   <html>) pour garantir qu'il couvre TOUJOURS 100% de la page, sans zone
   blanche ni coupure quelle que soit la hauteur de la fenêtre.

   Optimisation performance (fluidité) : le motif est calculé sur un buffer
   interne réduit puis étiré en CSS sur 100% de l'écran (le rendu reste un
   flou doux, donc la perte de résolution est invisible), le temps avance en
   fonction du temps réel écoulé (et non du nombre de frames, pour garder la
   même vitesse d'animation) et non plus via un re-lissage complet à chaque
   frame, et le motif ne se recalcule plus si l'utilisateur préfère les
   animations réduites. Résultat : la même image, pour une fraction du coût
   CPU par frame.
   ============================================================================= */
(() => {
  'use strict';

  var canvas = document.createElement('canvas');
  canvas.id = 'violetSmokeCanvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  var ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) { canvas.remove(); return; }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var speed = 0.02;
  var scale = 2;
  var noiseIntensity = 0.8;
  var step = 2; // fidèle à la version d'origine (résolution interne déjà réduite)

  // Budget de pixels internes du buffer (avant "step") : garde le motif
  // fluide sur les grands écrans sans jamais agrandir un petit écran.
  var MAX_INTERNAL_PIXELS = 480000;

  var cssWidth = 0, cssHeight = 0;   // taille CSS réelle (plein écran)
  var width = 0, height = 0;         // taille interne du buffer (réduite)
  var running = !reduceMotion;
  var imageData = null;
  var time = 0;

  function resizeCanvas() {
    var w = Math.max(window.innerWidth, document.documentElement.clientWidth || 0);
    var h = Math.max(window.innerHeight, document.documentElement.clientHeight || 0);
    if (w === cssWidth && h === cssHeight) return;
    cssWidth = w;
    cssHeight = h;

    var scaleFactor = Math.min(1, Math.sqrt(MAX_INTERNAL_PIXELS / Math.max(1, w * h)));
    var newWidth = Math.max(1, Math.round(w * scaleFactor));
    var newHeight = Math.max(1, Math.round(h * scaleFactor));

    if (newWidth !== width || newHeight !== height) {
      width = newWidth;
      height = newHeight;
      canvas.width = width;
      canvas.height = height;
      imageData = ctx.createImageData(width, height);
    }
  }

  // Bruit simple, identique à la logique fournie.
  function noise(x, y) {
    var G = 2.71828;
    var rx = G * Math.sin(G * x);
    var ry = G * Math.sin(G * y);
    return (rx * ry * (1 + x)) % 1;
  }

  function draw() {
    if (width === 0 || height === 0) return;

    // Dégradé de fond — noir quasi pur (plus de gris anthracite)
    var gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#050505');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    var data = imageData.data;
    var tOffset = speed * time;

    for (var x = 0; x < width; x += step) {
      var u = (x / width) * scale;
      for (var y = 0; y < height; y += step) {
        var v = (y / height) * scale;

        var tex_x = u;
        var tex_y = v + 0.03 * Math.sin(8.0 * tex_x - tOffset);

        var pattern = 0.6 + 0.4 * Math.sin(
          5.0 * (tex_x + tex_y +
            Math.cos(3.0 * tex_x + 5.0 * tex_y) +
            0.02 * tOffset) +
          Math.sin(20.0 * (tex_x + tex_y - 0.1 * tOffset))
        );

        var rnd = noise(x, y);
        var intensity = Math.max(0, pattern - (rnd / 15.0) * noiseIntensity);

        // Couleur silk gris-violet très assombrie — jamais plus clair qu'un
        // charbon profond, même au pic d'intensité du motif.
        var r = Math.floor(24 * intensity);
        var g = Math.floor(20 * intensity);
        var b = Math.floor(27 * intensity);

        var index = (y * width + x) * 4;
        if (index < data.length) {
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Voile radial noir pur — assombrit encore vers les bords.
    var overlay = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 2
    );
    overlay.addColorStop(0, 'rgba(0,0,0,0.42)');
    overlay.addColorStop(1, 'rgba(0,0,0,0.82)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);
  }

  var raf = 0;
  var lastFrameTime = null;
  // 30 fps suffit largement pour un motif de fumée qui bouge lentement,
  // et coupe déjà le coût CPU en deux par rapport à 60fps.
  var frameInterval = 1000 / 30;

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (lastFrameTime === null) lastFrameTime = now;
    var elapsed = now - lastFrameTime;
    if (elapsed < frameInterval) return;
    // "time" avance selon le temps réel écoulé (calibré sur 60fps d'origine)
    // pour conserver la même vitesse visuelle même en tournant à 30fps.
    time += elapsed / (1000 / 60);
    lastFrameTime = now;
    resizeCanvas();
    draw();
  }

  window.addEventListener('resize', function () { resizeCanvas(); }, { passive: true });
  window.addEventListener('orientationchange', function () { resizeCanvas(); }, { passive: true });

  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { resizeCanvas(); });
    ro.observe(document.documentElement);
  }

  document.addEventListener('visibilitychange', function () {
    if (reduceMotion) return;
    running = !document.hidden;
    if (running && raf === 0) { lastFrameTime = null; raf = requestAnimationFrame(loop); }
    else if (!running && raf !== 0) { cancelAnimationFrame(raf); raf = 0; }
  });

  resizeCanvas();
  draw();

  if (!reduceMotion) {
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('load', function () { resizeCanvas(); draw(); });
})();
