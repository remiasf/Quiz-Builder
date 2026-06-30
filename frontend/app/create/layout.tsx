import type { ReactNode } from 'react';

type CreateLayoutProps = {
  children: ReactNode;
};

export default function CreateLayout({ children }: CreateLayoutProps) {
  return children;
}
