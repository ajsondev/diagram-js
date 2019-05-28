import {
  toPoint
} from '../../util/Event';

import {
  getMidPoint,
  pointsAligned
} from '../../util/Geometry';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate
} from 'tiny-svg';

import {
  rotate,
  translate
} from '../../util/SvgTransformUtil';


export var BENDPOINT_CLS = 'djs-bendpoint';
export var SEGMENT_DRAGGER_CLS = 'djs-segment-dragger';

export function toCanvasCoordinates(canvas, event) {

  var position = toPoint(event),
      clientRect = canvas._container.getBoundingClientRect(),
      offset;

  // canvas relative position

  offset = {
    x: clientRect.left,
    y: clientRect.top
  };

  // update actual event payload with canvas relative measures

  var viewbox = canvas.viewbox();

  return {
    x: viewbox.x + (position.x - offset.x) / viewbox.scale,
    y: viewbox.y + (position.y - offset.y) / viewbox.scale
  };
}

export function addBendpoint(parentGfx, cls) {
  var groupGfx = svgCreate('g');
  svgClasses(groupGfx).add(BENDPOINT_CLS);

  svgAppend(parentGfx, groupGfx);

  var visual = svgCreate('circle');
  svgAttr(visual, {
    cx: 0,
    cy: 0,
    r: 4
  });
  svgClasses(visual).add('djs-visual');

  svgAppend(groupGfx, visual);

  var hit = svgCreate('circle');
  svgAttr(hit, {
    cx: 0,
    cy: 0,
    r: 10
  });
  svgClasses(hit).add('djs-hit');

  svgAppend(groupGfx, hit);

  if (cls) {
    svgClasses(groupGfx).add(cls);
  }

  return groupGfx;
}

function createParallelDragger(parentGfx, segmentStart, segmentEnd, alignment) {
  var draggerGfx = svgCreate('g');

  svgAppend(parentGfx, draggerGfx);

  var width = 14,
      height = 3,
      padding = 6,
      hitWidth = calculateHitWidth(segmentStart, segmentEnd, alignment, padding),
      hitHeight = height + padding;

  var visual = svgCreate('rect');
  svgAttr(visual, {
    x: -width / 2,
    y: -height / 2,
    width: width,
    height: height
  });
  svgClasses(visual).add('djs-visual');

  svgAppend(draggerGfx, visual);

  var hit = svgCreate('rect');
  svgAttr(hit, {
    x: -hitWidth / 2,
    y: -hitHeight / 2,
    width: hitWidth,
    height: hitHeight
  });
  svgClasses(hit).add('djs-hit');

  svgAppend(draggerGfx, hit);

  rotate(draggerGfx, alignment === 'v' ? 90 : 0, 0, 0);

  return draggerGfx;
}


export function addSegmentDragger(parentGfx, segmentStart, segmentEnd) {

  var groupGfx = svgCreate('g'),
      mid = getMidPoint(segmentStart, segmentEnd),
      alignment = pointsAligned(segmentStart, segmentEnd);

  svgAppend(parentGfx, groupGfx);

  createParallelDragger(groupGfx, segmentStart, segmentEnd, alignment);

  svgClasses(groupGfx).add(SEGMENT_DRAGGER_CLS);
  svgClasses(groupGfx).add(alignment === 'h' ? 'horizontal' : 'vertical');

  translate(groupGfx, mid.x, mid.y);

  return groupGfx;
}

export function calculateSegmentMoveRegion(segmentLength) {
  // Move region should be 2/3 of segment length and rounded up
  return Math.round(segmentLength * 0.666);
}

// helper //////////

function calculateHitWidth(segmentStart, segmentEnd, alignment, padding) {
  var segmentLengthXAxis = segmentEnd.x - segmentStart.x,
      segmentLengthYAxis = segmentEnd.y - segmentStart.y;

  return alignment === 'h' ?
    calculateSegmentMoveRegion(segmentLengthXAxis) :
    calculateSegmentMoveRegion(segmentLengthYAxis);
}
