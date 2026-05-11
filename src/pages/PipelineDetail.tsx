import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, ExternalLink, Pencil, Trash2, Video, X } from 'lucide-react';
import { FAMILIES } from '../data/mock';
import { Button } from '../components/ui/Button';
import { DemoVideoModal } from '../components/media/DemoVideoModal';
import { deleteSubmission, getSubmission, type PipelineSubmission, statusConfig } from '../lib/pipeline';

export function PipelineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<PipelineSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoVideoOpen, setDemoVideoOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      const item = await Promise.race([
        getSubmission(id),
        new Promise<PipelineSubmission | null>((resolve) => window.setTimeout(() => resolve(null), 5000)),
      ]);

      if (!cancelled) {
        setSubmission(item);
        setIsLoading(false);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return <div className="py-24 text-center text-sm font-medium text-gray-500">Loading submission...</div>;
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-xl font-bold text-gray-900">Submission not found</h2>
        <p className="mt-2 max-w-md text-center text-sm text-gray-500">
          This submission may have been removed, or the database did not return the record. Go back to the pipeline and open it from the current list.
        </p>
        <Button className="mt-4" onClick={() => navigate('/pipeline')}>Back to Pipeline</Button>
      </div>
    );
  }

  const status = statusConfig[submission.status];
  const family = FAMILIES[submission.family] ?? FAMILIES.relay;
  const canEditOrDelete =
    submission.status === 'Published' && !submission.id.startsWith('SUB-');

  const handleDelete = async () => {
    if (!canEditOrDelete || !id) return;
    const confirmed = window.confirm(
      'Delete this published record? This removes the row from the database and deletes the demo video from Firebase Storage when it was uploaded here.',
    );
    if (!confirmed) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      await deleteSubmission(id);
      navigate('/pipeline');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-2 px-4 py-4 text-sm md:px-10">
        <button onClick={() => navigate('/pipeline')} className="font-medium text-sky-500 transition-colors hover:text-sky-600">Pipeline</button>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-900">{submission.name}</span>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-8 md:px-10">
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 font-mono text-xs font-semibold text-gray-500">
              {submission.id}
            </span>
            <span className="rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap" style={{ backgroundColor: status.bg, color: status.color }}>
              {status.label}
            </span>
            <span className="rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap" style={{ backgroundColor: family.bg, color: family.color }}>
              {family.name}
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-bold text-gray-600">
              {submission.category}
            </span>
          </div>

          <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {submission.name}
            </h1>
            {canEditOrDelete && (
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" className="gap-2" onClick={() => navigate(`/submit?published=${submission.id}`)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button type="button" variant="outline" className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50" disabled={isDeleting} onClick={() => void handleDelete()}>
                  <Trash2 className="h-4 w-4" /> {isDeleting ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            )}
          </div>

          {deleteError && (
            <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">{deleteError}</p>
          )}

          <p className="max-w-2xl text-base leading-relaxed text-gray-600">
            {submission.desc}
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-2">
            <Meta label="Submitter" value={submission.submitter} />
            <Meta label="Submitted" value={submission.date} />
            <Meta label="Signature Solution" value={submission.solution} />
            <Meta label="Maturity" value={submission.maturity} />
            <Meta label="Clouds" value={submission.clouds.join(', ')} />
            <Meta label="Owner Email" value={submission.ownerEmail ?? 'Not provided'} />
            {submission.repoUrl && <Meta label="Repository" value={submission.repoUrl} href={submission.repoUrl} />}
            {submission.demoUrl && <Meta label="Demo Link" value={submission.demoUrl} href={submission.demoUrl} />}
            {submission.videoUrl && (
              <div className="md:col-span-2 rounded-xl border border-gray-200 bg-sky-50/40 p-4">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">Demo video</div>
                <p className="mb-3 break-all font-mono text-[11px] leading-relaxed text-gray-700">{submission.videoUrl}</p>
                <Button type="button" size="sm" className="gap-2" onClick={() => setDemoVideoOpen(true)}>
                  <Video className="h-4 w-4" /> Play demo
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailCard title="Dependencies" value={submission.dependencies} />
            <DetailCard title="Prerequisites" value={submission.prerequisites} />
            <DetailCard title="Commands" value={submission.commands} code />
            <DetailCard title="Architectures" value={submission.architectures} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span className="h-2 w-2 rounded-full bg-sky-500" /> AI Review
              </h3>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${submission.aiScore >= 80 ? 'text-emerald-500' : submission.aiScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {submission.aiScore}
                </span>
                <span className="text-sm font-medium text-gray-400">/100</span>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
              {submission.aiFindings.map((finding, index) => {
                const isPass = finding.status === 'pass';
                const isWarn = finding.status === 'warn';

                return (
                  <div key={index} className="flex items-start gap-4 py-3">
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      isPass ? 'bg-emerald-100 text-emerald-600' :
                      isWarn ? 'bg-amber-100 text-amber-600' :
                      'bg-rose-100 text-rose-600'
                    }`}>
                      {isPass ? <Check className="h-3 w-3" /> : isWarn ? <AlertTriangle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{finding.category}</div>
                      <div className="mt-1 text-sm text-gray-600">{finding.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DemoVideoModal
            open={demoVideoOpen}
            url={submission.videoUrl ?? ''}
            title={submission.name}
            onClose={() => setDemoVideoOpen(false)}
          />

          {(submission.govReviewer || submission.status === 'Needs Changes') && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                <span className="h-2 w-2 rounded-full bg-purple-500" /> Manual Approval
              </h3>

              <div className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #8B5CF6, #0EA5E9)' }}>
                  {(submission.govReviewer ?? 'Approver').split(' ').map((word) => word[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{submission.govReviewer ?? 'Manual approver'}</div>
                  <div className="mt-1 text-sm leading-relaxed text-gray-600">
                    {submission.govNotes || 'Review comments should identify exactly what metadata, repo, demo, test evidence, or compliance evidence needs to change.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ title, value, code }: { title: string; value?: string; code?: boolean }) {
  const displayValue = value?.trim() || 'Not applicable';
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-gray-900">{title}</h3>
      {code ? (
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-200">{displayValue}</pre>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{displayValue}</p>
      )}
    </div>
  );
}

function Meta({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">{label}</div>
      {href ? (
        <a className="inline-flex max-w-full items-center gap-2 truncate text-sm font-semibold text-sky-600 hover:text-sky-700" href={href} target="_blank">
          <span className="truncate">{value}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      ) : (
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      )}
    </div>
  );
}
