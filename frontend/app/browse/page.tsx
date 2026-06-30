'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { quizService, type QuizSummary } from '../services/quizService';

export default function BrowsePage() {
	const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			setLoading(true);
			setError(null);
			try {
				const res = await quizService.getQuizzes(page);
				if (!cancelled) {
					setQuizzes(res.data);
					setTotalPages(res.totalPages);
					setTotal(res.total);
				}
			} catch {
				if (!cancelled) setError('Failed to load quizzes. Is the backend running?');
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		load();
		return () => { cancelled = true; };
	}, [page]);

	async function handleDelete(id: string) {
		setDeletingId(id);
		try {
			await quizService.deleteQuiz(id);
			const newTotal = total - 1;
			const newTotalPages = Math.max(1, Math.ceil(newTotal / 10));
			const targetPage = page > newTotalPages ? newTotalPages : page;
			if (targetPage !== page) {
				setPage(targetPage);
			} else {
				const res = await quizService.getQuizzes(page);
				setQuizzes(res.data);
				setTotalPages(res.totalPages);
				setTotal(res.total);
			}
		} catch {
			setError('Failed to delete quiz.');
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<main className="relative min-h-screen overflow-hidden bg-white text-gray-900">
			{/* Background blobs */}
			<div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
			<div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-200/70 blur-3xl" />

			<div className="relative mx-auto max-w-4xl px-6 py-16">
				{/* Header */}
				<div className="mb-10 flex items-center justify-between">
					<div>
						<Link
							href="/"
							className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 hover:text-cyan-800"
						>
							← Home
						</Link>
						<h1 className="text-4xl font-black tracking-tight text-gray-900">Browse Quizzes</h1>
						{!loading && !error && (
							<p className="mt-1 text-sm text-gray-500">
								{total} quiz{total !== 1 ? 'zes' : ''} available
							</p>
						)}
					</div>
					<Link
						href="/create"
						className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-cyan-600 transition-colors"
					>
						+ Create Quiz
					</Link>
				</div>

				{/* States */}
				{loading && (
					<div className="flex items-center justify-center py-32">
						<div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
					</div>
				)}

				{error && (
					<div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
						{error}
					</div>
				)}

				{!loading && !error && quizzes.length === 0 && (
					<div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center text-gray-500">
						No quizzes yet.{' '}
						<Link href="/create" className="font-semibold text-cyan-600 hover:underline">
							Create the first one!
						</Link>
					</div>
				)}

				{/* Quiz grid */}
				{!loading && !error && quizzes.length > 0 && (
					<ul className="grid gap-4 sm:grid-cols-2">
						{quizzes.map((quiz) => (
							<li key={quiz.id} className="relative">
								{/* Delete button */}
								<button
									onClick={() => handleDelete(quiz.id)}
									disabled={deletingId === quiz.id}
									aria-label={`Delete "${quiz.title}"`}
									className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
								>
									{deletingId === quiz.id ? (
										<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
									) : (
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
											<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
										</svg>
									)}
								</button>

								<Link
									href={`/browse/${quiz.id}`}
									className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-cyan-400 hover:shadow-md"
								>
									<h2 className="pr-6 text-lg font-bold text-gray-900 line-clamp-2">{quiz.title}</h2>
									<div className="mt-4 flex items-center justify-between">
										<span className="inline-block rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
											{quiz.numberOfQuestions} question{quiz.numberOfQuestions !== 1 ? 's' : ''}
										</span>
										<span className="text-xs text-gray-400">
											{quiz.attemptsCount.toLocaleString()} attempt{quiz.attemptsCount !== 1 ? 's' : ''}
										</span>
									</div>
								</Link>
							</li>
						))}
					</ul>
				)}

				{/* Pagination */}
				{!loading && !error && totalPages > 1 && (
					<div className="mt-10 flex items-center justify-center gap-2">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
						>
							← Prev
						</button>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<button
								key={p}
								onClick={() => setPage(p)}
								className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
									p === page
										? 'bg-cyan-500 text-white shadow'
										: 'border border-gray-200 text-gray-700 hover:border-cyan-400 hover:text-cyan-700'
								}`}
							>
								{p}
							</button>
						))}

						<button
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
							className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
						>
							Next →
						</button>
					</div>
				)}
			</div>
		</main>
	);
}
