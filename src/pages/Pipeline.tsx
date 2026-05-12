import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, FileCheck2, Plus, RotateCcw, Send } from 'lucide-react';
import { defaultFamilyBadge, useFamilies } from '../context/FamiliesContext';
import { Button } from '../components/ui/Button';
import {
  loadSubmissions,
  type PipelineStatus,
  type PipelineSubmission,
  statusConfig,
  statusOptions,
  updateSubmissionStatus,
} from '../lib/pipeline';

export function Pipeline() {
  const navigate = useNavigate();
  const { families } = useFamilies();
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | 'All'>('All');
  const [submissions, setSubmissions] = useState<PipelineSubmission[]>([]);
  const [revisionDrafts, setRevisionDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const items = await loadSubmissions();
      if (!cancelled) setSubmissions(items);
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSubs = useMemo(
    () => statusFilter === 'All' ? submissions : submissions.filter((submission) => submission.status === statusFilter),
    [statusFilter, submissions],
  );

  const setStatus = async (id: string, status: PipelineStatus, revisionNote = '') => {
    setSubmissions((current) => current.map((item) => (
      item.id === id
        ? {
            ...item,
            status,
            govReviewer: revisionNote ? 'Manual approver' : item.govReviewer,
            govNotes: revisionNote,
          }
        : item
    )));
    try {
      await updateSubmissionStatus(id, status, revisionNote);
      if (revisionNote) setRevisionDrafts((current) => ({ ...current, [id]: '' }));
      setError('');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update status.');
    }
  };

  const openSubmission = (submission: PipelineSubmission) => {
    navigate(submission.status === 'Needs Changes' ? `/submit?revision=${submission.id}` : `/pipeline/${submission.id}`);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col justify-between gap-4 px-4 py-8 md:flex-row md:items-end md:px-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Contribution Pipeline</h1>
          <p className="mt-1 text-sm text-gray-500">
            Submitted → AI Review → Manual Approval → Approved → Published
          </p>
        </div>
        <Button onClick={() => navigate('/submit')} className="gap-2">
          <Plus className="h-4 w-4" /> Submit
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-6 md:px-10">
        {statusOptions.map((status) => {
          const active = statusFilter === status;
          const config = status === 'All' ? { label: 'All', color: '#64748B', bg: '#F8FAFC' } : statusConfig[status];
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
              style={active ? { backgroundColor: config.bg, color: config.color, borderColor: `${config.color}30` } : { borderColor: '#E5E7EB', backgroundColor: '#fff', color: '#4B5563' }}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mx-4 mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 md:mx-10">
          Supabase notice: {error}
        </div>
      )}

      <div className="flex max-w-6xl flex-col gap-3 px-4 md:px-10">
        {filteredSubs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
            No submissions found for the selected status.
          </div>
        ) : (
          filteredSubs.map((submission, index) => {
            const status = statusConfig[submission.status];
            const family = families[submission.family] ?? defaultFamilyBadge();

            return (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
                onClick={() => openSubmission(submission)}
                className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all"
              >
                <div className="flex items-start gap-4 md:gap-6">
                  <div
                    className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm md:flex"
                    style={{ background: `linear-gradient(135deg, ${family.color}, ${status.color})` }}
                  >
                    {submission.submitterInit}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-gray-900">{submission.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{submission.submitter}</span>
                      <span>·</span>
                      <span>{submission.date}</span>
                      <span>·</span>
                      <span className="font-semibold" style={{ color: family.color }}>{family.name}</span>
                      <span>·</span>
                      <span>{submission.category}</span>
                    </div>
                    <WorkflowPills current={submission.status} />
                    {submission.status === 'Needs Changes' && <NeedsChangesNote submission={submission} />}
                  </div>

                  <div className="hidden min-w-[60px] flex-col items-center justify-center md:flex">
                    <div className={`text-lg font-bold ${submission.aiScore >= 80 ? 'text-emerald-500' : submission.aiScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {submission.aiScore}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Score</div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap" style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.label}
                    </div>
                    <PipelineActions
                      submission={submission}
                      revisionDraft={revisionDrafts[submission.id] ?? ''}
                      onRevisionDraftChange={(value) => setRevisionDrafts((current) => ({ ...current, [submission.id]: value }))}
                      onOpenRevision={() => navigate(`/submit?revision=${submission.id}`)}
                      onStatusChange={setStatus}
                    />
                  </div>

                  <ArrowRight className="mt-2 h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function WorkflowPills({ current }: { current: PipelineStatus }) {
  const steps: PipelineStatus[] = ['Submitted', 'AI Review', 'Manual Approval', 'Approved', 'Published'];
  const currentIndex = steps.indexOf(current);
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {steps.map((step, index) => {
        const done = current === 'Needs Changes' ? index <= 1 : index <= currentIndex;
        return (
          <span key={step} className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${done ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-gray-200 bg-white text-gray-600'}`}>
            {step}
          </span>
        );
      })}
    </div>
  );
}

function NeedsChangesNote({ submission }: { submission: PipelineSubmission }) {
  return (
    <div className="mt-3 max-w-xl rounded-lg border border-amber-200 bg-amber-50 p-3">
      <div className="text-xs font-bold text-amber-600">Revision instructions</div>
      <p className="mt-1 text-xs leading-relaxed text-gray-600">
        {submission.govNotes || 'The manual approver has requested changes. Open this submission, update the required fields, and resubmit it to AI Review.'}
      </p>
    </div>
  );
}

function PipelineActions({
  submission,
  revisionDraft,
  onRevisionDraftChange,
  onOpenRevision,
  onStatusChange,
}: {
  submission: PipelineSubmission;
  revisionDraft: string;
  onRevisionDraftChange: (value: string) => void;
  onOpenRevision: () => void;
  onStatusChange: (id: string, status: PipelineStatus, revisionNote?: string) => void;
}) {
  const stop = (event: MouseEvent, status: PipelineStatus) => {
    event.stopPropagation();
    void onStatusChange(submission.id, status);
  };

  const sendRevision = (event: MouseEvent) => {
    event.stopPropagation();
    const note = revisionDraft.trim();
    if (!note) return;
    void onStatusChange(submission.id, 'Needs Changes', note);
  };

  if (submission.status === 'Submitted') {
    return <Button size="sm" variant="outline" className="gap-2 whitespace-nowrap" onClick={(event) => stop(event, 'AI Review')}><Send className="h-3.5 w-3.5" /> Start AI Review</Button>;
  }

  if (submission.status === 'AI Review') {
    return <Button size="sm" variant="outline" className="gap-2 whitespace-nowrap" onClick={(event) => stop(event, 'Manual Approval')}><Send className="h-3.5 w-3.5" /> Manual Approval</Button>;
  }

  if (submission.status === 'Manual Approval') {
    return (
      <div className="w-64 space-y-2">
        <textarea
          value={revisionDraft}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onRevisionDraftChange(event.target.value)}
          placeholder="Tell the contributor exactly what to change before approval."
          rows={3}
          className="w-full rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs font-medium leading-relaxed text-gray-700 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
        />
        <div className="flex flex-wrap justify-end gap-2">
          <Button size="sm" variant="outline" disabled={!revisionDraft.trim()} onClick={sendRevision}>Send Revision</Button>
          <Button size="sm" className="gap-2" onClick={(event) => stop(event, 'Approved')}><Check className="h-3.5 w-3.5" /> Approve</Button>
        </div>
      </div>
    );
  }

  if (submission.status === 'Needs Changes') {
    return (
      <Button
        size="sm"
        variant="outline"
        className="gap-2 whitespace-nowrap"
        onClick={(event) => {
          event.stopPropagation();
          onOpenRevision();
        }}
      >
        <RotateCcw className="h-3.5 w-3.5" /> Revise
      </Button>
    );
  }

  if (submission.status === 'Approved') {
    return <Button size="sm" className="gap-2 whitespace-nowrap" onClick={(event) => stop(event, 'Published')}><FileCheck2 className="h-3.5 w-3.5" /> Publish</Button>;
  }

  return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600"><FileCheck2 className="h-3.5 w-3.5" /> Organization-visible</span>;
}
