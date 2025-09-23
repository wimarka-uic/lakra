
import React, { useState } from 'react';

import React from 'react';

import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

interface NavbarProps {
  activePage?: 'landing' | 'features' | 'about' | 'process' | 'contact';
}

const Navbar: React.FC<NavbarProps> = ({ activePage = 'landing' }) => {

  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="relative z-50 px-4 py-4 md:px-6 lg:px-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/landing" onClick={() => setIsOpen(false)}>
            <Logo size="medium" className="h-10 md:h-12 w-auto" />
          </Link>
        </div>

        {/* Center nav for md+ */}
        <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-8">

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

        {/* Right actions */}
        <div className="hidden md:flex items-center space-x-4">
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

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {/* Mobile slide-over menu */}
      <div className={`md:hidden fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        ></div>

        {/* Panel */}
        <div className={`absolute right-0 top-0 h-full w-72 max-w-[80%] bg-white border-l border-gray-200 shadow-xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Menu</span>
            <button
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="px-3 py-3 grid gap-1">
            <Link to="/features" onClick={() => setIsOpen(false)} className={`px-3 py-3 rounded-md ${activePage==='features'?'text-beauty-bush-700 bg-beauty-bush-50':'text-gray-700 hover:bg-gray-50'}`}>Features</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className={`px-3 py-3 rounded-md ${activePage==='about'?'text-beauty-bush-700 bg-beauty-bush-50':'text-gray-700 hover:bg-gray-50'}`}>About</Link>
            <Link to="/process" onClick={() => setIsOpen(false)} className={`px-3 py-3 rounded-md ${activePage==='process'?'text-beauty-bush-700 bg-beauty-bush-50':'text-gray-700 hover:bg-gray-50'}`}>Process</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className={`px-3 py-3 rounded-md ${activePage==='contact'?'text-beauty-bush-700 bg-beauty-bush-50':'text-gray-700 hover:bg-gray-50'}`}>Contact</Link>
            <div className="h-px bg-gray-200 my-2"></div>
            <Link to="/login" onClick={() => setIsOpen(false)} className="px-3 py-3 rounded-md text-gray-700 hover:bg-gray-50">Login</Link>
            <Link to="/register" onClick={() => setIsOpen(false)} className="px-3 py-3 rounded-md bg-beauty-bush-600 text-white text-center hover:bg-beauty-bush-700">Get Started</Link>
          </nav>
        </div>

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