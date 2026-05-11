import { ASSETS } from '../data/mock';
import { supabase } from './supabase';
import { loadSubmissions, type PipelineSubmission } from './pipeline';

/** Only static seed catalog rows use `assets.video_url` as an overlay; pipeline-published UUIDs read video from `submissions` only. */
const STATIC_CATALOG_IDS = new Set(ASSETS.map((asset) => asset.id));

export type CatalogFamily = 'atlas' | 'forge' | 'relay' | 'sentinel' | 'nexus';
export type CatalogCloud = 'aws' | 'gcp' | 'azure';
export type CatalogMaturity = 'experimental' | 'validated' | 'battle-tested';
export type CatalogEffort = 'low' | 'medium' | 'high';

/** Widen static + pipeline assets so filters and submissions stay type-safe. */
export type CatalogAsset = {
  id: string;
  name: string;
  family: CatalogFamily;
  category: string;
  clouds: CatalogCloud[];
  maturity: CatalogMaturity;
  effort: CatalogEffort;
  demoReady: boolean;
  solution: string;
  owner: string;
  ownerInit: string;
  desc: string;
  longDesc: string;
  architecture: string[];
  archColors: string[];
  quickStart: string;
  prerequisites: { name: string; done: boolean }[];
  dependencies: string[];
  stats: { deployments: number; demos: number; projects: number; satisfaction: number };
  changelog: { ver: string; date: string; desc: string }[];
  tags: string[];
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

  return [...uniquePublishedAssets, ...(ASSETS as unknown as CatalogAsset[])];
}

export async function getCatalogAsset(id: string): Promise<CatalogAsset | null> {
  const assets = await loadCatalogAssets();
  const base = assets.find((asset) => asset.id === id) ?? null;
  if (!base) return null;

  if (!STATIC_CATALOG_IDS.has(id)) {
    return base;
  }

  const fromSupabase = await fetchSupabaseVideoUrlForAsset(id);
  if (!fromSupabase) return base;

  return applyVideoUrlFromSupabase(base, fromSupabase);
}

/** Prefer `assets.video_url` from Supabase for **static** catalog ids (e.g. ATL-001), not pipeline UUIDs. */
async function fetchSupabaseVideoUrlForAsset(assetId: string): Promise<string | undefined> {
  if (!supabase) return undefined;
  const { data, error } = await supabase.from('assets').select('video_url').eq('id', assetId).maybeSingle();
  if (error || !data) return undefined;
  const url = typeof data.video_url === 'string' ? data.video_url.trim() : '';
  return url || undefined;
}

function applyVideoUrlFromSupabase(asset: CatalogAsset, videoUrl: string): CatalogAsset {
  const hasDemo = Boolean(asset.launchDemoUrl || asset.demoUrl);
  return {
    ...asset,
    videoUrl,
    demoReady: Boolean(hasDemo || videoUrl),
    stats: {
      ...asset.stats,
      demos: asset.stats.demos || (videoUrl ? 1 : 0),
    },
  };
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
    demoReady: Boolean(launchDemoUrl || videoUrl),
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
    // Option B heuristic: published submission-backed assets count as 1 deploy
    // until real deployment telemetry is captured for them.
    stats: { deployments: 1, demos: launchDemoUrl || videoUrl ? 1 : 0, projects: 0, satisfaction: submission.aiScore },
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

function normalizeFamily(value: string): CatalogFamily {
  const family = value.toLowerCase();
  if (family === 'atlas' || family === 'forge' || family === 'relay' || family === 'sentinel' || family === 'nexus') {
    return family;
  }
  return 'relay';
}

function normalizeMaturity(value: string): CatalogMaturity {
  const maturity = value.toLowerCase();
  if (maturity.includes('battle')) return 'battle-tested';
  if (maturity.includes('valid') || maturity.includes('demo')) return 'validated';
  return 'experimental';
}

function normalizeClouds(values: string[]): CatalogCloud[] {
  const normalized = values
    .map((cloud) => cloud.toLowerCase())
    .map((cloud) => {
      if (cloud.includes('amazon') || cloud === 'aws') return 'aws';
      if (cloud.includes('google') || cloud === 'gcp') return 'gcp';
      if (cloud.includes('azure')) return 'azure';
      return '';
    })
    .filter(Boolean) as CatalogCloud[];

  return (normalized.length ? Array.from(new Set(normalized)) : ['aws']) as CatalogCloud[];
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
