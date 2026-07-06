// Create guide page: redesigned to match the reference layout while
// staying inside the StudySync dark theme.
//
// Structure (top -> bottom):
//   1. Hero header ("Studying starts here")
//   2. "From your notes" card with textarea + Generate button
//   3. Skill-chip row above the textarea (clicking fills the textarea)
//   4. "From your documents" card with PDF dropzone
//
// All behavior (text-mode vs pdf-mode validation, API calls, navigation)
// is preserved -- this is a pure UI rebuild.

import { useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { guidesApi, getErrorMessage } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';

const MAX_PDF_BYTES = 30 * 1024 * 1024;

// Sample prompts that prefill the textarea. Matches the chip row in the
// reference design. Clicking a chip swaps the textarea contents.
const SKILL_CHIPS: { label: string; prompt: string }[] = [
  {
    label: 'Study notes',
    prompt:
      'Paste your class notes here and the AI will turn them into a structured guide with key concepts, definitions, and a quick quiz at the end.',
  },
  {
    label: 'Textbook chapter',
    prompt:
      'Paste a chapter from your textbook and the AI will summarize each section, extract the main ideas, and build flashcards for the most important terms.',
  },
  {
    label: 'Lecture slides',
    prompt:
      'Paste the text from your lecture slides and the AI will organize them into a clean study guide with headings, examples, and review questions.',
  },
  {
    label: 'Article',
    prompt:
      'Paste an article or blog post and the AI will pull out the main argument, supporting evidence, and a short summary you can revise from.',
  },
  {
    label: 'Research paper',
    prompt:
      'Paste a research paper and the AI will extract the abstract, methodology, key findings, and limitations in a scannable format.',
  },
  {
    label: 'Cheat sheet',
    prompt:
      'Paste any reference material and the AI will compress it into a one-page cheat sheet of formulas, terms, and must-remember facts.',
  },
];

export default function CreateGuidePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const validateFile = (f: File): string | null => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF files are supported.';
    }
    if (f.size > MAX_PDF_BYTES) {
      return `File is ${(f.size / 1024 / 1024).toFixed(1)} MB. Max allowed is 30 MB.`;
    }
    if (f.size === 0) {
      return 'File is empty.';
    }
    return null;
  };

  const handleFileChosen = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    const err = validateFile(f);
    if (err) {
      toast(err, 'error');
      return;
    }
    setFile(f);
  };

  const handleChipClick = (label: string, prompt: string) => {
    setActiveChip(label);
    setText(prompt);
  };

  const submitText = async () => {
    if (text.trim().length < 100) {
      toast('Please paste at least 100 characters of real material.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await guidesApi.createFromText(text, title || undefined);
      toast('Guide created!', 'success');
      navigate(`/guides/${res.guide.id}`);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitPdf = async () => {
    if (!file) {
      toast('Please choose a PDF file first.', 'warning');
      return;
    }
    setSubmitting(true);
    setUploadPct(null);
    try {
      const res = await guidesApi.createFromPdf(file, title || undefined, setUploadPct);
      toast('Guide created from PDF!', 'success');
      navigate(`/guides/${res.guide.id}`);
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
      setUploadPct(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="text-center pt-4 pb-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-text">
          Studying starts here
        </h1>
        <p className="text-text-muted mt-2">
          Paste your notes or drop a document — StudySync turns it into a
          structured guide, summary, and quiz.
        </p>
      </div>

      {/* ----- From your notes ----- */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-accent-blue/15 text-accent-blue">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </span>
          <h2 className="text-lg font-semibold text-text">From your notes</h2>
        </div>

        <p className="text-sm text-text-muted mb-3">
          Pick a starting point, or just paste anything you want to study.
        </p>

        {/* Skill-chip row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SKILL_CHIPS.map((chip) => {
            const isActive = activeChip === chip.label;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipClick(chip.label, chip.prompt)}
                className={clsx(
                  'inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium border transition-all duration-150',
                  isActive
                    ? 'bg-accent-purple/15 text-text border-accent-purple/50 shadow-glow'
                    : 'bg-bg-hover text-text-muted border-bg-hover hover:text-text hover:border-accent-blue/40',
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your lecture notes, textbook chapter, article, or any text you want to study..."
          className={clsx(
            'w-full rounded bg-bg border border-bg-hover px-4 py-3 text-text placeholder:text-text-dim',
            'focus:outline-none focus:border-accent-purple/60 focus:ring-1 focus:ring-accent-purple/30 transition-colors',
            'min-h-[200px] resize-y',
          )}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-text-muted">{text.length} characters</p>
          <Button
            onClick={submitText}
            loading={submitting && uploadPct === null}
            size="md"
          >
            {submitting && uploadPct === null ? 'Generating...' : 'Generate guide'}
          </Button>
        </div>
      </Card>

      {/* ----- From your documents ----- */}
      <div className="relative rounded bg-bg-card p-[1px] shadow-card">
        <div className="absolute inset-0 rounded bg-gradient-primary opacity-30" aria-hidden />
        <div className="relative rounded bg-bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-accent-purple/15 text-accent-purple">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
            <h2 className="text-lg font-semibold text-text">From your documents</h2>
          </div>

          <p className="text-sm text-text-muted mb-4">
            Drop a PDF — including scanned ones — and we'll extract the text and
            build the guide for you.
          </p>

          <label
            onDragOver={(e: DragEvent) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e: DragEvent) => {
              e.preventDefault();
              setDragActive(false);
              handleFileChosen(e.dataTransfer.files?.[0] ?? null);
            }}
            className={clsx(
              'border-2 border-dashed rounded p-8 text-center transition-colors cursor-pointer block',
              dragActive
                ? 'border-accent-purple bg-accent-purple/5'
                : 'border-bg-hover hover:border-accent-blue/40',
            )}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <DocIcon kind="pdf" />
              <DocIcon kind="word" />
              <DocIcon kind="ppt" />
            </div>
            <p className="text-text font-medium">Drop your PDF here, or click to browse</p>
            <p className="text-sm text-text-muted mt-1">PDF — up to 30 MB</p>
            {file && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded bg-bg-hover text-sm">
                <svg className="h-4 w-4 text-accent-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-text">{file.name}</span>
                <span className="text-text-muted">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                  className="ml-1 text-text-muted hover:text-status-danger"
                  aria-label="Remove file"
                >
                  ×
                </button>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept="application/pdf,.pdf"
              onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
            />
          </label>

          {submitting && uploadPct !== null && (
            <div className="mt-4">
              <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-200"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
              <p className="text-xs text-text-muted mt-2 text-center">
                Uploading… {uploadPct}%
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-text-muted">
              Tip: scanned PDFs work too — OCR runs automatically.
            </p>
            <Button
              onClick={submitPdf}
              loading={submitting && uploadPct !== null}
              size="md"
            >
              {submitting && uploadPct !== null ? 'Generating...' : 'Generate from document'}
            </Button>
          </div>
        </div>
      </div>

      {/* Optional title */}
      <Card>
        <Input
          label="Guide title (optional)"
          placeholder="Auto-generated from your content if left blank"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Card>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
      </div>
    </div>
  );
}

// Small "document type" icon used in the upload card header. These mirror
// the PDF/Word/PPT icons in the reference design.
function DocIcon({ kind }: { kind: 'pdf' | 'word' | 'ppt' }) {
  const label = kind.toUpperCase();
  const ring =
    kind === 'pdf'
      ? 'border-status-danger/40 text-status-danger'
      : kind === 'word'
        ? 'border-accent-blue/40 text-accent-blue'
        : 'border-accent-purple/40 text-accent-purple';
  return (
    <span
      className={clsx(
        'inline-flex h-9 w-9 items-center justify-center rounded border bg-bg text-[10px] font-bold tracking-wider',
        ring,
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
