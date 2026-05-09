import { useEffect, useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Info, PackagePlus } from 'lucide-react';
import { FAMILIES } from '../data/mock';
import { Button } from '../components/ui/Button';
import { createSubmission, getSubmission, updateSubmissionRevision } from '../lib/pipeline';

const categoryOptions = [
  'AI Context',
  'AI SDLC',
  'DataOps',
  'Master Data',
  'Process Automation',
  'Prompt Engineering',
  'Quality Engineering',
  'Security',
  'Infrastructure',
  'Managed AI Ops',
];

const maturityOptions = ['Experimental', 'Demo-ready', 'Validated', 'Battle-tested'];
const emptyFormData = {
  name: '',
  family: 'relay',
  category: 'Process Automation',
  solution: 'Customer Care Studio',
  ownerEmail: 'dhanuvanth.senthilkumar@infovision.com',
  repoUrl: '',
  demoUrl: '',
  videoUrl: '',
  maturity: 'Demo-ready',
  clouds: ['AWS', 'Azure'] as string[],
  attachmentUrl: '',
  desc: '',
  dependencies: [] as string[],
  prerequisites: [] as string[],
  commands: '',
  architectures: [] as string[],
};

export function Submit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const revisionId = searchParams.get('revision');
  const [isDone, setIsDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [formData, setFormData] = useState(emptyFormData);
  const [tagDrafts, setTagDrafts] = useState({
    clouds: '',
    dependencies: '',
    prerequisites: '',
    architectures: '',
  });

  useEffect(() => {
    if (!revisionId) {
      setFormData(emptyFormData);
      setRevisionNote('');
      return;
    }

    const activeRevisionId = revisionId;
    let cancelled = false;

    async function hydrateRevision() {
      const submission = await getSubmission(activeRevisionId);
      if (cancelled || !submission) return;

      setFormData({
        name: submission.name,
        family: submission.family,
        category: submission.category,
        solution: submission.solution,
        ownerEmail: submission.ownerEmail ?? emptyFormData.ownerEmail,
        repoUrl: submission.repoUrl ?? '',
        demoUrl: submission.demoUrl ?? '',
        videoUrl: submission.videoUrl ?? '',
        maturity: submission.maturity,
        clouds: submission.clouds.filter((cloud) => cloud !== 'Not applicable'),
        attachmentUrl: '',
        desc: submission.desc,
        dependencies: detailToTags(submission.dependencies),
        prerequisites: detailToTags(submission.prerequisites),
        commands: submission.commands === 'Not applicable' ? '' : submission.commands,
        architectures: detailToTags(submission.architectures),
      });
      setRevisionNote(submission.govNotes);
    }

    void hydrateRevision();

    return () => {
      cancelled = true;
    };
  }, [revisionId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;

    setIsSaving(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        family: formData.family,
        category: formData.category,
        solution: formData.solution,
        submitter: 'Dhanuvanth SenthilKumar',
        submitterInit: 'DS',
        status: 'Submitted' as const,
        desc: formData.desc.trim(),
        ownerEmail: formData.ownerEmail,
        repoUrl: formData.repoUrl,
        demoUrl: formData.demoUrl,
        videoUrl: formData.videoUrl,
        clouds: tagListOrNotApplicableArray(formData.clouds),
        maturity: formData.maturity,
        dependencies: tagListOrNotApplicable(formData.dependencies),
        prerequisites: tagListOrNotApplicable(formData.prerequisites),
        commands: notApplicable(formData.commands),
        architectures: tagListOrNotApplicable(formData.architectures),
        attachments: [],
      };
      if (revisionId) {
        await updateSubmissionRevision(revisionId, payload);
      } else {
        await createSubmission(payload);
      }
      setIsDone(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : revisionId ? 'Unable to resubmit this asset.' : 'Unable to submit this asset.');
    } finally {
      setIsSaving(false);
    }
  };

  const setField = (key: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const addTags = (key: keyof typeof tagDrafts, rawValue = tagDrafts[key]) => {
    const nextItems = rawValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (!nextItems.length) return;
    setFormData((current) => ({
      ...current,
      [key]: [...current[key], ...nextItems.filter((item) => !current[key].includes(item))],
    }));
    setTagDrafts((current) => ({ ...current, [key]: '' }));
  };

  const removeTag = (key: keyof typeof tagDrafts, tag: string) => {
    setFormData((current) => ({
      ...current,
      [key]: current[key].filter((item) => item !== tag),
    }));
  };

  const onTagKeyDown = (event: KeyboardEvent<HTMLInputElement>, key: keyof typeof tagDrafts) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTags(key);
    }
    if (event.key === ',') {
      event.preventDefault();
      addTags(key);
    }
  };

  const setFamily = (family: string) => {
    setFormData((current) => ({ ...current, family }));
  };

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.desc.trim().length > 0 &&
    formData.clouds.length > 0;

  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 animate-in fade-in zoom-in duration-500">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 shadow-sm ring-8 ring-emerald-50">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">{revisionId ? 'Resubmitted Successfully' : 'Submitted Successfully'}</h2>
        <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-gray-500">
          {revisionId
            ? 'The contribution has been sent back to AI Review with your corrections.'
            : 'The contribution is now in the pipeline. It will move through AI Review, Manual Approval, approval, and publishing.'}
        </p>
        <Button onClick={() => navigate('/pipeline')} size="lg" className="gap-2">
          View Pipeline <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-2 px-4 py-4 text-sm md:px-10">
        <button onClick={() => navigate('/pipeline')} className="font-medium text-sky-500 transition-colors hover:text-sky-600">Pipeline</button>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-900">{revisionId ? 'Revise Asset' : 'Submit Asset'}</span>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-12 md:px-10">
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 px-6 py-7 text-white md:px-8">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-200">
              <PackagePlus className="h-4 w-4" /> Contribution Intake
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{revisionId ? 'Revise Asset Submission' : 'Submit a New Asset'}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              {revisionId
                ? 'Update the requested metadata, links, and reusable asset details, then resubmit for AI Review.'
                : 'Capture the metadata required for AI review, manual approval, and organization-wide publishing.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 md:p-8">
            {revisionId && revisionNote && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="text-sm font-bold text-amber-700">Revision instructions from approver</div>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">{revisionNote}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Asset Name" required>
                <input
                  value={formData.name}
                  onChange={(event) => setField('name', event.target.value)}
                  placeholder="e.g. Invoice Extraction Pipeline"
                  className="field-input"
                  required
                />
              </Field>

              <Field label="Platform Family" required>
                <select value={formData.family} onChange={(event) => setFamily(event.target.value)} className="field-input" required>
                  {Object.entries(FAMILIES).map(([key, family]) => (
                    <option key={key} value={key}>
                      {family.name} - {family.tagline}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Category">
                <select value={formData.category} onChange={(event) => setField('category', event.target.value)} className="field-input">
                  {categoryOptions.map((category) => <option key={category}>{category}</option>)}
                </select>
              </Field>

              <Field label="Signature Solution">
                <input
                  value={formData.solution}
                  onChange={(event) => setField('solution', event.target.value)}
                  placeholder="e.g. Document Intelligence, Customer Care Studio"
                  className="field-input"
                />
              </Field>

              <Field label="Owner Email">
                <input value={formData.ownerEmail} onChange={(event) => setField('ownerEmail', event.target.value)} className="field-input" />
              </Field>

              <Field label="Maturity">
                <select value={formData.maturity} onChange={(event) => setField('maturity', event.target.value)} className="field-input">
                  {maturityOptions.map((maturity) => <option key={maturity}>{maturity}</option>)}
                </select>
              </Field>

              <Field label="Cloud Compatibility">
                <TagInput
                  value={formData.clouds}
                  draft={tagDrafts.clouds}
                  onDraftChange={(value) => setTagDrafts((current) => ({ ...current, clouds: value }))}
                  onKeyDown={(event) => onTagKeyDown(event, 'clouds')}
                  onAdd={() => addTags('clouds')}
                  onRemove={(tag) => removeTag('clouds', tag)}
                  placeholder="e.g. AWS, Azure, GCP, On-prem"
                />
              </Field>

              <Field label="Repository Link">
                <input value={formData.repoUrl} onChange={(event) => setField('repoUrl', event.target.value)} placeholder="https://github.com/..." className="field-input" />
              </Field>

              <Field label="Demo Link">
                <input value={formData.demoUrl} onChange={(event) => setField('demoUrl', event.target.value)} placeholder="Paste the live demo, app, or hosted experience link" className="field-input" />
              </Field>

              <Field label="Video Link" wide>
                <input value={formData.videoUrl} onChange={(event) => setField('videoUrl', event.target.value)} placeholder="Paste the walkthrough, demo recording, or explainer video link" className="field-input" />
              </Field>

              <Field label="Description" required wide>
                <textarea
                  value={formData.desc}
                  onChange={(event) => setField('desc', event.target.value)}
                  placeholder="What does it do? Which signature solution does it support? What can delivery teams reuse?"
                  rows={5}
                  className="field-input resize-y"
                  required
                />
              </Field>

              <Field label="Dependencies" wide>
                <TagInput
                  value={formData.dependencies}
                  draft={tagDrafts.dependencies}
                  onDraftChange={(value) => setTagDrafts((current) => ({ ...current, dependencies: value }))}
                  onKeyDown={(event) => onTagKeyDown(event, 'dependencies')}
                  onAdd={() => addTags('dependencies')}
                  onRemove={(tag) => removeTag('dependencies', tag)}
                  placeholder="List required assets, libraries, platforms, or enter Not applicable"
                />
              </Field>

              <Field label="Prerequisites" wide>
                <TagInput
                  value={formData.prerequisites}
                  draft={tagDrafts.prerequisites}
                  onDraftChange={(value) => setTagDrafts((current) => ({ ...current, prerequisites: value }))}
                  onKeyDown={(event) => onTagKeyDown(event, 'prerequisites')}
                  onAdd={() => addTags('prerequisites')}
                  onRemove={(tag) => removeTag('prerequisites', tag)}
                  placeholder="List setup requirements, access, tools, credentials, or enter Not applicable"
                />
              </Field>

              <Field label="Commands" wide>
                <textarea
                  value={formData.commands}
                  onChange={(event) => setField('commands', event.target.value)}
                  placeholder="Paste install, setup, run, or deploy commands. Leave blank for Not applicable."
                  rows={4}
                  className="field-input resize-y font-mono"
                />
              </Field>

              <Field label="Architectures" wide>
                <TagInput
                  value={formData.architectures}
                  draft={tagDrafts.architectures}
                  onDraftChange={(value) => setTagDrafts((current) => ({ ...current, architectures: value }))}
                  onKeyDown={(event) => onTagKeyDown(event, 'architectures')}
                  onAdd={() => addTags('architectures')}
                  onRemove={(tag) => removeTag('architectures', tag)}
                  placeholder="Describe architecture flow, components, services, or enter Not applicable"
                />
              </Field>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-sky-900">
                <Info className="h-4 w-4 text-sky-500" /> Review path
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {['Submitted', 'AI Review', 'Manual Approval', 'Approved', 'Published'].map((step, index) => (
                  <span key={step} className={`rounded-full border px-3 py-1 text-xs font-bold ${index === 0 ? 'border-sky-200 bg-white text-sky-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                    {step}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {['Security & sanitization', 'Documentation', 'Test coverage & evals', 'Cloud-native deploy', 'Code quality', 'Compliance & logging', 'Dependency health'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-medium text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>}

            <div className="pt-2">
              <Button type="submit" size="lg" disabled={!isFormValid || isSaving} className="w-full px-10 sm:w-auto">
                {isSaving ? (revisionId ? 'Resubmitting...' : 'Submitting...') : revisionId ? 'Resubmit for AI Review' : 'Submit for Review'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function notApplicable(value: string) {
  return value.trim() || 'Not applicable';
}

function tagListOrNotApplicable(value: string[]) {
  return value.length ? value.join('\n') : 'Not applicable';
}

function tagListOrNotApplicableArray(value: string[]) {
  return value.length ? value : ['Not applicable'];
}

function detailToTags(value: string) {
  if (!value || value.trim().toLowerCase() === 'not applicable') return [];
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function TagInput({
  value,
  draft,
  placeholder,
  onDraftChange,
  onKeyDown,
  onAdd,
  onRemove,
}: {
  value: string[];
  draft: string;
  placeholder: string;
  onDraftChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
}) {
  return (
    <div className="min-h-24 rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-all focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
            {tag}
            <button type="button" className="text-sky-400 hover:text-sky-700" onClick={() => onRemove(tag)} aria-label={`Remove ${tag}`}>
              x
            </button>
          </span>
        ))}
        <input
          value={draft}
          onBlur={onAdd}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={value.length ? 'Type and press Enter...' : placeholder}
          className="min-w-52 flex-1 border-0 bg-transparent px-2 py-1.5 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`space-y-2 ${wide ? 'md:col-span-2' : ''}`}>
      <span className="text-sm font-bold text-gray-900">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}
