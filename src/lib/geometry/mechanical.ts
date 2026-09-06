import * as THREE from "three";

export type ProfilePoint = readonly [radius: number, y: number];

export class ProfileGeometry extends THREE.LatheGeometry {
  constructor(profile: readonly ProfilePoint[], segments = 112) {
    super(profile.map(([radius, y]) => new THREE.Vector2(radius, y)), segments);
    this.computeVertexNormals();
  }
}

export function ringProfile(
  outer: number,
  inner: number,
  width: number,
  chamfer = 0.025,
): ProfilePoint[] {
  const c = Math.min(chamfer, width / 4, (outer - inner) / 4);
  const h = width / 2;
  return [
    [inner + c, -h], [outer - c, -h], [outer, -h + c],
    [outer, h - c], [outer - c, h], [inner + c, h],
    [inner, h - c], [inner, -h + c], [inner + c, -h],
  ];
}

function circleHole(shape: THREE.Shape, x: number, y: number, radius: number) {
  const hole = new THREE.Path();
  hole.absarc(x, y, radius, 0, Math.PI * 2, true);
  shape.holes.push(hole);
}

export class GearGeometry extends THREE.ExtrudeGeometry {
  constructor(
    radius = 1.3,
    teeth = 32,
    width = 0.34,
    bore = 0.35,
    reliefHoles = 0,
    toothDepth = 0.15,
  ) {
    const shape = new THREE.Shape();
    const pitch = Math.PI * 2 / teeth;
    const root = radius - toothDepth;
    const points: [number, number][] = [
      [-0.5, root], [-0.32, root], [-0.245, root + toothDepth * 0.33],
      [-0.15, radius], [0.15, radius], [0.245, root + toothDepth * 0.33],
      [0.32, root], [0.5, root],
    ];
    for (let tooth = 0; tooth < teeth; tooth++) {
      points.forEach(([fraction, r], index) => {
        const a = (tooth + fraction) * pitch;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (tooth === 0 && index === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
    }
    shape.closePath();
    if (bore > 0) circleHole(shape, 0, 0, bore);
    const holeOrbit = bore + (root - bore) * 0.52;
    const holeRadius = Math.min((root - bore) * 0.23, holeOrbit * 0.25);
    for (let i = 0; i < reliefHoles; i++) {
      const a = i * Math.PI * 2 / reliefHoles;
      circleHole(shape, Math.cos(a) * holeOrbit, Math.sin(a) * holeOrbit, holeRadius);
    }
    super(shape, {
      depth: width - 0.024,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 20,
    });
    this.rotateX(Math.PI / 2);
    this.translate(0, (width - 0.024) / 2, 0);
    this.computeVertexNormals();
  }
}

export class InternalGearGeometry extends THREE.ExtrudeGeometry {
  constructor(outer = 1.8, inner = 1.45, teeth = 54, width = 0.45, toothDepth = 0.11) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    const pitch = Math.PI * 2 / teeth;
    const tooth: [number, number][] = [
      [-0.5, inner + toothDepth], [-0.28, inner + toothDepth],
      [-0.13, inner], [0.13, inner], [0.28, inner + toothDepth], [0.5, inner + toothDepth],
    ];
    for (let i = 0; i < teeth; i++) {
      tooth.forEach(([f, r], j) => {
        const a = -(i + f) * pitch;
        if (i === 0 && j === 0) hole.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else hole.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      });
    }
    hole.closePath();
    shape.holes.push(hole);
    super(shape, {
      depth: width - 0.024, bevelEnabled: true, bevelSize: 0.012,
      bevelThickness: 0.012, bevelSegments: 2, curveSegments: 112, steps: 1,
    });
    this.rotateX(Math.PI / 2);
    this.translate(0, (width - 0.024) / 2, 0);
    this.computeVertexNormals();
  }
}

export class KeywayGeometry extends THREE.ExtrudeGeometry {
  constructor(radius = 0.5, length = 1, width = 0.17, depth = 0.1, centerY = 0) {
    const shape = new THREE.Shape();
    const angle = Math.asin(width / 2 / radius);
    const start = Math.PI / 2 + angle;
    const end = Math.PI * 2 + Math.PI / 2 - angle;
    for (let i = 0; i <= 112; i++) {
      const a = start + (end - start) * i / 112;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    }
    shape.lineTo(width / 2, radius - depth);
    shape.lineTo(-width / 2, radius - depth);
    shape.closePath();
    super(shape, {
      depth: length - 0.024,
      steps: 1,
      bevelEnabled: true,
      bevelSize: 0.009,
      bevelThickness: 0.012,
      bevelSegments: 2,
      curveSegments: 24,
    });
    this.rotateX(Math.PI / 2);
    this.translate(0, centerY + (length - 0.024) / 2, 0);
    this.computeVertexNormals();
  }
}

export class HelixCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    readonly radius: number,
    readonly height: number,
    readonly turns: number,
    readonly phase = 0,
    readonly centerY = 0,
  ) {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()) {
    const a = t * Math.PI * 2 * this.turns + this.phase;
    return target.set(
      Math.cos(a) * this.radius,
      (t - 0.5) * this.height + this.centerY,
      Math.sin(a) * this.radius,
    );
  }
}

export class HelixGeometry extends THREE.TubeGeometry {
  constructor(radius = 1, height = 2, turns = 6, tube = 0.08, phase = 0, centerY = 0) {
    super(new HelixCurve(radius, height, turns, phase, centerY), Math.ceil(turns * 64), tube, 12, false);
  }
}

export class BentTubeGeometry extends THREE.TubeGeometry {
  constructor(points: readonly (readonly [number, number, number])[], radius = 0.08) {
    super(
      new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
      80,
      radius,
      12,
      false,
    );
  }
}

export class FanBladeGeometry extends THREE.ExtrudeGeometry {
  constructor(inner = 0.48, outer = 1.25, thickness = 0.07) {
    const shape = new THREE.Shape();
    shape.moveTo(inner, -0.08);
    shape.bezierCurveTo(inner + 0.25, -0.16, outer - 0.2, 0.04, outer, 0.26);
    shape.lineTo(outer - 0.07, 0.46);
    shape.bezierCurveTo(outer - 0.33, 0.23, inner + 0.15, 0.12, inner, 0.12);
    shape.closePath();
    super(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 16,
    });
    this.rotateX(Math.PI / 2);
    this.translate(0, thickness / 2, 0);
  }
}

export class FlangeGeometry extends THREE.ExtrudeGeometry {
  constructor(width = 2.9, depth = 2.2, thickness = 0.3, bore = 0.85, corner = 0.24) {
    const shape = new THREE.Shape();
    const x = width / 2;
    const z = depth / 2;
    shape.moveTo(-x + corner, -z);
    shape.lineTo(x - corner, -z);
    shape.quadraticCurveTo(x, -z, x, -z + corner);
    shape.lineTo(x, z - corner);
    shape.quadraticCurveTo(x, z, x - corner, z);
    shape.lineTo(-x + corner, z);
    shape.quadraticCurveTo(-x, z, -x, z - corner);
    shape.lineTo(-x, -z + corner);
    shape.quadraticCurveTo(-x, -z, -x + corner, -z);
    shape.closePath();
    circleHole(shape, 0, 0, bore);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) circleHole(shape, sx * (x - 0.32), sz * (z - 0.32), 0.13);
    }
    super(shape, {
      depth: thickness - 0.06,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.035,
      bevelSegments: 3,
      curveSegments: 32,
    });
    this.rotateX(Math.PI / 2);
    this.translate(0, (thickness - 0.06) / 2, 0);
  }
}
