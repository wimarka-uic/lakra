import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, BarChart3, FileText, Settings, HelpCircle, Home, CheckSquare, Info, Menu, X, Users } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  onShowGuidelines?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onShowGuidelines }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isActive = (path: string) => location.pathname === path;

  // Navigation items for regular users only (not for admins or evaluators)
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/annotate', icon: FileText, label: 'Annotate' },
    { path: '/my-annotations', icon: BarChart3, label: 'My Annotations' },
  ];

  const adminNavItems = [
    { path: '/admin', icon: Settings, label: 'Admin Dashboard' },
  ];

  // Admin sub-navigation items for mobile menu (only show when on admin pages)
  const adminTabItems = [
    { path: '/admin', icon: Home, label: 'Home' },
    { path: '/admin/overview', icon: BarChart3, label: 'Overview' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/sentences', icon: FileText, label: 'Sentences' },
    { path: '/admin/onboarding-tests', icon: CheckSquare, label: 'Onboarding Tests' },
  ];

  // User sub-navigation items for mobile menu (only show when on user pages)
  const userSubItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/annotate', icon: FileText, label: 'Annotate' },
    { path: '/my-annotations', icon: BarChart3, label: 'My Annotations' },
  ];

  // Evaluator sub-navigation items for mobile menu (only show when on evaluator pages)
  const evaluatorSubItems = [
    { path: '/evaluator', icon: Home, label: 'Dashboard' },
    { path: '/mt-assess', icon: CheckSquare, label: 'MT Assess' },
    { path: '/my-evaluations', icon: BarChart3, label: 'My Evaluations' },
  ];

  const evaluatorNavItems = [
    { path: '/evaluator', icon: CheckSquare, label: 'Evaluator Dashboard' },
    { path: '/my-evaluations', icon: BarChart3, label: 'My Evaluations' },
  ];

  // Get current user's navigation items
  const getCurrentNavItems = () => {
    if (user?.is_admin) return adminNavItems;
    if (user?.is_evaluator) return evaluatorNavItems;
    return navItems;
  };

  const currentNavItems = getCurrentNavItems();

  // Check if we're on specific dashboard pages
  const isOnAdminPage = location.pathname.startsWith('/admin');
  const isOnUserPages = location.pathname.startsWith('/dashboard') || 
                        location.pathname.startsWith('/annotate') || 
                        location.pathname.startsWith('/my-annotations');
  const isOnEvaluatorPages = location.pathname.startsWith('/evaluator') || 
                             location.pathname.startsWith('/mt-assess') || 
                             location.pathname.startsWith('/my-evaluations');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and Desktop Nav */}
            <div className="flex items-center space-x-3 lg:space-x-6">
              <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                <Logo size="medium" />
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1 lg:space-x-2">
                {currentNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side - Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {/* About Button */}
              <Link
                to="/about"
                className="group flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                title="About Lakra"
              >
                <Info className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" />
                <span className="hidden lg:inline transition-all duration-200">About</span>
              </Link>
              
              {/* Help Button */}
              {onShowGuidelines && (
                <button
                  onClick={onShowGuidelines}
                  className="group flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                  title="View Guidelines"
                >
                  <HelpCircle className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" />
                  <span className="hidden lg:inline transition-all duration-200">Help</span>
                </button>
              )}
              
              {/* Profile Link */}
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700 hidden lg:inline">
                    {user?.first_name} {user?.last_name}
                  </span>
                  {user?.is_admin && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Admin
                    </span>
                  )}
                  {user?.is_evaluator && !user?.is_admin && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Evaluator
                    </span>
                  )}
                </div>
              </Link>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-lg">
              {/* Mobile Navigation Items */}
              {currentNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Admin Tab Navigation - Only show when on admin pages */}
              {user?.is_admin && isOnAdminPage && (
                <>
                  <div className="border-t border-gray-200 my-3"></div>
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Admin Sections
                    </h3>
                  </div>
                  {adminTabItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-3 py-3 ml-4 rounded-md text-base font-medium transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </>
              )}

              {/* User Sub-Navigation - Only show when on user pages */}
              {!user?.is_admin && !user?.is_evaluator && isOnUserPages && (
                <>
                  <div className="border-t border-gray-200 my-3"></div>
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Quick Access
                    </h3>
                  </div>
                  {userSubItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-3 py-3 ml-4 rounded-md text-base font-medium transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </>
              )}

              {/* Evaluator Sub-Navigation - Only show when on evaluator pages */}
              {user?.is_evaluator && !user?.is_admin && isOnEvaluatorPages && (
                <>
                  <div className="border-t border-gray-200 my-3"></div>
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Evaluator Tools
                    </h3>
                  </div>
                  {evaluatorSubItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-3 py-3 ml-4 rounded-md text-base font-medium transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </>
              )}
              
              {/* Mobile Divider */}
              <div className="border-t border-gray-200 my-3"></div>
              
              {/* Mobile About */}
              <Link
                to="/about"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              >
                <Info className="h-5 w-5" />
                <span>About</span>
              </Link>
              
              {/* Mobile Help */}
              {onShowGuidelines && (
                <button
                  onClick={() => {
                    onShowGuidelines();
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 text-left"
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>Help</span>
                </button>
              )}
              
              {/* Mobile Profile */}
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              >
                <User className="h-5 w-5" />
                <div className="flex flex-col">
                  <span>{user?.first_name} {user?.last_name}</span>
                  <div className="flex space-x-2 mt-1">
                    {user?.is_admin && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Admin
                      </span>
                    )}
                    {user?.is_evaluator && !user?.is_admin && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Evaluator
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              
              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 