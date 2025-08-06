import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 py-12 px-6 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Logo size="medium" className="h-12 w-auto" />
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-beauty-bush-600 transition-colors">Features</a>
            <a href="#about" className="text-gray-600 hover:text-beauty-bush-600 transition-colors">About</a>
            <Link to="/login" className="text-gray-600 hover:text-beauty-bush-600 transition-colors">Login</Link>
            <Link to="/register" className="text-beauty-bush-600 hover:text-beauty-bush-700 transition-colors">Register</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 