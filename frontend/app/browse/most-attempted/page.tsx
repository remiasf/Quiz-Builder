'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { quizService, type Quiz } from '../../services/quizService';

export default function MostAttemptedPage() {
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			setLoading(true);
			setError(null);
			try {
				const res = await quizService.getMostAttemptedQuizzes();
				if (!cancelled) setQuizzes(res);
			} catch {
				if (!cancelled) setError('Failed to load quizzes. Is the backend running?');
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		load();
		return () => { cancelled = true; };
	}, []);

	return (
		<main className="relative min-h-screen overflow-hidden bg-white text-gray-900">
			{/* Background blobs */}
			<div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
			<div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-200/70 blur-3xl" />

			<div className="relative mx-auto max-w-4xl px-6 py-16">
				{/* Header */}
				<div className="mb-10">
					<Link
						href="/"
						className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 hover:text-cyan-800"
					>
						← Home
					</Link>
					<h1 className="text-4xl font-black tracking-tight text-gray-900">Most Attempted</h1>
					<p className="mt-1 text-sm text-gray-500">Top 5 quizzes by number of attempts</p>
				</div>

				{/* Loading */}
				{loading && (
					<div className="flex items-center justify-center py-32">
						<div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
					</div>
				)}

				{/* Error */}
				{error && (
					<div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
						{error}
					</div>
				)}

				{/* Empty */}
				{!loading && !error && quizzes.length === 0 && (
					<div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center text-gray-500">
						No quizzes have been attempted yet.{' '}
						<Link href="/browse" className="font-semibold text-cyan-600 hover:underline">
							Browse all quizzes
						</Link>
					</div>
				)}

				{/* Quiz list */}
				{!loading && !error && quizzes.length > 0 && (
					<ol className="flex flex-col gap-4">
						{quizzes.map((quiz, index) => (
							<li key={quiz.id}>
								<Link
									href={`/browse/${quiz.id}`}
									className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-cyan-400 hover:shadow-md"
								>
									{/* Rank badge */}
									<span
										className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${
											index === 0
												? 'bg-amber-400 text-white'
												: index === 1
												? 'bg-gray-300 text-gray-700'
												: index === 2
												? 'bg-orange-300 text-white'
												: 'bg-gray-100 text-gray-500'
										}`}
									>
										{index + 1}
									</span>

									{/* Info */}
									<div className="min-w-0 flex-1">
										<h2 className="truncate text-lg font-bold text-gray-900">{quiz.title}</h2>
										{quiz.description && (
											<p className="mt-0.5 truncate text-sm text-gray-500">{quiz.description}</p>
										)}
									</div>

									{/* Stats */}
									<div className="flex shrink-0 flex-col items-end gap-1 text-right">
										<span className="text-lg font-black text-cyan-600">
											{quiz.attemptsCount.toLocaleString()}
										</span>
										<span className="text-xs text-gray-400">
											attempt{quiz.attemptsCount !== 1 ? 's' : ''}
										</span>
									</div>
								</Link>
							</li>
						))}
					</ol>
				)}

				{/* Footer link */}
				{!loading && !error && (
					<div className="mt-10 text-center">
						<Link
							href="/browse"
							className="text-sm font-medium text-cyan-600 hover:text-cyan-800 hover:underline"
						>
							Browse all quizzes →
						</Link>
					</div>
				)}
			</div>
		</main>
	);
}
