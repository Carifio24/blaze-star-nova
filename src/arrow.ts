// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */


import { D2R } from "@cosmicds/vue-toolkit";
import { Coordinates, Matrix3d, Poly, Vector2d, WWTControl } from "@wwtelescope/engine";
import { engineStore } from "@wwtelescope/engine-pinia";

type Point = [number, number];

const D2H = 1 / 15;

export interface ArrowOptions {
  pointsTo: Point;
  angleDeg: number;
  halfHeight: number;
  stemFraction: number;
  headWidth: number;
  stemWidth: number;
  color: string;
  inner?: boolean;
  innerThickness?: number;
  innerColor?: string;
}

function transformWorldPointToPickSpace(wwtControl, worldPoint, backBufferWidth, backBufferHeight) {
  var m = Matrix3d.multiplyMatrix(wwtControl.renderContext.get_world(), wwtControl.renderContext.get_view());
  var p = new Vector2d();
  var vz = worldPoint.x * m.get_m13() + worldPoint.y * m.get_m23() + worldPoint.z * m.get_m33();
  var vx = (worldPoint.x * m.get_m11() + worldPoint.y * m.get_m21() + worldPoint.z * m.get_m31()) / vz;
  var vy = -(worldPoint.x * m.get_m12() + worldPoint.y * m.get_m22() + worldPoint.z * m.get_m32()) / vz;
  p.x = (1 + wwtControl.renderContext.get_projection().get_m11() * vx) * (backBufferWidth / 2);
  p.y = (1 + wwtControl.renderContext.get_projection().get_m22() * vy) * (backBufferHeight / 2);
  return p;
}

function getScreenPosForCoordinates(wwtControl, ra, dec) {
  var pt = Vector2d.create(ra, dec);
  var cartesian = Coordinates.sphericalSkyToCartesian(pt);
  var result = transformWorldPointToPickSpace(wwtControl, cartesian, wwtControl.renderContext.width, wwtControl.renderContext.height);
  return result;
}


function rotatePoint(point: Point, origin: Point, angleDeg: number): Point {
  const xp = point[0] - origin[0];
  const yp = point[1] - origin[1];
  const angleRad = angleDeg * D2R;
  return [
    origin[0] + xp * Math.cos(angleRad) - yp * Math.sin(angleRad),
    origin[1] + xp * Math.sin(angleRad) + yp * Math.cos(angleRad)
  ];
}


export function createArrow(store: EngineStore, options: ArrowOptions): [Poly] {
  const arrows: Poly[] = [];
  const pointRA = options.pointsTo[0];
  const centerDec = options.pointsTo[1];
  console.log(pointRA, centerDec);
  const xy = getScreenPosForCoordinates(WWTControl.singleton, pointRA * D2H, centerDec);
  console.log(xy);
  const outerCoordinates: Point[] = [];
  const headBackRA = pointRA + options.headWidth;
  const stemBackRA = headBackRA + options.stemWidth;
  const topDec = centerDec + options.halfHeight;
  const bottomDec = centerDec - options.halfHeight;
  const stemHalfHeight = options.stemFraction * options.halfHeight;
  const stemTopDec = centerDec + stemHalfHeight;
  const stemBottomDec = centerDec - stemHalfHeight;
  outerCoordinates.push([pointRA, centerDec]);
  outerCoordinates.push([headBackRA, topDec]);
  outerCoordinates.push([headBackRA, stemTopDec]);
  outerCoordinates.push([stemBackRA, stemTopDec]);
  outerCoordinates.push([stemBackRA, stemBottomDec]);
  outerCoordinates.push([headBackRA, stemBottomDec]);
  outerCoordinates.push([headBackRA, bottomDec]);   

  const outerArrow = new Poly(); 
  for (const coords of outerCoordinates) {
   const point = getScreenPosForCoordinates(WWTControl.singleton, coords[0] * D2H, coords[1]);
   const rotatedPoint = rotatePoint([point.x, point.y], xy, options.angleDeg);
   const rotatedCoords = store.findRADecForScreenPoint({x: rotatedPoint[0], y: rotatedPoint[1]});
   outerArrow.addPoint(rotatedCoords.ra, rotatedCoords.dec);
  }

  outerArrow.set_lineColor(options.color);
  outerArrow.set_fill(true);
  outerArrow.set_fillColor(options.color);
  arrows.push(outerArrow);
  
  if (options.inner) {
    const innerCoordinates: Point[] = [];
    const delta = options.innerThickness ?? 0.002; // The thickness of the outer "border"
    const headSlope = (topDec - centerDec) / (headBackRA - pointRA);
    const innerPointRA = pointRA + delta * Math.sqrt(1 + (headSlope ** 2) ) / headSlope;
    const innerHeadBackRA = headBackRA - delta; 
    const innerStemBackRA = stemBackRA - delta;
    const innerTopDec = headSlope * (innerHeadBackRA - innerPointRA) + centerDec;
    const innerBottomDec = 2 * centerDec - innerTopDec;
    const innerStemTopDec = stemTopDec - delta;
    const innerStemBottomDec = stemBottomDec + delta;
    innerCoordinates.push([innerPointRA, centerDec]);
    innerCoordinates.push([innerHeadBackRA, innerTopDec]); 
    innerCoordinates.push([innerHeadBackRA, innerStemTopDec]);
    innerCoordinates.push([innerStemBackRA, innerStemTopDec]); 
    innerCoordinates.push([innerStemBackRA, innerStemBottomDec]);
    innerCoordinates.push([innerHeadBackRA, innerStemBottomDec]);
    innerCoordinates.push([innerHeadBackRA, innerBottomDec]);

    const innerArrow = new Poly();
    for (const coords of innerCoordinates) {
      const point = getScreenPosForCoordinates(WWTControl.singleton, coords[0] * D2H, coords[1]);
      const rotatedPoint = rotatePoint([point.x, point.y], xy, options.angleDeg);
      const rotatedCoords = store.findRADecForScreenPoint({x: rotatedPoint[0], y: rotatedPoint[1]});
      innerArrow.addPoint(rotatedCoords.ra, rotatedCoords.dec);
    }

    const innerColor = options.innerColor ?? "#000000";
    innerArrow.set_lineColor(innerColor);
    innerArrow.set_fillColor(innerColor);
    innerArrow.set_fill(true);

    arrows.push(innerArrow);
  }

  return arrows;

}
