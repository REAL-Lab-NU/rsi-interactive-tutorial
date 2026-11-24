'use strict';
// One renderer and one camera survive route, language and viewport changes.
const ClinicStudio = (() => {
  const { G, group, island, shadow, character, batch } = Sculptures;
  const limit = (n, min, max) => Math.max(min, Math.min(max, n));
  const home = { turn: -0.28, lift: 0.36, zoom: 1 };
  const symbols = {
    orbit:
      '<ellipse cx="12" cy="12" rx="9.4" ry="4.4" transform="rotate(-25 12 12)"/><path d="M8 6c1.4-2 3.3-3.1 5-2.4 2.7 1.1 3.6 5.8 2.1 10.4s-4.8 7.3-7.2 6.2c-1.1-.5-1.9-1.6-2.1-3.2"/>',
    reset: '<path d="M5 10a7.7 7.7 0 1 1 .6 6.1M5 4.9v5.5h5.5"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M5 12h14m-7-7v14"/>',
    tap: '<path d="M8.5 12.5V6.8a1.7 1.7 0 0 1 3.4 0v4.6l.8-.7 5.4 1.3c1.5.4 2 1.4 1.8 2.8l-.8 4.4c-.2 1.4-1.4 2.1-2.5 2.1h-4.9c-1 0-1.7-.4-2.3-1.2l-4.3-5.2c-.8-1.1.7-2.8 1.8-2l1.6 1.4M4.1 8.6a6.4 6.4 0 0 1 12.6 0"/>'
  };
  function glyph(key) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[key]}</svg>`;
  }
  let rig,
    failed = false;
  function mount(stage, lesson, values) {
    if (failed) return null;
    if (!rig) {
      const canvas = document.createElement('canvas');
      const attributes = { alpha: true, antialias: true, powerPreference: 'low-power' };
      let renderer;
      try {
        const context = canvas.getContext('webgl2', attributes);
        if (!context) {
          failed = true;
          return null;
        }
        renderer = new G.WebGLRenderer({ canvas, context, ...attributes });
      } catch {
        failed = true;
        return null;
      }
      rig = makeRig(renderer);
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        failed = true;
        rig.stop();
        mountDrawing();
      });
      canvas.addEventListener('webglcontextrestored', () => {
        failed = false;
        mountDrawing();
      });
    }
    return rig.mount(stage, lesson, values);
  }
  function makeRig(renderer) {
    const canvas = renderer.domElement,
      world = new G.Scene(),
      camera = new G.OrthographicCamera(-5, 5, 3, -3, 0.1, 45);
    const sceneRoot = group(world),
      platform = island(sceneRoot);
    batch(platform);
    world.add(new G.HemisphereLight('#fff5ec', '#a895be', 1.22));
    for (const [color, brightness, x, y, z] of [
      ['#fff1df', 2.35, -4, 8, 6],
      ['#dae8ff', 0.73, 4, 3, 3],
      ['#ffdded', 1.11, 3, 5, -5]
    ]) {
      const light = new G.DirectionalLight(color, brightness);
      light.position.set(x, y, z);
      world.add(light);
    }
    renderer.setClearColor(0, 0);
    const cast = [character(sceneRoot, false), character(sceneRoot, true)];
    for (const actor of cast) {
      batch(actor.root);
      actor.shadow = shadow(sceneRoot, 0, 0.051, 0, 2.4, 1.48, 0.31);
      actor.contact = shadow(sceneRoot, 0, 0.052, 0, 1.35, 0.66, 0.28);
    }
    const from = { ...home },
      dest = { ...home },
      projection = new G.Vector3(),
      ray = new G.Raycaster(),
      ndc = new G.Vector2();
    const hits = [],
      pointers = new Map();
    let experiment,
      objects,
      stage,
      callout,
      detail,
      hint,
      zoomBar,
      drag,
      held,
      raf = 0,
      last = 0,
      t = 0,
      values,
      visible = true;
    let widths = { w: 1, h: 1 },
      currentId = '',
      hover = '',
      lastInfo = '',
      lastCallout = '',
      clockStart = performance.now(),
      scores;
    const resize = new ResizeObserver(measure);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else stop();
    });
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      drag = null;
      held = null;
      pointers.clear();
    }
    function measure() {
      if (!stage || !stage.isConnected) return;
      const w = stage.clientWidth,
        h = stage.clientHeight;
      if (!w || !h) return;
      if (w !== widths.w || h !== widths.h) {
        widths = { w, h };
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(w, h, false);
      }
      wake();
    }
    function load(id) {
      if (currentId === id) return;
      if (objects) {
        sceneRoot.remove(objects);
        objects.traverse((n) => {
          if (n.userData.baked) n.geometry.dispose();
        });
      }
      currentId = id;
      objects = group(sceneRoot);
      experiment = ClinicExperiments[id](objects);
      batch(objects);
      experiment.roles.forEach((v, i) => {
        const a = cast[i];
        a.root.visible = a.shadow.visible = a.contact.visible = !!v;
        if (!v) return;
        a.root.position.set(v[0], 0.047, v[1]);
        a.root.rotation.y = v[2];
        a.root.scale.setScalar(i === 0 && !experiment.roles[1] ? 1.09 : 1.02);
        a.shadow.position.set(v[0] + 0.08, 0.051, v[1] + 0.04);
        a.contact.position.set(v[0], 0.052, v[1] + 0.08);
        const simple = i ? 'writer' : 'solver';
        a.root.userData.action = experiment.actions[simple] ? simple : experiment.focus[0];
      });
      if (experiment.actions.slot) {
        const stand = objects.getObjectByName('card-stand');
        if (stand) stand.userData.action = 'slot';
      }
      scores = null;
    }
    function mountRoom(el, s, v) {
      stop();
      resize.disconnect();
      visibility.disconnect();
      const previous = currentId;
      values = v;
      stage = el;
      load(s.id);
      hover = '';
      lastCallout = '';
      lastInfo = '';
      stage.dataset.renderer = 'webgl';
      stage.dataset.scene = s.id;
      stage.innerHTML = `<div class="studio-readout"><span class="scene-index">${words('第', 'Scene')} ${String(clinical.indexOf(s) + 1).padStart(2, '0')} <span>/ 06</span></span><span class="readout-text"></span></div>
        <button class="studio-pick" type="button">${glyph('tap')}<span></span></button>
        <span class="studio-hint">${glyph('orbit')}<span></span></span>
        <div class="studio-camera" role="group" aria-label="${words('视角', 'Camera view')}">${[
          ['minus', T('缩小', 'Zoom out')],
          ['plus', T('放大', 'Zoom in')],
          ['reset', T('复位视角', 'Reset view')]
        ]
          .map(
            ([key, name]) =>
              `<button type="button" data-view="${key}" title="${esc(l(name))}" aria-label="${esc(l(name))}">${glyph(key)}</button>`
          )
          .join('')}</div>`;
      stage.prepend(canvas);
      canvas.tabIndex = 0;
      canvas.setAttribute('role', 'group');
      canvas.setAttribute(
        'aria-label',
        l(
          T(
            '三维工作台。方向键旋转，加减键缩放，Home 复位，回车操作当前道具。',
            '3D workbench. Arrow keys orbit, plus or minus zoom, Home resets and Enter uses the marked object.'
          )
        )
      );
      callout = stage.querySelector('.studio-pick');
      detail = stage.querySelector('.readout-text');
      hint = stage.querySelector('.studio-hint span');
      zoomBar = stage.querySelector('.studio-camera');
      setHint();
      callout.addEventListener('click', () => act(callout.dataset.object));
      zoomBar.addEventListener('click', (e) => {
        const b = e.target.closest('[data-view]');
        if (b) changeView(b.dataset.view);
      });
      if (previous !== s.id) Object.assign(dest, home);
      visible = true;
      last = 0;
      measure();
      resize.observe(stage);
      visibility.observe(stage);
      return function update(value) {
        t = value;
        wake();
      };
    }
    function setHint() {
      hint.textContent = l(
        held !== null && held !== undefined
          ? T('把技能卡拖给蓝帽子', 'Drag the card to the blue cap')
          : T('拖动旋转 · 点道具操作', 'Drag to orbit · tap objects')
      );
    }
    function animateActor(a, seconds) {
      if (!a.root.visible) return;
      const still = reduced.matches,
        phase = seconds + (a.writer ? 1.75 : 0),
        frac = t % 1;
      const gesture = Math.sin(Math.PI * Math.min(1, frac / 0.87));
      const breathe = still ? 0 : Math.sin(phase * 1.58) * 0.012;
      a.torso.position.y = breathe;
      a.head.rotation.z =
        (a.writer ? -0.083 : 0.05) + (still ? 0 : Math.sin(phase * 0.68) * 0.023) + 0.045 * gesture;
      a.head.rotation.y = (a.writer ? -0.11 : 0.12) + 0.08 * gesture;
      a.head.rotation.x = (a.writer ? 0.07 : 0.028) + 0.057 * gesture;
      const blinkCycle = (phase + 1.0) % 4.6,
        blink = still ? 1 : 1 - 0.91 * Math.max(0, 1 - Math.abs(blinkCycle - 3.4) / 0.14);
      for (const eye of a.eyes) eye.scale.y = blink;
      const aimsAtProp = a.writer ? a.arms[0] : a.arms[1];
      aimsAtProp.rotation.x = -0.45 - 0.48 * gesture;
      aimsAtProp.rotation.z = (a.writer ? -1 : 1) * (0.47 + 0.3 * gesture);
      a.torso.rotation.z = (a.writer ? 0.035 : -0.025) + gesture * 0.019;
    }
    function moveCamera(dt) {
      const amount = reduced.matches ? 1 : 1 - Math.exp(-dt * 0.017);
      for (const key of ['turn', 'lift', 'zoom']) {
        const diff = dest[key] - from[key];
        from[key] = Math.abs(diff) < 0.0003 ? dest[key] : from[key] + diff * amount;
      }
      const aspect = widths.w / widths.h,
        compactStage = widths.w < 540;
      const half = Math.max(compactStage ? 2.35 : 2.64, (compactStage ? 4.4 : 4.67) / aspect) / from.zoom;
      camera.left = -half * aspect;
      camera.right = half * aspect;
      camera.top = half;
      camera.bottom = -half;
      const targetY = compactStage ? 1.03 : 0.95;
      camera.position.set(
        14 * Math.sin(from.turn) * Math.cos(from.lift),
        targetY + 14 * Math.sin(from.lift),
        14 * Math.cos(from.turn) * Math.cos(from.lift)
      );
      camera.lookAt(0, targetY, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    }
    function projected(node) {
      node.getWorldPosition(projection);
      projection.project(camera);
      return { x: (projection.x * 0.5 + 0.5) * widths.w, y: (0.5 - projection.y * 0.5) * widths.h };
    }
    function overlay(k) {
      const next = l(experiment.info(k, values, t));
      if (next !== lastInfo) {
        detail.textContent = next;
        lastInfo = next;
      }
      const id = hover || experiment.focus[k],
        item = experiment.actions[id];
      const text = l(item.verb);
      if (id !== lastCallout || text !== callout.lastElementChild.textContent) {
        callout.lastElementChild.textContent = text;
        callout.dataset.object = id;
        lastCallout = id;
      }
      const { x, y } = projected(item.spot),
        half = callout.offsetWidth * 0.5;
      callout.style.left = limit(x, half + 6, widths.w - half - 6) + 'px';
      callout.style.top = limit(y - 8, callout.offsetHeight + 8, widths.h - 42) + 'px';
      callout.hidden = held != null || drag?.type === 'orbit' || drag?.type === 'pinch';
    }
    function render(now) {
      raf = 0;
      if (failed || !visible || document.hidden || !stage?.isConnected) return;
      const dt = last ? Math.min(65, now - last) : 35;
      last = now;
      moveCamera(dt);
      let interpolating = false;
      if (experiment.chart) {
        const target = MEDICAL_CONTROLS.find((m) => m.id === values.solver).scores;
        if (!scores) scores = [...target];
        const mix = reduced.matches ? 1 : 1 - Math.exp(-0.012 * dt);
        scores = scores.map((n, i) => {
          const gap = target[i] - n;
          if (Math.abs(gap) < 0.04) return target[i];
          interpolating = true;
          return n + gap * mix;
        });
      }
      experiment.pose(t, values, held, scores);
      for (const a of cast) animateActor(a, (now - clockStart) / 1000);
      renderer.render(world, camera);
      overlay(Math.min(3, Math.floor(t)));
      if (
        !reduced.matches ||
        interpolating ||
        ['turn', 'lift', 'zoom'].some((key) => dest[key] !== from[key])
      )
        wake();
    }
    function wake() {
      if (!raf && !failed && visible && !document.hidden) raf = requestAnimationFrame(render);
    }
    function changeView(key) {
      if (key === 'reset') Object.assign(dest, home);
      if (key === 'plus' || key === 'minus')
        dest.zoom = limit(dest.zoom * (key === 'plus' ? 1.18 : 1 / 1.18), 0.77, 1.8);
      wake();
    }
    function act(key) {
      const op = experiment.actions[key]?.operation;
      if (!op) return;
      hover = '';
      canvas.style.cursor = 'grab';
      if (op.cycle) {
        const i = MEDICAL_CONTROLS.findIndex((m) => m.id === values.solver),
          v = MEDICAL_CONTROLS[(i + 1) % MEDICAL_CONTROLS.length].id;
        const select = dom('content').querySelector('select[data-option="solver"]');
        select.value = v;
        pick('solver', v);
      } else if (op.key) pick(op.key, op.value);
      else moveToBeat(op.step + 0.96);
      wake();
    }
    function hit(x, y) {
      const r = canvas.getBoundingClientRect();
      ndc.set((2 * (x - r.left)) / r.width - 1, 1 - (2 * (y - r.top)) / r.height);
      ray.setFromCamera(ndc, camera);
      hits.length = 0;
      ray.intersectObjects(
        [objects, ...cast.filter((a) => a.root.visible).map((a) => a.root), platform],
        true,
        hits
      );
      for (const entry of hits) {
        let item = entry.object,
          object = '',
          shown = true;
        for (let p = item; p; p = p.parent) {
          if (!p.visible) {
            shown = false;
            break;
          }
          if (!object && p.userData.action) object = p.userData.action;
        }
        if (!shown || item.material.transparent) continue;
        return object;
      }
      return '';
    }
    function pinchDistance() {
      const [a, b] = pointers.values();
      return Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
    }
    function onDown(e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        held = null;
        drag = { type: 'pinch', distance: pinchDistance(), zoom: dest.zoom };
        setHint();
        wake();
        return;
      }
      const key = hit(e.clientX, e.clientY);
      if (pointers.size === 1)
        drag = {
          type: 'pending',
          key,
          startX: e.clientX,
          startY: e.clientY,
          turn: dest.turn,
          lift: dest.lift
        };
    }
    function onMove(e) {
      if (!pointers.has(e.pointerId)) {
        if (e.pointerType === 'mouse' && !drag) {
          const key = hit(e.clientX, e.clientY);
          if (key !== hover) {
            hover = key;
            canvas.style.cursor = key ? 'pointer' : 'grab';
            wake();
          }
        }
        return;
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!drag) return;
      if (drag.type === 'pinch') {
        if (pointers.size === 2)
          dest.zoom = limit((drag.zoom * pinchDistance()) / drag.distance, 0.77, 1.8);
        wake();
        return;
      }
      const dx = e.clientX - drag.startX,
        dy = e.clientY - drag.startY;
      if (drag.type === 'pending' && Math.hypot(dx, dy) > 5) {
        if (drag.key === 'card' && experiment.handable && t < 2) {
          seek(1.96);
          drag.type = 'card';
          experiment.pose(1.96, values);
          const source = projected(experiment.actions.card.node),
            target = projected(cast[0].root);
          drag.span = target.x - source.x;
          held = 0;
          setHint();
        } else {
          drag.type = 'orbit';
          hover = '';
        }
        canvas.style.cursor = 'grabbing';
      }
      if (drag.type === 'orbit') {
        dest.turn = drag.turn - (dx * 5.5) / widths.w;
        dest.lift = limit(drag.lift + (dy * 2.2) / widths.h, 0.12, 0.99);
      } else if (drag.type === 'card') {
        held = limit(dx / (Math.abs(drag.span) > 20 ? drag.span : -widths.w * 0.25), 0, 1);
      }
      wake();
    }
    function onUp(e, cancelled) {
      if (!pointers.has(e.pointerId)) return;
      const gesture = drag;
      pointers.delete(e.pointerId);
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      if (!pointers.size) drag = null;
      canvas.style.cursor = 'grab';
      if (gesture?.type === 'card') {
        const release = held,
          success = !cancelled && release >= 0.63;
        held = null;
        setHint();
        // Continue from the hand's position on the same eased path as the narrated transfer.
        const linear = 0.5 - Math.sin(Math.asin(1 - 2 * release) / 3);
        seek(2 + 0.79 * linear);
        moveToBeat(success ? 2.96 : 1.96);
      } else if (!cancelled && gesture?.type === 'pending' && gesture.key) act(gesture.key);
      wake();
    }
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', (e) => onUp(e, false));
    canvas.addEventListener('pointercancel', (e) => onUp(e, true));
    canvas.addEventListener('pointerleave', () => {
      if (!drag) {
        hover = '';
        wake();
      }
    });
    canvas.addEventListener(
      'wheel',
      (e) => {
        if (!(e.ctrlKey || e.metaKey || document.activeElement === canvas)) return;
        e.preventDefault();
        dest.zoom = limit(dest.zoom * Math.exp(-e.deltaY * 0.0025), 0.77, 1.8);
        wake();
      },
      { passive: false }
    );
    canvas.addEventListener('keydown', (e) => {
      const key = e.key;
      if (
        !['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Home', '+', '=', '-', 'Enter'].includes(key)
      )
        return;
      e.preventDefault();
      e.stopPropagation();
      if (key === 'Enter') act(callout.dataset.object);
      else if (key === 'Home') changeView('reset');
      else if (key === '+' || key === '=') changeView('plus');
      else if (key === '-') changeView('minus');
      else if (key === 'ArrowLeft' || key === 'ArrowRight')
        dest.turn += key === 'ArrowRight' ? 0.22 : -0.22;
      else dest.lift = limit(dest.lift + (key === 'ArrowUp' ? 0.15 : -0.15), 0.12, 0.99);
      wake();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else wake();
    });
    return { mount: mountRoom, stop };
  }
  return { mount };
})();
