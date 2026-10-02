import type { FlyerContent } from '../types';
import type {
  AssetLibraryBlockDataSource,
  BlockDataBinding,
  BlockValidationIssue,
  DNSCoreBlockDataSource,
  DerivedBlockDataSource,
} from './blockDataContract';
import { getBlockDataContract } from '../components/blocks/BlockDataContracts';

export interface DNSCoreDataProvider {
  resolve(source: DNSCoreBlockDataSource): Promise<unknown>;
}

export interface AssetLibraryDataProvider {
  resolve(source: AssetLibraryBlockDataSource): Promise<unknown>;
}

export interface DerivedDataProvider {
  resolve(source: DerivedBlockDataSource, content: FlyerContent): Promise<unknown> | unknown;
}

export interface BlockDataProviders {
  dnsCore?: DNSCoreDataProvider;
  assetLibrary?: AssetLibraryDataProvider;
  derived?: DerivedDataProvider;
}

export interface ResolvedBlockBinding {
  binding: BlockDataBinding;
  data: unknown;
  issues: BlockValidationIssue[];
  resolvedFrom: BlockDataBinding['source']['kind'];
}

export async function resolveBlockBinding(
  binding: BlockDataBinding,
  content: FlyerContent,
  providers: BlockDataProviders = {},
): Promise<ResolvedBlockBinding> {
  const contract = getBlockDataContract(binding.componentId);
  const issues = contract?.validate(content) ?? [];

  if (!binding.enabled) {
    return { binding, data: null, issues, resolvedFrom: binding.source.kind };
  }

  if (contract && !contract.acceptedSources.includes(binding.source.kind)) {
    return {
      binding,
      data: null,
      resolvedFrom: binding.source.kind,
      issues: [
        ...issues,
        {
          code: 'unsupported-source',
          level: 'error',
          message: `${binding.componentId} does not accept source ${binding.source.kind}.`,
        },
      ],
    };
  }

  switch (binding.source.kind) {
    case 'inline':
      return {
        binding,
        data: contract?.resolve(content),
        issues,
        resolvedFrom: 'inline',
      };

    case 'dns-core':
      if (!providers.dnsCore) {
        return missingProvider(binding, issues, 'dns-core');
      }
      return {
        binding,
        data: await providers.dnsCore.resolve(binding.source),
        issues,
        resolvedFrom: 'dns-core',
      };

    case 'asset-library':
      if (!providers.assetLibrary) {
        return missingProvider(binding, issues, 'asset-library');
      }
      return {
        binding,
        data: await providers.assetLibrary.resolve(binding.source),
        issues,
        resolvedFrom: 'asset-library',
      };

    case 'derived':
      if (!providers.derived) {
        return missingProvider(binding, issues, 'derived');
      }
      return {
        binding,
        data: await providers.derived.resolve(binding.source, content),
        issues,
        resolvedFrom: 'derived',
      };
  }
}

export async function resolveFlyerBindings(
  bindings: BlockDataBinding[],
  content: FlyerContent,
  providers: BlockDataProviders = {},
): Promise<ResolvedBlockBinding[]> {
  return Promise.all(
    bindings
      .filter(binding => binding.enabled)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(binding => resolveBlockBinding(binding, content, providers)),
  );
}

function missingProvider(
  binding: BlockDataBinding,
  issues: BlockValidationIssue[],
  kind: BlockDataBinding['source']['kind'],
): ResolvedBlockBinding {
  return {
    binding,
    data: null,
    resolvedFrom: kind,
    issues: [
      ...issues,
      {
        code: 'missing-provider',
        level: 'error',
        message: `No provider is configured for ${kind}.`,
      },
    ],
  };
}
