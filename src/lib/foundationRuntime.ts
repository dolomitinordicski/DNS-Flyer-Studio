import {
  initDNSFoundation,
  type DNSFoundationRuntimeHandle,
} from '@dolomitinordicski/dns-shared-data/foundation';

let runtime: DNSFoundationRuntimeHandle | null = null;

export function getDNSFoundationRuntime(): DNSFoundationRuntimeHandle {
  if (!runtime) {
    runtime = initDNSFoundation({
      shellProfile: 'operational',
      chrome: true,
      footer: true,
      print: true,
      accessibility: {
        mountSelector: '[data-dns-accessibility-mount]',
        storageKey: 'dns-accessibility-v1',
      },
    });
  }
  return runtime;
}
