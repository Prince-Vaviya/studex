'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Generate breadcrumbs based on path segments
  const segments = pathname.split('/').filter((segment) => segment !== '');
  
  // Map segments to readable names (optional: could fetch real names if needed)
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const isLast = index === segments.length - 1;
    
    // Simple formatting: capitalize and remove hyphens
    // For IDs, we might want to keep them as is or truncate
    let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    // If it looks like an ID (long alphanumeric), shorten it
    if (segment.length > 15 && /\d/.test(segment)) {
      label = 'Details'; // Generic label for ID pages if we don't have the title handy
    }
    
    if (segment === 'dashboard') label = 'Dashboard';

    return { href, label, isLast };
  });

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/10 px-6 py-4 mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Navigation Controls */}
        <div className="flex items-center gap-4">
          {/* Back Button (only if not on root dashboard) */}
          {pathname !== '/dashboard' && (
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
            
            {breadcrumbs.map((crumb, index) => {
              // Skip the first 'dashboard' crumb since we have the Home icon
              if (crumb.label === 'Dashboard') return null;

              // Disable links for intermediate segments that don't have pages
              const isNonClickable = ['Course', 'Assignment'].includes(crumb.label);
              const isDisabled = crumb.isLast || isNonClickable;

              return (
                <div key={crumb.href} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                  {isDisabled ? (
                    <span className={clsx("text-gray-400 font-medium", crumb.isLast && "text-white")}>
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: User Profile */}
        <div className="flex items-center gap-4">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 border-2 border-white/10"
              }
            }}
          />
        </div>
      </div>
    </nav>
  );
}
