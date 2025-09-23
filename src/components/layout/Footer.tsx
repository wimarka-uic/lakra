import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const Footer: React.FC = () => {
  const linkClass = "group inline-flex items-center gap-1 rounded-md px-2 py-1 text-gray-600 hover:text-beauty-bush-700 hover:bg-beauty-bush-50 transition-colors";
  const underline = <span className="h-[2px] w-0 group-hover:w-4 bg-beauty-bush-600 rounded transition-all"></span>;
  return (
    <footer className="relative z-10 py-10 px-4 md:px-6 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center">
            <Logo size="medium" className="h-10 md:h-12 w-auto" />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-3">
            <Link to="/features" className={linkClass}>
              <span>Features</span>
              {underline}
            </Link>
            <Link to="/about" className={linkClass}>
              <span>About</span>
              {underline}
            </Link>
            <Link to="/process" className={linkClass}>
              <span>Process</span>
              {underline}
            </Link>
            <Link to="/contact" className={linkClass}>
              <span>Contact</span>
              {underline}
            </Link>
            <Link to="/login" className={linkClass}>
              <span>Login</span>
              {underline}
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center text-white bg-beauty-bush-600 hover:bg-beauty-bush-700 px-4 py-2 rounded-lg transition-colors shadow-sm">
              Register
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 