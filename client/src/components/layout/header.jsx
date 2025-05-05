import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Auctions', path: '/auctions' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <Clock className="w-8 h-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-primary font-sans">BidVista</span>
              </a>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a className={`text-secondary-dark hover:text-primary px-3 py-2 font-medium ${
                    location === link.path ? 'text-primary' : ''
                  }`}>
                    {link.label}
                  </a>
                </Link>
              ))}
              {user?.role === 'seller' && (
                <Link href="/seller-dashboard">
                  <a className={`text-secondary-dark hover:text-primary px-3 py-2 font-medium ${
                    location === '/seller-dashboard' ? 'text-primary' : ''
                  }`}>
                    Seller Dashboard
                  </a>
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="hidden md:inline text-secondary-dark">Hi, {user.username}</span>
                <Button 
                  variant="default" 
                  className="bg-primary text-white" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? 'Logging out...' : 'Sign Out'}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <a className="text-secondary-dark hover:text-primary font-medium">Sign In</a>
                </Link>
                <Link href="/auth">
                  <a className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-dark transition">
                    Register
                  </a>
                </Link>
              </>
            )}
            <button
              type="button"
              className="md:hidden text-secondary-dark"
              onClick={toggleMobileMenu}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-b border-gray-200`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <a 
                className={`block px-3 py-2 text-base font-medium text-secondary-dark hover:text-primary ${
                  location === link.path ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            </Link>
          ))}
          {user?.role === 'seller' && (
            <Link href="/seller-dashboard">
              <a 
                className={`block px-3 py-2 text-base font-medium text-secondary-dark hover:text-primary ${
                  location === '/seller-dashboard' ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Seller Dashboard
              </a>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
