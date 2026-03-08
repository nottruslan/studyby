/**
 * До первой отрисовки помечает html: PWA (standalone) или браузер.
 * В браузере на телефоне добавляются отступы снизу под панель Safari.
 */
export function DisplayModeScript() {
  const script = `
    (function() {
      var isStandalone = (typeof navigator !== 'undefined' && navigator.standalone === true) ||
        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
      document.documentElement.dataset.displayMode = isStandalone ? 'standalone' : 'browser';
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
