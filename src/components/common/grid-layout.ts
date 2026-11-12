// RN can round onLayout/window widths up while the browser keeps fractional
// CSS pixels. Reserve 1px before division, then round card widths down.
export function gridItemWidth(availableWidth: number, columns: number, gap: number) {
  return Math.max(0, Math.floor((availableWidth - 1 - (columns - 1) * gap) / columns));
}
