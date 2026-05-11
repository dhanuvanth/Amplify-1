import { SUBS0 } from '../data/mock';
import { supabase } from './supabase';
import { deleteFirebaseObjectAtUrlIfOurs } from './storageDelete';

export type PipelineStatus =
  | 'Submitted'
  | 'AI Review'
  | 'Needs Changes'
  | 'Manual Approval'
  | 'Approved'
  | 'Published';

export type PipelineSubmission = {
  id: string;
  name: string;
  submitter: string;
  submitterInit: string;
  date: string;
  family: string;
  category: string;
  solution: string;
  desc: string;
  status: PipelineStatus;
  aiScore: number;
  ownerEmail?: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  clouds: string[];
  maturity: string;
  dependencies: string;
  prerequisites: string;
  commands: string;
  architectures: string;
  attachments: { label: string; url: string; type: string }[];
  aiFindings: { category: string; status: 'pass' | 'warn' | 'fail'; detail: string }[];
  govReviewer: string | null;
  govNotes: string;
};

type SubmissionRow = {
  id: string;
  asset_name: string;
  family_id: string;
  category?: string | null;
  solution?: string | null;
  author: string;
  author_initials: string;
  status: PipelineStatus;
  score?: number | null;
  description: string;
  owner_email?: string | null;
  repo_url?: string | null;
  demo_url?: string | null;
  video_url?: string | null;
  clouds?: string[] | null;
  maturity?: string | null;
  dependencies?: string | string[] | null;
  prerequisites?: string | string[] | null;
  commands?: string | string[] | null;
  architecture?: string | string[] | null;
  architectures?: string | string[] | null;
  quick_start?: string | string[] | null;
  attachments?: PipelineSubmission['attachments'] | string | null;
  gov_reviewer?: string | null;
  gov_notes?: string | null;
  submitted_at: string;
};

type MockSubmission = {
  id: string;
  name: string;
  submitter: string;
  submitterInit: string;
  date: string;
  family: string;
  category?: string;
  solution?: string;
  desc: string;
  status: string;
  aiScore: number;
  dependencies?: string;
  prerequisites?: string;
  commands?: string;
  architectures?: string;
  aiFindings?: { category: string; status: string; detail: string }[];
  govReviewer: string | null;
  govNotes: string;
};

const localKey = 'aimplify:new-ui-submissions';
const revisionNotesKey = 'aimplify:new-ui-revision-notes';

export const statusConfig: Record<PipelineStatus, { label: string; color: string; bg: string }> = {
  Submitted: { label: 'Submitted', color: '#64748B', bg: '#F8FAFC' },
  'AI Review': { label: 'AI Review', color: '#0EA5E9', bg: '#F0F9FF' },
  'Needs Changes': { label: 'Needs Changes', color: '#F59E0B', bg: '#FFFBEB' },
  'Manual Approval': { label: 'Manual Approval', color: '#8B5CF6', bg: '#F5F3FF' },
  Approved: { label: 'Approved', color: '#22C55E', bg: '#DCFCE7' },
  Published: { label: 'Published', color: '#059669', bg: '#ECFDF5' },
};

export const statusOptions: Array<PipelineStatus | 'All'> = [
  'All',
  'Submitted',
  'AI Review',
  'Needs Changes',
  'Manual Approval',
  'Approved',
  'Published',
];

export async function loadSubmissions(): Promise<PipelineSubmission[]> {
  const local = loadLocalSubmissions();

  if (!supabase) return local;

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error || !data?.length) return local;
  return (data as SubmissionRow[]).map(rowToSubmission);
}

export async function getSubmission(id: string): Promise<PipelineSubmission | null> {
  const local = loadLocalSubmissions();
  const localMatch = local.find((item) => item.id === id) ?? null;

  if (!supabase) return localMatch;

  const { data, error } = await supabase.from('submissions').select('*').eq('id', id).maybeSingle();
  if (error || !data) return localMatch;
  return rowToSubmission(data as SubmissionRow);
}

export async function createSubmission(input: Omit<PipelineSubmission, 'id' | 'date' | 'aiScore' | 'aiFindings' | 'govReviewer' | 'govNotes'>) {
  const optimistic: PipelineSubmission = {
    ...input,
    id: `local-${Date.now()}`,
    date: today(),
    aiScore: 68,
    dependencies: input.dependencies,
    prerequisites: input.prerequisites,
    commands: input.commands,
    architectures: input.architectures,
    aiFindings: defaultFindings(),
    govReviewer: null,
    govNotes: '',
  };

  if (!supabase) {
    saveLocalSubmission(optimistic);
    return optimistic;
  }

  const fullPayload = {
    asset_name: input.name,
    family_id: input.family,
    category: input.category,
    solution: input.solution,
    author: input.submitter,
    author_initials: input.submitterInit,
    status: input.status,
    score: 68,
    description: input.desc,
    owner_email: input.ownerEmail,
    repo_url: input.repoUrl,
    demo_url: input.demoUrl,
    video_url: input.videoUrl,
    clouds: input.clouds,
    maturity: input.maturity,
    dependencies: input.dependencies,
    prerequisites: input.prerequisites,
    commands: input.commands,
    architecture: input.architectures,
    architectures: input.architectures,
    attachments: input.attachments,
    submitted_at: today(),
  };

  const { data, error } = await supabase.from('submissions').insert(fullPayload).select().single();
  if (!error && data) return enrichSubmission(rowToSubmission(data as SubmissionRow), input);

  const { data: fallbackData, error: fallbackError } = await supabase
    .from('submissions')
    .insert({
      asset_name: input.name,
      family_id: input.family,
      author: input.submitter,
      author_initials: input.submitterInit,
      status: input.status,
      score: 68,
      description: input.desc,
      owner_email: input.ownerEmail,
      repo_url: input.repoUrl,
      demo_url: input.demoUrl,
      video_url: input.videoUrl,
      clouds: input.clouds,
      maturity: input.maturity,
      category: input.category,
      solution: input.solution,
      dependencies: input.dependencies,
      prerequisites: input.prerequisites,
      commands: input.commands,
      architecture: input.architectures,
      architectures: input.architectures,
      attachments: input.attachments,
      submitted_at: today(),
    })
    .select()
    .single();

  if (fallbackError) {
    saveLocalSubmission(optimistic);
    return optimistic;
  }

  const fallbackSubmission = enrichSubmission(rowToSubmission(fallbackData as SubmissionRow), input);
  saveLocalSubmission(fallbackSubmission);
  return fallbackSubmission;
}

export async function updateSubmissionStatus(id: string, status: PipelineStatus, revisionNote = '') {
  updateLocalStatus(id, status, revisionNote);
  if (revisionNote) saveLocalRevisionNote(id, revisionNote);
  if (!supabase) return;

  const payload = {
    status,
    ...(revisionNote ? { gov_notes: revisionNote, gov_reviewer: 'Manual approver' } : {}),
    ...(status === 'Approved' ? { approved_at: today() } : {}),
    ...(status === 'Published' ? { published_at: today() } : {}),
  };
  const { error } = await supabase.from('submissions').update(payload).eq('id', id);
  if (!error) return;

  const { error: fallbackError } = await supabase.from('submissions').update({ status }).eq('id', id);
  if (fallbackError) throw fallbackError;
}

/** Update a **Published** submission in place (status stays Published). Deletes prior Firebase video if URL changes or clears. */
export async function updatePublishedSubmission(
  id: string,
  input: Omit<PipelineSubmission, 'id' | 'date' | 'aiScore' | 'aiFindings' | 'govReviewer' | 'govNotes'>,
) {
  const existing = await getSubmission(id);
  if (!existing) throw new Error('Submission not found.');
  if (existing.status !== 'Published') {
    throw new Error('Only published submissions can be edited this way.');
  }

  const oldVideo = existing.videoUrl?.trim();
  const newVideo = input.videoUrl?.trim();
  if (oldVideo && oldVideo !== newVideo) {
    await deleteFirebaseObjectAtUrlIfOurs(oldVideo);
  }

  if (!supabase) {
    saveLocalSubmission({
      ...existing,
      ...input,
      id,
      status: 'Published',
      date: existing.date,
      aiScore: existing.aiScore,
      aiFindings: existing.aiFindings,
      govReviewer: existing.govReviewer,
      govNotes: existing.govNotes,
    });
    return;
  }

  const { error } = await supabase
    .from('submissions')
    .update({
      asset_name: input.name,
      family_id: input.family,
      category: input.category,
      solution: input.solution,
      author: input.submitter,
      author_initials: input.submitterInit,
      status: 'Published' as PipelineStatus,
      description: input.desc,
      owner_email: input.ownerEmail,
      repo_url: input.repoUrl,
      demo_url: input.demoUrl,
      video_url: newVideo || null,
      clouds: input.clouds,
      maturity: input.maturity,
      dependencies: input.dependencies,
      prerequisites: input.prerequisites,
      commands: input.commands,
      architecture: input.architectures,
      architectures: input.architectures,
      attachments: input.attachments,
    })
    .eq('id', id);

  if (error) throw error;
}

/** Delete submission row and remove demo video from Firebase Storage when URL points at our bucket. */
export async function deleteSubmission(id: string) {
  if (id.startsWith('SUB-')) {
    throw new Error('Sample pipeline records cannot be deleted.');
  }

  const existing = await getSubmission(id);
  if (!existing) throw new Error('Submission not found.');
  if (existing.status !== 'Published') {
    throw new Error('Only published submissions can be deleted from this screen.');
  }

  await deleteFirebaseObjectAtUrlIfOurs(existing.videoUrl);

  if (!supabase) {
    removeLocalSubmission(id);
    return;
  }

  const { error } = await supabase.from('submissions').delete().eq('id', id);
  if (error) throw error;
  removeLocalSubmission(id);
}

export async function updateSubmissionRevision(
  id: string,
  input: Omit<PipelineSubmission, 'id' | 'date' | 'aiScore' | 'aiFindings' | 'govReviewer' | 'govNotes'>,
) {
  const local = loadLocalSubmissions().find((item) => item.id === id);
  if (local) {
    saveLocalSubmission({
      ...local,
      ...input,
      id,
      date: today(),
      aiScore: local.aiScore,
      status: 'AI Review',
      aiFindings: local.aiFindings,
      govReviewer: null,
      govNotes: '',
    });
  }
  clearLocalRevisionNote(id);

  if (!supabase) return;

  const fullPayload = {
    asset_name: input.name,
    family_id: input.family,
    category: input.category,
    solution: input.solution,
    author: input.submitter,
    author_initials: input.submitterInit,
    status: 'AI Review' as PipelineStatus,
    description: input.desc,
    owner_email: input.ownerEmail,
    repo_url: input.repoUrl,
    demo_url: input.demoUrl,
    video_url: input.videoUrl,
    clouds: input.clouds,
    maturity: input.maturity,
    dependencies: input.dependencies,
    prerequisites: input.prerequisites,
    commands: input.commands,
    architecture: input.architectures,
    architectures: input.architectures,
    attachments: input.attachments,
    gov_notes: '',
    gov_reviewer: null,
  };

  const { error } = await supabase.from('submissions').update(fullPayload).eq('id', id);
  if (!error) return;

  const { error: fallbackError } = await supabase
    .from('submissions')
    .update({
      asset_name: input.name,
      family_id: input.family,
      author: input.submitter,
      author_initials: input.submitterInit,
      status: 'AI Review',
      description: input.desc,
    })
    .eq('id', id);

  if (fallbackError) throw fallbackError;

  saveLocalSubmission({
    ...input,
    id,
    date: today(),
    aiScore: local?.aiScore ?? 68,
    status: 'AI Review',
    aiFindings: local?.aiFindings ?? defaultFindings(),
    govReviewer: null,
    govNotes: '',
  });
}

export function loadLocalSubmissions(): PipelineSubmission[] {
  const stored = localStorage.getItem(localKey);
  const saved = stored ? (JSON.parse(stored) as PipelineSubmission[]) : [];
  return [...saved, ...SUBS0.map(mockToSubmission)];
}

function saveLocalSubmission(item: PipelineSubmission) {
  const saved = loadLocalSubmissions().filter((entry) => entry.id !== item.id && !entry.id.startsWith('SUB-'));
  localStorage.setItem(localKey, JSON.stringify([item, ...saved]));
}

function removeLocalSubmission(id: string) {
  const stored = localStorage.getItem(localKey);
  const saved = stored ? (JSON.parse(stored) as PipelineSubmission[]) : [];
  const next = saved.filter((entry) => entry.id !== id);
  localStorage.setItem(localKey, JSON.stringify(next));
}

function updateLocalStatus(id: string, status: PipelineStatus, revisionNote = '') {
  const saved = loadLocalSubmissions()
    .filter((entry) => !entry.id.startsWith('SUB-'))
    .map((entry) => (
      entry.id === id
        ? {
            ...entry,
            status,
            govReviewer: revisionNote ? 'Manual approver' : entry.govReviewer,
            govNotes: revisionNote,
          }
        : entry
    ));
  localStorage.setItem(localKey, JSON.stringify(saved));
}

function rowToSubmission(row: SubmissionRow): PipelineSubmission {
  return {
    id: row.id,
    name: row.asset_name,
    submitter: row.author,
    submitterInit: row.author_initials,
    date: row.submitted_at,
    family: row.family_id,
    category: row.category ?? 'Process Automation',
    solution: row.solution ?? 'Agent Orchestration',
    desc: row.description,
    status: row.status,
    aiScore: row.score ?? 68,
    ownerEmail: row.owner_email ?? undefined,
    repoUrl: row.repo_url ?? undefined,
    demoUrl: row.demo_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
    clouds: row.clouds ?? ['AWS'],
    maturity: row.maturity ?? 'Demo-ready',
    dependencies: normalizeDetail(row.dependencies),
    prerequisites: normalizeDetail(row.prerequisites),
    commands: normalizeDetail(row.commands ?? row.quick_start),
    architectures: normalizeDetail(row.architectures ?? row.architecture),
    attachments: normalizeAttachments(row.attachments),
    aiFindings: defaultFindings(),
    govReviewer: row.gov_reviewer ?? (row.status === 'Manual Approval' || row.status === 'Approved' ? 'Manual approver' : null),
    govNotes: row.gov_notes ?? getLocalRevisionNote(row.id) ?? (row.status === 'Needs Changes' ? 'Please update the requested metadata, links, demo evidence, and reusable asset details, then resubmit for AI Review.' : ''),
  };
}

function mockToSubmission(item: MockSubmission): PipelineSubmission {
  return {
    id: item.id,
    name: item.name,
    submitter: item.submitter,
    submitterInit: item.submitterInit,
    date: item.date,
    family: item.family,
    category: item.category ?? 'Process Automation',
    solution: item.solution ?? 'Agent Orchestration',
    desc: item.desc,
    status: mockStatusToStatus(item.status),
    aiScore: item.aiScore,
    ownerEmail: undefined,
    repoUrl: undefined,
    demoUrl: undefined,
    videoUrl: undefined,
    clouds: ['AWS'],
    maturity: 'Demo-ready',
    dependencies: item.dependencies ?? 'Not applicable',
    prerequisites: item.prerequisites ?? 'Not applicable',
    commands: item.commands ?? 'Not applicable',
    architectures: item.architectures ?? 'Not applicable',
    attachments: [],
    aiFindings: item.aiFindings?.map((finding) => ({
      ...finding,
      status: findingStatus(finding.status),
    })) ?? defaultFindings(),
    govReviewer: item.govReviewer,
    govNotes: item.govNotes,
  };
}

function mockStatusToStatus(status: string): PipelineStatus {
  if (status === 'remediation') return 'Needs Changes';
  if (status === 'governance') return 'Manual Approval';
  if (status === 'approved') return 'Approved';
  return 'AI Review';
}

function defaultFindings(): PipelineSubmission['aiFindings'] {
  return [
    { category: 'Security', status: 'warn', detail: 'Manual approver should confirm input sanitization and secret handling.' },
    { category: 'Documentation', status: 'pass', detail: 'Submission metadata captured for review.' },
    { category: 'Testing', status: 'warn', detail: 'Attach eval results or smoke test evidence before approval.' },
    { category: 'Cloud', status: 'pass', detail: 'Cloud compatibility declared by contributor.' },
    { category: 'Compliance', status: 'warn', detail: 'Audit logging and ownership need manual confirmation.' },
  ];
}

function enrichSubmission(
  saved: PipelineSubmission,
  input: Omit<PipelineSubmission, 'id' | 'date' | 'aiScore' | 'aiFindings' | 'govReviewer' | 'govNotes'>,
) {
  return {
    ...saved,
    name: input.name,
    family: input.family,
    category: input.category,
    solution: input.solution,
    desc: input.desc,
    ownerEmail: input.ownerEmail ?? saved.ownerEmail,
    repoUrl: input.repoUrl || saved.repoUrl,
    demoUrl: input.demoUrl || saved.demoUrl,
    videoUrl: input.videoUrl || saved.videoUrl,
    clouds: input.clouds?.length ? input.clouds : saved.clouds,
    maturity: input.maturity,
    status: input.status,
    dependencies: input.dependencies,
    prerequisites: input.prerequisites,
    commands: input.commands,
    architectures: input.architectures,
  };
}

function normalizeDetail(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) return value.length ? value.join('\n') : 'Not applicable';
  return value?.trim() || 'Not applicable';
}

function normalizeAttachments(value: SubmissionRow['attachments']): PipelineSubmission['attachments'] {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      return normalizeAttachments(JSON.parse(value) as SubmissionRow['attachments']);
    } catch {
      return value.trim() ? [{ label: 'Submitted attachment', url: value.trim(), type: 'Link' }] : [];
    }
  }
  if (!Array.isArray(value)) return [];

  return value
    .map((attachment) => ({
      label: attachment.label || 'Submitted attachment',
      url: attachment.url?.trim() || '',
      type: attachment.type || 'Link',
    }))
    .filter((attachment) => attachment.url);
}

function findingStatus(status: string): 'pass' | 'warn' | 'fail' {
  if (status === 'pass' || status === 'warn' || status === 'fail') return status;
  return 'warn';
}

function getLocalRevisionNotes(): Record<string, string> {
  const stored = localStorage.getItem(revisionNotesKey);
  return stored ? JSON.parse(stored) as Record<string, string> : {};
}

function getLocalRevisionNote(id: string) {
  return getLocalRevisionNotes()[id];
}

function saveLocalRevisionNote(id: string, note: string) {
  localStorage.setItem(revisionNotesKey, JSON.stringify({ ...getLocalRevisionNotes(), [id]: note }));
}

function clearLocalRevisionNote(id: string) {
  const notes = getLocalRevisionNotes();
  delete notes[id];
  localStorage.setItem(revisionNotesKey, JSON.stringify(notes));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
