// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */

import { D2R, R2D } from "@cosmicds/vue-toolkit";
import { Color, Coordinates, Grids, RenderContext, Text3d, Text3dBatch, Vector3d } from "@wwtelescope/engine";

export function makeOverlayText(renderContext: RenderContext) {
  const glyphHeight = 50;
  const textBatch = new Text3dBatch(glyphHeight);
  // const location = Coordinates.raDecTo3d(4.001238944138198, 0.5307600894728279);
  const location = Vector3d.create(0, 0.05, 0);
  const up = Vector3d.create(0, 1, 0);
  textBatch.viewTransform = Grids._altAzTextBatch.viewTransform;
  textBatch.add(new Text3d(location, up, "Star", glyphHeight, 0.00018));
  textBatch.draw(renderContext, 1, Color.fromArgb(255, 255, 255, 255));
}
