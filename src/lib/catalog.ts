import { ASSETS } from '../data/mock';
import { loadSubmissions, type PipelineSubmission } from './pipeline';

export type CatalogAsset = typeof ASSETS[number] & {
  displayId?: string;
  launchDemoUrl?: string;
  demoUrl?: string;
  repoUrl?: string;
  videoUrl?: string;
  sourceSubmissionId?: string;
};

export async function loadCatalogAssets(): Promise<CatalogAsset[]> {
  const submissions = await loadSubmissions();
  const publishedAssets = submissions
    .filter((submission) => submission.status === 'Published')
    .map((submission, index) => submissionToAsset(submission, index));

  const staticIds = new Set(ASSETS.map((asset) => asset.id));
  const uniquePublishedAssets = publishedAssets.filter((asset) => !staticIds.has(asset.id));

  return [...uniquePublishedAssets, ...ASSETS] as CatalogAsset[];
}

export async function getCatalogAsset(id: string): Promise<CatalogAsset | null> {
  const assets = await loadCatalogAssets();
  return assets.find((asset) => asset.id === id) ?? null;
}

function submissionToAsset(submission: PipelineSubmission, index: number): CatalogAsset {
  const clouds = normalizeClouds(submission.clouds);
  const family = normalizeFamily(submission.family);
  const architecture = detailToList(submission.architectures, ['Not applicable']);
  const prerequisites = detailToList(submission.prerequisites, ['Not applicable']).map((name) => ({ name, done: true }));
  const dependencies = detailToList(submission.dependencies, ['Not applicable']);
  const legacyAttachmentUrl = firstAttachmentUrl(submission.attachments);
  const launchDemoUrl = cleanUrl(submission.demoUrl) ?? legacyAttachmentUrl;
  const repoUrl = cleanUrl(submission.repoUrl);
  const videoUrl = cleanUrl(submission.videoUrl);
  const tags = Array.from(new Set([
    submission.category,
    submission.solution,
    ...clouds.map((cloud) => cloud.toUpperCase()),
  ].filter(Boolean)));

  return {
    id: submission.id,
    displayId: `${familyPrefix(family)}-${String(index + 1).padStart(3, '0')}`,
    name: submission.name,
    family,
    category: submission.category,
    clouds,
    maturity: normalizeMaturity(submission.maturity),
    effort: 'medium',
    demoReady: Boolean(launchDemoUrl),
    solution: submission.solution,
    owner: submission.submitter,
    ownerInit: submission.submitterInit,
    desc: submission.desc,
    longDesc: submission.desc || 'Published contribution from the AIMPLIFY review pipeline.',
    architecture,
    archColors: architecture.map((_, index) => ['blue', 'purple', 'orange', 'green'][index % 4]),
    quickStart: normalizeText(submission.commands),
    prerequisites,
    dependencies,
    stats: { deployments: 0, demos: launchDemoUrl ? 1 : 0, projects: 0, satisfaction: submission.aiScore },
    changelog: [{ ver: 'v1.0.0', date: submission.date, desc: 'Published from contribution pipeline.' }],
    tags,
    launchDemoUrl,
    repoUrl,
    videoUrl,
    sourceSubmissionId: submission.id,
  };
}

function familyPrefix(family: string) {
  const prefixes: Record<string, string> = {
    atlas: 'ATL',
    forge: 'FRG',
    relay: 'RLY',
    sentinel: 'SEN',
    nexus: 'NXS',
  };
  return prefixes[family] ?? 'AST';
}

function normalizeFamily(value: string) {
  const family = value.toLowerCase();
  if (family in { atlas: true, forge: true, relay: true, sentinel: true, nexus: true }) return family;
  return 'relay';
}

function normalizeMaturity(value: string) {
  const maturity = value.toLowerCase();
  if (maturity.includes('battle')) return 'battle-tested';
  if (maturity.includes('valid') || maturity.includes('demo')) return 'validated';
  return 'experimental';
}

function normalizeClouds(values: string[]) {
  const normalized = values
    .map((cloud) => cloud.toLowerCase())
    .map((cloud) => {
      if (cloud.includes('amazon') || cloud === 'aws') return 'aws';
      if (cloud.includes('google') || cloud === 'gcp') return 'gcp';
      if (cloud.includes('azure')) return 'azure';
      return '';
    })
    .filter(Boolean);

  return normalized.length ? Array.from(new Set(normalized)) : ['aws'];
}

function detailToList(value: string, fallback: string[]) {
  const text = normalizeText(value);
  if (text.toLowerCase() === 'not applicable') return fallback;
  return text
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value: string) {
  return value?.trim() || 'Not applicable';
}

function cleanUrl(value?: string | null) {
  const url = value?.trim();
  if (!url || url.toLowerCase() === 'not applicable') return undefined;
  return url;
}

function firstAttachmentUrl(attachments: PipelineSubmission['attachments']) {
  for (const attachment of attachments) {
    const url = cleanUrl(attachment.url);
    if (url) return url;
  }
  return undefined;
}
