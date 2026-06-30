import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
	subsets: ['latin'],
	weight: ['400', '600', '700', '800'],
	variable: '--font-nunito',
});

export const metadata: Metadata = {
	title: 'QuizBuilder',
	description: 'Anonymous quiz builder and browser',
};

type RootLayoutProps = {
	children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<body className={nunito.variable}>{children}</body>
		</html>
	);
}
