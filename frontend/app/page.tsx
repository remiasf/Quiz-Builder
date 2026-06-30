import Link from 'next/link';

const navItems = [
	{ label: 'Create', href: '/create' },
	{ label: 'Browse', href: '/browse' },
	{ label: 'Most Attempted', href: '/browse/most-attempted' },
];

export default function HomePage() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-white text-gray-900">
			<div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
			<div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-200/70 blur-3xl" />

			<section className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-20">
				<div className="w-full rounded-3xl border border-gray-200 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl sm:p-12">
					<p className="mb-4 inline-block rounded-full border border-cyan-300 bg-cyan-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
						Build and Explore Quizzes
					</p>

					<h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
						QuizBuilder
					</h1>

					<p className="mx-auto mt-5 max-w-2xl text-base text-gray-600 sm:text-lg">
						Anonymous quiz builder and browser
					</p>

					<nav className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="w-full rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 sm:w-auto"
							>
								{item.label}
							</Link>
						))}
					</nav>
				</div>
			</section>
		</main>
	);
}
