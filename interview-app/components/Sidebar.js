'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: '📊', label: 'Dashboard' },
    { href: '/setup', icon: '⚙️', label: 'New Interview' },
    { href: '/audit', icon: '📋', label: 'Audit Trail' },
    { href: '/costs', icon: '💰', label: 'Cost Tracking' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🤖</div>
        <div>
          <h1>InterviewAI</h1>
          <div className="subtitle">Smart Screening Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="nav-section-label" style={{ marginTop: '16px' }}>Interviews</div>
        <Link
          href="/interviews"
          className={`nav-link ${pathname === '/interviews' ? 'active' : ''}`}
        >
          <span className="nav-icon">📁</span>
          <span>All Interviews</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">HM</div>
          <div>
            <div className="user-name">Hiring Manager</div>
            <div className="user-role">Admin Access</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
