import type { MenuPlacement } from './types';

export function getMenuPlacement(
  anchorRect: DOMRect,
  menuWidth = 160,
  menuHeight = 160
): MenuPlacement {
  const margin = 12;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const spaceBelow = viewportH - anchorRect.bottom;
  const spaceAbove = anchorRect.top;

  const openUp = spaceBelow < menuHeight + margin && spaceAbove >= menuHeight + margin;

  const wouldOverflowRight = anchorRect.left + menuWidth > viewportW - margin;
  const openLeft = wouldOverflowRight;

  if (openUp && openLeft) return 'up-left';
  if (openUp && !openLeft) return 'up-right';
  if (!openUp && openLeft) return 'down-left';
  return 'down-right';
}
