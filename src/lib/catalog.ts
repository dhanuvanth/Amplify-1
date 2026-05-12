import { supabase } from './supabase';
import {
  getSubmission,
  loadLocalSubmissions,
  loadSubmissions,
  rowToSubmission,
  type PipelineSubmission,
  type SubmissionRow,
} from './pipeline';

export type CatalogFamily = 'atlas' | 'forge' | 'relay' | 'sentinel' | 'nexus';
export type CatalogCloud = 'aws' | 'gcp' | 'azure';
export type CatalogMaturity = 'experimental' | 'validated' | 'battle-tested';
export type CatalogEffort = 'low' | 'medium' | 'high';

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

const ARCH_COLORS = ['blue', 'purple', 'orange', 'green'] as const;

const CATALOG_CODE_RE = /\bCatalog id\s+([A-Z]{2,4}-\d{3})\b/i;

/** Only submissions that have cleared the pipeline appear in the public catalog. */
function isPublishedCatalogSubmission(submission: PipelineSubmission): boolean {
  return submission.status === 'Published';
}

function extractCatalogCodeFromGovNotes(govNotes: string | undefined): string | undefined {
  if (!govNotes?.trim()) return undefined;
  const m = govNotes.match(CATALOG_CODE_RE);
  return m?.[1];
}

function compareSubmissionDate(a: PipelineSubmission, b: PipelineSubmission) {
  return (b.date || '').localeCompare(a.date || '');
}

/**
 * Public catalog: **Published** pipeline submissions only (not draft `assets` rows).
 * Home, family counts, and catalog browse all use this.
 */
export async function loadCatalogAssets(): Promise<CatalogAsset[]> {
  const submissions = await loadSubmissions();
  const published = submissions.filter(isPublishedCatalogSubmission).sort(compareSubmissionDate);
  return published.map((submission, index) => submissionToAsset(submission, index));
}

/**
 * Resolve a catalog asset by **submission UUID** or legacy **catalog code** (e.g. ATL-001) when
 * `gov_notes` contains `Catalog id ATL-001` (seed / import convention).
 */
export async function getCatalogAsset(id: string): Promise<CatalogAsset | null> {
  const trimmed = id?.trim();
  if (!trimmed) return null;

  const byId = await getSubmission(trimmed);
  if (byId?.status === 'Published') {
    return submissionToAsset(byId, 0);
  }

  if (/^[A-Z]{2,4}-\d{3}$/i.test(trimmed)) {
    const code = trimmed.toUpperCase();
    if (supabase) {
      const { data: byNote, error: noteErr } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'Published')
        .ilike('gov_notes', `%Catalog id ${code}%`)
        .limit(1)
        .maybeSingle();

      if (!noteErr && byNote) {
        return submissionToAsset(rowToSubmission(byNote as SubmissionRow), 0);
      }
    } else {
      const local = loadLocalSubmissions().filter(isPublishedCatalogSubmission);
      const byNote = local.find((submission) => submission.govNotes?.includes(`Catalog id ${code}`));
      if (byNote) return submissionToAsset(byNote, 0);
    }
  }

  return null;
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

  const fromGov = extractCatalogCodeFromGovNotes(submission.govNotes);
  const displayId = fromGov ?? `${familyPrefix(family)}-${String(index + 1).padStart(3, '0')}`;

  return {
    id: submission.id,
    displayId,
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
    archColors: architecture.map((_, i) => ARCH_COLORS[i % 4]),
    quickStart: normalizeText(submission.commands),
    prerequisites,
    dependencies,
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
