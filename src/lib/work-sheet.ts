/**
 * "All work" opens a full-screen slide-over sheet (WorkSheet) instead of
 * navigating. Links keep href="/work" so new-tab / no-JS still reach the page.
 */
export const WORK_SHEET_EVENT = "worksheet:open";

export function openWorkSheet() {
  window.dispatchEvent(new Event(WORK_SHEET_EVENT));
}

/** onClick for an <a href="/work">: open the sheet unless the user wants a new tab. */
export function onWorkLinkClick(e: React.MouseEvent<HTMLAnchorElement>) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  openWorkSheet();
}
