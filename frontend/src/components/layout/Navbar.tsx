import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

interface NavbarProps {
  activePage?: 'landing' | 'features' | 'about' | 'process' | 'contact';
}

const Navbar: React.FC<NavbarProps> = ({ activePage = 'landing' }) => {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
      <div className="flex items-center">
        <Link to="/landing">
          <Logo size="medium" className="h-12 w-auto" />
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-8">
          <Link 
            to="/features" 
            className={`transition-colors ${
              activePage === 'features' 
                ? 'text-beauty-bush-600 font-medium' 
                : 'text-gray-700 hover:text-beauty-bush-600'
            }`}
          >
            Features
          </Link>
          <Link 
            to="/about" 
            className={`transition-colors ${
              activePage === 'about' 
                ? 'text-beauty-bush-600 font-medium' 
                : 'text-gray-700 hover:text-beauty-bush-600'
            }`}
          >
            About
          </Link>
          <Link 
            to="/process" 
            className={`transition-colors ${
              activePage === 'process' 
                ? 'text-beauty-bush-600 font-medium' 
                : 'text-gray-700 hover:text-beauty-bush-600'
            }`}
          >
            Process
          </Link>
          <Link 
            to="/contact" 
            className={`transition-colors ${
              activePage === 'contact' 
                ? 'text-beauty-bush-600 font-medium' 
                : 'text-gray-700 hover:text-beauty-bush-600'
            }`}
          >
            Contact
          </Link>
        </div>
      </nav>
      
      <div className="flex items-center space-x-4">
        <Link 
          to="/login" 
          className="text-gray-700 hover:text-beauty-bush-600 transition-colors"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="bg-beauty-bush-600 hover:bg-beauty-bush-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default Navbar; 