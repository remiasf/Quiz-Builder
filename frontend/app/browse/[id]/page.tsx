'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { quizService, type Quiz, type Question } from '../../services/quizService';

type Params = Promise<{ id: string }>;
type Mode = 'preview' | 'active' | 'done';
type Answers = Record<string, string | string[] | null>;

// ─── Answer inputs ────────────────────────────────────────────────────────────

function BooleanInput({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
	return (
		<div className="flex gap-3">
			{['Yes', 'No'].map((opt) => (
				<button
					key={opt}
					type="button"
					onClick={() => onChange(opt)}
					className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
						value === opt
							? 'border-cyan-500 bg-cyan-50 text-cyan-700'
							: 'border-gray-200 bg-white text-gray-600 hover:border-cyan-300'
					}`}
				>
					{opt}
				</button>
			))}
		</div>
	);
}

function InputAnswer({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	return (
		<input
			type="text"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder="Type your answer…"
			className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-0 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
		/>
	);
}

function CheckboxAnswer({
	options,
	value,
	onChange,
}: {
	options: string[];
	value: string[];
	onChange: (v: string[]) => void;
}) {
	function toggle(opt: string) {
		onChange(value.includes(opt) ? value.filter((o) => o !== opt) : [...value, opt]);
	}
	return (
		<div className="flex flex-col gap-2">
			{options.map((opt) => {
				const checked = value.includes(opt);
				return (
					<button
						key={opt}
						type="button"
						onClick={() => toggle(opt)}
						className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
							checked
								? 'border-cyan-500 bg-cyan-50 text-cyan-700'
								: 'border-gray-200 bg-white text-gray-700 hover:border-cyan-300'
						}`}
					>
						<span
							className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
								checked ? 'border-cyan-500 bg-cyan-500' : 'border-gray-300'
							}`}
						>
							{checked && (
								<svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
									<path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							)}
						</span>
						{opt}
					</button>
				);
			})}
		</div>
	);
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function QuizPage({ params }: { params: Params }) {
	const { id } = use(params);

	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [mode, setMode] = useState<Mode>('preview');
	const [answers, setAnswers] = useState<Answers>({});
	const [currentQ, setCurrentQ] = useState(0);
	const [starting, setStarting] = useState(false);

	useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				const data = await quizService.getQuizById(id);
				if (!cancelled) setQuiz(data);
			} catch {
				if (!cancelled) setError('Quiz not found or the backend is unreachable.');
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => { cancelled = true; };
	}, [id]);

	async function handleStart() {
		if (!quiz) return;
		setStarting(true);
		try {
			await quizService.startQuiz(quiz.id);
		} catch {
			// non-critical — proceed regardless
		} finally {
			setStarting(false);
		}
		const init: Answers = {};
		for (const q of quiz.questions) {
			init[q.id] = q.type === 'CHECKBOX' ? [] : null;
		}
		setAnswers(init);
		setCurrentQ(0);
		setMode('active');
	}

	function setAnswer(qId: string, value: string | string[] | null) {
		setAnswers((prev) => ({ ...prev, [qId]: value }));
	}

	// ─── Loading ──────────────────────────────────────────────────────────────
	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-white">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
			</main>
		);
	}

	if (error || !quiz) {
		return (
			<main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
				<p className="text-lg font-semibold text-red-600">{error ?? 'Something went wrong.'}</p>
				<Link href="/browse" className="text-sm font-medium text-cyan-600 hover:underline">
					← Back to browse
				</Link>
			</main>
		);
	}

	// ─── Done ─────────────────────────────────────────────────────────────────
	if (mode === 'done') {
		return (
			<main className="relative min-h-screen overflow-hidden bg-white text-gray-900">
				<div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
				<div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-200/70 blur-3xl" />
				<div className="relative mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
					<div className="w-full rounded-3xl border border-gray-200 bg-white/80 p-10 shadow-xl backdrop-blur-xl">
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
							🎉
						</div>
						<h1 className="text-3xl font-black text-gray-900">Quiz complete!</h1>
						<p className="mt-3 text-gray-500">
							You answered {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}.
						</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
							<button
								onClick={() => {
									const init: Answers = {};
									for (const q of quiz.questions) init[q.id] = q.type === 'CHECKBOX' ? [] : null;
									setAnswers(init);
									setCurrentQ(0);
									setMode('preview');
								}}
								className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:border-cyan-400 hover:text-cyan-700 transition-colors"
							>
								Retake quiz
							</button>
							<Link
								href="/browse"
								className="rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-cyan-600 transition-colors"
							>
								Browse quizzes
							</Link>
						</div>
					</div>
				</div>
			</main>
		);
	}

	// ─── Preview ──────────────────────────────────────────────────────────────
	if (mode === 'preview') {
		return (
			<main className="relative min-h-screen overflow-hidden bg-white text-gray-900">
				<div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
				<div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-200/70 blur-3xl" />

				<div className="relative mx-auto max-w-2xl px-6 py-16">
					<Link
						href="/browse"
						className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 hover:text-cyan-800"
					>
						← Back to browse
					</Link>

					<div className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
						{/* Meta */}
						<div className="mb-6 flex items-start justify-between gap-4">
							<div>
								<h1 className="text-3xl font-black tracking-tight text-gray-900">{quiz.title}</h1>
								{quiz.description && (
									<p className="mt-2 text-sm text-gray-500">{quiz.description}</p>
								)}
							</div>
							<span className="shrink-0 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
								{quiz.questions.length} Q
							</span>
						</div>

						{/* Question preview list */}
						<ol className="mb-8 flex flex-col gap-3">
							{quiz.questions.map((q, i) => (
								<li
									key={q.id}
									className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
								>
									<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
										{i + 1}
									</span>
									<div className="min-w-0">
										<p className="text-sm font-medium text-gray-800">{q.prompt}</p>
										<p className="mt-0.5 text-xs text-gray-400 capitalize">
											{q.type.toLowerCase()}
											{!q.isRequired && ' · optional'}
										</p>
									</div>
								</li>
							))}
						</ol>

						<button
							onClick={handleStart}
							disabled={starting}
							className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-bold text-white shadow hover:bg-cyan-600 disabled:opacity-60 transition-colors"
						>
							{starting ? 'Starting…' : 'Start Quiz →'}
						</button>
					</div>
				</div>
			</main>
		);
	}

	// ─── Active ───────────────────────────────────────────────────────────────
	const question: Question = quiz.questions[currentQ];
	const total = quiz.questions.length;
	const progress = ((currentQ + 1) / total) * 100;
	const isLast = currentQ === total - 1;
	const answer = answers[question.id] ?? (question.type === 'CHECKBOX' ? [] : null);

	return (
		<main className="relative min-h-screen overflow-hidden bg-white text-gray-900">
			<div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
			<div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-200/70 blur-3xl" />

			<div className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16">
				{/* Header */}
				<div className="mb-6">
					<p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
						{quiz.title}
					</p>
					{/* Progress bar */}
					<div className="flex items-center gap-3">
						<div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
							<div
								className="h-full rounded-full bg-cyan-500 transition-all duration-300"
								style={{ width: `${progress}%` }}
							/>
						</div>
						<span className="shrink-0 text-xs font-semibold text-gray-400">
							{currentQ + 1} / {total}
						</span>
					</div>
				</div>

				{/* Question card */}
				<div className="flex flex-1 flex-col">
					<div className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
						<p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cyan-600">
							Question {currentQ + 1}
						</p>
						<h2 className="mb-6 text-xl font-bold text-gray-900">
							{question.prompt}
							{question.isRequired && <span className="ml-1 text-red-400">*</span>}
						</h2>

						{/* Answer input */}
						{question.type === 'BOOLEAN' && (
							<BooleanInput
								value={answer as string | null}
								onChange={(v) => setAnswer(question.id, v)}
							/>
						)}
						{question.type === 'INPUT' && (
							<InputAnswer
								value={(answer as string) ?? ''}
								onChange={(v) => setAnswer(question.id, v)}
							/>
						)}
						{question.type === 'CHECKBOX' && (
							<CheckboxAnswer
								options={question.options}
								value={(answer as string[]) ?? []}
								onChange={(v) => setAnswer(question.id, v)}
							/>
						)}
					</div>

					{/* Navigation */}
					<div className="mt-6 flex gap-3">
						{currentQ > 0 && (
							<button
								onClick={() => setCurrentQ((q) => q - 1)}
								className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-cyan-400 hover:text-cyan-700 transition-colors"
							>
								← Back
							</button>
						)}
						<button
							onClick={() => {
								if (isLast) setMode('done');
								else setCurrentQ((q) => q + 1);
							}}
							className="ml-auto rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-cyan-600 transition-colors"
						>
							{isLast ? 'Finish →' : 'Next →'}
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
