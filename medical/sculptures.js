'use strict';
// Rounded, locally modelled vinyl pieces. Coordinates use Y up, with the audience on +Z.
const Sculptures = (() => {
  const G = ClinicThree;
  const colors = {
    ivory: '#fff1d9',
    cream: '#fffbef',
    skin: '#ffe9c9',
    blush: '#f68e93',
    ink: '#292a48',
    blue: '#486ac4',
    sky: '#96cef2',
    lightBlue: '#cae6fb',
    navy: '#394c86',
    plum: '#9d416e',
    pink: '#e76f96',
    rose: '#ffaec1',
    lilac: '#aa99df',
    orange: '#f59762',
    honey: '#ffcd65',
    mint: '#63c7ad',
    pine: '#418c81',
    board: '#ebe7fa',
    trim: '#9b97d5',
    indigo: '#7979b9',
    grey: '#c9c6d5'
  };
  const materials = new Map(),
    geometries = new Map(),
    labels = new Map();
  const unitBall = new G.SphereGeometry(1, 28, 19);
  const detailBall = new G.SphereGeometry(1, 16, 12);
  const tinyBall = new G.SphereGeometry(1, 12, 8);
  const unitPlane = new G.PlaneGeometry(1, 1);
  function material(color) {
    if (typeof color !== 'string') return color;
    if (!materials.has(color))
      materials.set(color, new G.MeshStandardMaterial({ color, roughness: 0.49, metalness: 0 }));
    return materials.get(color);
  }
  function group(parent, x = 0, y = 0, z = 0) {
    const g = new G.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }
  function mesh(parent, geom, paint, x, y, z) {
    const m = new G.Mesh(geom, material(paint));
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }
  function cached(key, build) {
    if (!geometries.has(key)) geometries.set(key, build());
    return geometries.get(key);
  }
  function ball(parent, x, y, z, rx, ry, rz, paint) {
    const extent = Math.max(rx, ry, rz);
    const m = mesh(
      parent,
      extent < 0.13 ? tinyBall : extent < 0.4 ? detailBall : unitBall,
      paint,
      x,
      y,
      z
    );
    m.scale.set(rx, ry, rz);
    return m;
  }
  function box(parent, x, y, z, w, h, d, radius, paint) {
    const geo = cached(
      `box/${w}/${h}/${d}/${radius}`,
      () => new G.RoundedBoxGeometry(w, h, d, 2, radius)
    );
    return mesh(parent, geo, paint, x, y, z);
  }
  function cylinder(parent, x, y, z, top, bottom, h, paint) {
    const geo = cached(
      `cylinder/${top}/${bottom}/${h}`,
      () => new G.CylinderGeometry(top, bottom, h, 40)
    );
    return mesh(parent, geo, paint, x, y, z);
  }
  function curve(points) {
    return new G.CatmullRomCurve3(points.map((p) => new G.Vector3(...p)));
  }
  function cord(parent, points, radius, paint) {
    const geo = cached(
      `cord/${points.join('/')}/${radius}`,
      () => new G.TubeGeometry(curve(points), Math.max(12, points.length * 4), radius, 8, false)
    );
    return mesh(parent, geo, paint, 0, 0, 0);
  }
  function disc(parent, x, y, z, r, depth, paint) {
    const plate = cylinder(parent, x, y, z, r, r, depth, paint);
    plate.rotation.x = Math.PI / 2;
    return plate;
  }
  function tablet(parent, w, d, depth, corner, paint, y) {
    const key = `tablet/${w}/${d}/${depth}/${corner}`;
    const geo = cached(key, () => {
      const path = new G.Shape(),
        x = w / 2,
        z = d / 2,
        r = corner;
      path.moveTo(-x + r, -z);
      path.lineTo(x - r, -z);
      path.quadraticCurveTo(x, -z, x, -z + r);
      path.lineTo(x, z - r);
      path.quadraticCurveTo(x, z, x - r, z);
      path.lineTo(-x + r, z);
      path.quadraticCurveTo(-x, z, -x, z - r);
      path.lineTo(-x, -z + r);
      path.quadraticCurveTo(-x, -z, -x + r, -z);
      const g = new G.ExtrudeGeometry(path, {
        depth,
        bevelEnabled: true,
        bevelSize: 0.055,
        bevelThickness: 0.055,
        bevelSegments: 4,
        curveSegments: 9
      });
      g.rotateX(-Math.PI / 2);
      return g;
    });
    return mesh(parent, geo, paint, 0, y, 0);
  }
  function label(parent, x, y, z, w, h, text, ink = '#34324c', weight = 800) {
    const key = [w, h, text, ink, weight].join('|');
    if (!labels.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.height = 80;
      canvas.width = Math.max(64, Math.ceil((80 * w) / h));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = ink;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${weight} 59px system-ui, sans-serif`;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 5);
      const texture = new G.CanvasTexture(canvas);
      texture.colorSpace = G.SRGBColorSpace;
      labels.set(
        key,
        new G.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -1
        })
      );
    }
    const m = mesh(parent, unitPlane, labels.get(key), x, y, z);
    m.scale.set(w, h, 1);
    return m;
  }
  let shadowMap;
  function shadow(parent, x, y, z, w, d, opacity = 0.26) {
    if (!shadowMap) {
      const c = document.createElement('canvas');
      c.width = c.height = 96;
      const ctx = c.getContext('2d'),
        grad = ctx.createRadialGradient(48, 48, 0, 48, 48, 47);
      grad.addColorStop(0, 'rgba(47,35,68,1)');
      grad.addColorStop(0.35, 'rgba(47,35,68,.79)');
      grad.addColorStop(0.7, 'rgba(47,35,68,.28)');
      grad.addColorStop(1, 'rgba(47,35,68,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 96, 96);
      shadowMap = new G.CanvasTexture(c);
      shadowMap.colorSpace = G.SRGBColorSpace;
    }
    const key = 'shadow' + opacity;
    if (!materials.has(key))
      materials.set(
        key,
        new G.MeshBasicMaterial({ map: shadowMap, opacity, transparent: true, depthWrite: false })
      );
    const patch = mesh(parent, unitPlane, materials.get(key), x, y, z);
    patch.rotation.x = -Math.PI / 2;
    patch.scale.set(w, d, 1);
    patch.renderOrder = 1;
    return patch;
  }
  // Bake the stationary vinyl pieces of each assembly together. Moving hinges, faces
  // and selectable objects stay in their own groups and retain their picking identity.
  function batch(parent) {
    for (const child of [...parent.children]) if (child.isGroup) batch(child);
    const list = parent.children.filter((m) => m.isMesh && m.material.isMeshStandardMaterial);
    if (list.length < 2) return;
    const copies = list.map((m) => {
      m.updateMatrix();
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      g.applyMatrix4(m.matrix);
      const positions = g.getAttribute('position'),
        rgb = new Float32Array(positions.count * 3);
      for (let i = 0; i < rgb.length; i += 3) m.material.color.toArray(rgb, i);
      g.setAttribute('color', new G.BufferAttribute(rgb, 3));
      for (const name of Object.keys(g.attributes))
        if (!['position', 'normal', 'color'].includes(name)) g.deleteAttribute(name);
      return g;
    });
    const merged = G.mergeGeometries(copies);
    copies.forEach((g) => g.dispose());
    if (!merged) return;
    list.forEach((m) => parent.remove(m));
    if (!materials.has('vinyl'))
      materials.set('vinyl', new G.MeshStandardMaterial({ vertexColors: true, roughness: 0.49 }));
    const result = mesh(parent, merged, materials.get('vinyl'), 0, 0, 0);
    result.userData.baked = true;
  }
  function plus(parent, x, y, z, size, paint) {
    box(parent, x, y, z, size, size * 0.31, 0.034, 0.016, paint);
    box(parent, x, y, z + 0.006, size * 0.31, size, 0.034, 0.016, paint);
  }
  function tick(parent, x, y, z, size, paint) {
    cord(
      parent,
      [
        [x - size * 0.35, y, z],
        [x - size * 0.07, y - size * 0.23, z],
        [x + size * 0.4, y + size * 0.28, z]
      ],
      size * 0.085,
      paint
    );
  }
  function pencil(parent, length = 0.94) {
    const g = group(parent);
    cylinder(g, 0, 0, 0, 0.065, 0.065, length, colors.honey);
    cylinder(g, 0, length * 0.5, 0, 0.067, 0.067, 0.08, colors.sky);
    ball(g, 0, length * 0.5 + 0.06, 0, 0.066, 0.079, 0.066, colors.rose);
    cylinder(g, 0, -length * 0.5 - 0.085, 0, 0.065, 0.012, 0.17, colors.ivory);
    ball(g, 0, -length * 0.5 - 0.165, 0, 0.018, 0.036, 0.018, colors.ink);
    return g;
  }
  function character(parent, writer) {
    const c = colors,
      root = group(parent),
      torso = group(root),
      head = group(torso, 0, 1.79, 0);
    const accent = writer ? c.pink : c.blue,
      pale = writer ? c.rose : c.sky;
    for (const side of [-1, 1]) {
      ball(root, 0.29 * side, 0.15, 0.09, 0.265, 0.16, 0.33, writer ? c.plum : c.navy);
      ball(root, 0.29 * side, 0.23, 0.04, 0.22, 0.21, 0.235, pale);
    }
    ball(torso, 0, 0.68, 0, 0.6, 0.64, 0.45, accent);
    ball(torso, 0, 0.68, 0.23, 0.49, 0.54, 0.27, writer ? '#f5abbc' : c.cream);
    if (!writer) {
      cord(
        torso,
        [
          [-0.25, 1.12, 0.28],
          [-0.31, 0.91, 0.43],
          [-0.26, 0.72, 0.5],
          [-0.14, 0.67, 0.52],
          [-0.03, 0.79, 0.53],
          [0.06, 1.11, 0.4]
        ],
        0.032,
        c.navy
      );
      cord(
        torso,
        [
          [0.06, 1.11, 0.4],
          [0.23, 0.94, 0.43],
          [0.26, 0.74, 0.49]
        ],
        0.031,
        c.navy
      );
      disc(torso, 0.26, 0.7, 0.5, 0.086, 0.05, c.navy);
      disc(torso, 0.26, 0.7, 0.532, 0.053, 0.018, c.sky);
      box(torso, -0.3, 0.48, 0.468, 0.21, 0.13, 0.05, 0.035, c.lightBlue);
    } else {
      ball(torso, 0, 1.09, 0.08, 0.48, 0.17, 0.4, c.plum);
      const tail = ball(torso, -0.24, 0.91, 0.4, 0.115, 0.235, 0.058, c.pink);
      tail.rotation.z = -0.33;
      box(torso, 0.19, 0.55, 0.5, 0.25, 0.17, 0.04, 0.044, c.cream);
      box(torso, 0.17, 0.57, 0.524, 0.115, 0.019, 0.014, 0.009, c.honey);
    }
    const arms = [];
    for (const side of [-1, 1]) {
      const arm = group(torso, side * 0.47, 0.91, 0.03);
      arms.push(arm);
      const sleeve = ball(arm, side * 0.095, -0.145, 0.02, 0.181, 0.28, 0.19, pale);
      sleeve.rotation.z = side * 0.2;
      ball(arm, side * 0.14, -0.34, 0.125, 0.155, 0.197, 0.157, c.skin);
      ball(arm, side * 0.065, -0.31, 0.24, 0.077, 0.096, 0.078, c.skin);
      arm.rotation.z = side * (writer ? 0.22 : 0.17);
    }
    if (writer) {
      const pen = pencil(arms[0], 0.75);
      pen.position.set(-0.17, -0.25, 0.25);
      pen.rotation.z = -0.46;
      pen.rotation.x = 0.13;
    }
    const face = '#fff0d7';
    ball(head, 0, 0, 0, 0.825, 0.775, 0.666, face);
    for (const side of [-1, 1]) {
      const ear = ball(head, side * 0.685, 0.29, -0.025, 0.24, 0.29, 0.21, face);
      ear.rotation.z = -side * 0.33;
      ball(head, side * 0.75, 0.31, 0.125, 0.116, 0.16, 0.075, '#edac9d');
      ball(head, side * 0.49, -0.14, 0.507, 0.162, 0.082, 0.051, c.blush).rotation.y = side * 0.55;
      for (let j = 0; j < 3; j++)
        ball(
          head,
          side * (0.48 + j * 0.037),
          -0.127 + (j % 2) * 0.024,
          0.555 - j * 0.014,
          0.009,
          0.009,
          0.009,
          c.cream
        );
    }
    const eyes = [];
    for (const side of [-1, 1]) {
      const eye = group(head, side * 0.277, 0.006, 0.628);
      eyes.push(eye);
      eye.rotation.y = side * 0.26;
      ball(eye, 0, 0, 0, 0.081, 0.108, 0.05, c.ink);
      ball(eye, -0.021, 0.035, 0.043, 0.021, 0.026, 0.012, c.cream);
      ball(eye, 0.023, -0.029, 0.046, 0.01, 0.012, 0.006, c.sky);
      cord(
        head,
        [
          [side * 0.2, 0.175, 0.631],
          [side * 0.28, 0.196, 0.614],
          [side * 0.335, 0.18, 0.599]
        ],
        0.018,
        '#826057'
      );
    }
    ball(head, 0, -0.108, 0.673, 0.064, 0.044, 0.044, '#985b57');
    cord(
      head,
      [
        [-0.092, -0.177, 0.645],
        [-0.053, -0.201, 0.644],
        [0, -0.175, 0.652],
        [0.053, -0.198, 0.642],
        [0.094, -0.17, 0.646]
      ],
      0.014,
      '#895d59'
    );
    if (writer) {
      const hat = group(head, 0, 0.54, -0.025);
      hat.rotation.z = -0.17;
      ball(hat, 0, 0, 0, 0.713, 0.17, 0.56, c.plum);
      ball(hat, -0.07, 0.083, -0.02, 0.79, 0.273, 0.59, c.pink);
      ball(hat, -0.15, 0.34, -0.025, 0.105, 0.099, 0.11, c.plum).rotation.z = -0.35;
      ball(hat, 0.38, 0.17, 0.45, 0.088, 0.081, 0.034, c.honey);
    } else {
      const hat = group(head, 0, 0.5, -0.025);
      hat.rotation.z = 0.083;
      ball(hat, 0, 0.1, -0.025, 0.69, 0.286, 0.55, c.blue);
      ball(hat, 0, 0.006, 0.025, 0.71, 0.102, 0.566, c.navy);
      ball(hat, 0.015, -0.002, 0.37, 0.586, 0.069, 0.36, c.blue);
      const patch = group(hat, 0, 0.159, 0.525);
      patch.rotation.x = -0.2;
      ball(patch, 0, 0, 0, 0.154, 0.111, 0.033, c.cream);
      plus(patch, 0, 0, 0.032, 0.13, c.blue);
      ball(hat, 0, 0.378, -0.04, 0.078, 0.049, 0.081, c.sky);
    }
    return { root, torso, head, arms, eyes, writer };
  }
  function plant(parent, x, z, scale = 1) {
    const c = colors,
      g = group(parent, x, 0, z);
    g.scale.setScalar(scale);
    cylinder(g, 0, 0.22, 0, 0.265, 0.205, 0.41, '#e99173');
    cylinder(g, 0, 0.425, 0, 0.286, 0.28, 0.082, '#fbb18e');
    cylinder(g, 0, 0.47, 0, 0.245, 0.238, 0.025, '#937c64');
    for (const [x1, h, z1] of [
      [-0.33, 0.92, 0.01],
      [0.065, 1.14, -0.11],
      [0.28, 0.82, 0.12],
      [-0.105, 0.76, 0.19],
      [0.08, 0.92, 0.2]
    ]) {
      cord(
        g,
        [
          [0, 0.46, 0],
          [x1 * 0.29, h * 0.76, z1 * 0.35],
          [x1, h, z1]
        ],
        0.025,
        c.pine
      );
      const leaf = ball(g, x1, h, z1, 0.105, 0.238, 0.087, x1 > 0 ? '#83c49c' : '#58ad98');
      leaf.rotation.z = -1.65 * x1;
    }
    return g;
  }
  // Bentwood window with a sun and a sill. It anchors the back of the set when the reader orbits.
  function windowFrame(parent) {
    const g = group(parent, -2.72, 0.04, -1.29);
    g.rotation.y = 0.1;
    const c = colors,
      pts = [
        [-0.94, 0.08, 0],
        [-0.94, 1.6, 0]
      ];
    for (let i = 0; i <= 14; i++) {
      const a = Math.PI - (Math.PI * i) / 14;
      pts.push([0.94 * Math.cos(a), 1.84 + 0.94 * Math.sin(a), 0]);
    }
    pts.push([0.94, 1.5, 0], [0.94, 0.08, 0]);
    cord(g, pts, 0.084, '#b4a4db');
    box(g, 0, 0.07, 0, 2.16, 0.13, 0.35, 0.06, '#c9bce2');
    cord(
      g,
      [
        [-0.9, 1.49, 0],
        [0, 1.49, 0],
        [0.9, 1.49, 0]
      ],
      0.034,
      '#c4b8e0'
    );
    ball(g, 0.43, 2.09, -0.04, 0.235, 0.235, 0.066, '#ffce78');
    const cloud = group(g, -0.21, 2.16, -0.1);
    ball(cloud, -0.17, 0, 0, 0.24, 0.097, 0.06, c.cream);
    ball(cloud, 0.03, 0.055, 0, 0.2, 0.14, 0.076, c.cream);
    ball(cloud, 0.2, 0, 0, 0.19, 0.091, 0.061, c.cream);
  }
  function island(root) {
    const c = colors,
      base = group(root);
    shadow(base, 0.1, -0.52, 0.12, 11.1, 6.0, 0.3);
    tablet(base, 7.72, 3.9, 0.205, 0.68, c.indigo, -0.43);
    tablet(base, 7.83, 4.0, 0.125, 0.7, c.trim, -0.263);
    tablet(base, 7.85, 4.02, 0.115, 0.71, c.board, -0.132);
    const inset = group(base);
    tablet(inset, 7.47, 3.65, 0.015, 0.57, '#f3eafa', -0.035);
    // The front of the plinth carries a simple recessed maker's strip, like a model kit.
    box(base, 0, -0.25, 2.065, 1.04, 0.103, 0.04, 0.025, '#625f99');
    for (const [i, tint] of [
      [-1, c.sky],
      [0, c.honey],
      [1, c.rose]
    ])
      ball(base, i * 0.15, -0.248, 2.091, 0.032, 0.032, 0.014, tint);
    windowFrame(base);
    plant(base, 3.02, -1.25, 0.87);
    return base;
  }
  return {
    G,
    colors,
    group,
    mesh,
    ball,
    box,
    cylinder,
    tablet,
    disc,
    cord,
    curve,
    label,
    shadow,
    plus,
    tick,
    pencil,
    character,
    island,
    batch,
    material
  };
})();
