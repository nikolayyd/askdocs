'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="primary-nav" aria-label="Main navigation">
      <Link
        className={pathname === '/' ? 'nav-link active' : 'nav-link'}
        href="/"
        aria-current={pathname === '/' ? 'page' : undefined}
      >
        Ask
      </Link>
      <Link
        className={pathname === '/ingest' ? 'nav-link active' : 'nav-link'}
        href="/ingest"
        aria-current={pathname === '/ingest' ? 'page' : undefined}
      >
        Ingest
      </Link>
    </nav>
  );
};

export default Navigation;
