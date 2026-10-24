/** DNS Workspace shell integration. No changes to the standalone app or its own menus. */
export function initWorkspaceShell(toolId: string): () => void {
  if (window.parent === window) return () => {};
  document.documentElement.dataset.dnsWorkspaceEmbedded = 'true';
  const parentOrigin = 'https://dolomitinordicski.github.io';
  const send = (type: string) => window.parent.postMessage({ channel: 'dns-workspace-v1', type, toolId }, parentOrigin);
  send('ready');
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== parentOrigin || event.source !== window.parent) return;
    if (event.data?.channel !== 'dns-workspace-v1') return;
    if (event.data.type === 'ping') send('ready');
  };
  window.addEventListener('message', onMessage);
  return () => {
    window.removeEventListener('message', onMessage);
    delete document.documentElement.dataset.dnsWorkspaceEmbedded;
  };
}
