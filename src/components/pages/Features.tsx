import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const Features: React.FC = () => {
  return (

<div className="relative min-h-screen bg-white">
      <Navbar activePage="features" />

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0">
          <div className="h-[360px] md:h-[420px] bg-[radial-gradient(110%_90%_at_20%_10%,rgba(236,72,153,0.35),rgba(255,255,255,0)_45%),radial-gradient(80%_60%_at_80%_0%,rgba(236,72,153,0.25),rgba(255,255,255,0)_40%),linear-gradient(to_bottom,rgba(244,244,245,1),rgba(255,255,255,1))]"></div>
        </div>
        <div className="relative max-w-6xl mx-auto pt-24 md:pt-28 pb-10 md:pb-16 px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
            Platform Features
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
            Discover the comprehensive tools and capabilities designed for machine translation evaluation 
            and research collaboration in Philippine languages.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16">
            Core Capabilities
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Annotation Interface */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <div className="w-12 h-12 bg-beauty-bush-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Annotation Interface</h3>
              <p className="text-gray-600 mb-4">
                Interactive text highlighting and error classification system for evaluating machine translation quality with detailed error analysis.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Provides precise text highlighting controls for each translation segment.</li>
                <li>• Classifies errors consistently by severity and linguistic type.</li>
                <li>• Records fluency, adequacy, and overall scores with guided metrics.</li>
              </ul>
            </div>

            {/* Evaluation System */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quality Evaluation</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive evaluation system with detailed scoring metrics and human-in-the-loop validation for reliable results.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Applies multi-dimensional scoring scales tailored to research benchmarks.</li>
                <li>• Coordinates human validation workflows with transparent approvals.</li>
                <li>• Surfaces detailed analytics dashboards for reviewers and administrators.</li>
              </ul>
            </div>

            {/* Voice Recording */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Voice Recording</h3>
              <p className="text-gray-600 mb-4">
                Built-in voice recording capabilities for audio annotation and pronunciation assessment of Philippine languages.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Captures spoken annotations directly within the interface.</li>
                <li>• Evaluates pronunciation and articulation for Philippine languages.</li>
                <li>• Analyzes and stores voice quality metrics securely.</li>
              </ul>
            </div>

            {/* Admin Dashboard */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Admin Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive administrative tools for managing users, monitoring progress, and analyzing research data.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Manages participant accounts and permissions centrally.</li>
                <li>• Tracks progress and throughput across annotation cohorts.</li>
                <li>• Reviews aggregated research data with filterable insights.</li>
              </ul>
            </div>

            {/* Research Integration */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Research Integration</h3>
              <p className="text-gray-600 mb-4">
                Designed specifically for the WiMarka thesis research project, supporting academic research workflows and data collection.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Supports academic research requirements and protocols.</li>
                <li>• Exports sanitized datasets for reproducible studies.</li>
                <li>• Integrates seamlessly with WiMarka research workflows.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
            Ready to participate in the research?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the WiMarka research project and help advance machine translation evaluation for Philippine languages.
          </p>
          <Link 
            to="/register" 
            className="bg-beauty-bush-600 hover:bg-beauty-bush-700 text-white px-10 py-4 rounded-lg text-xl font-semibold transition-colors inline-flex items-center"
          >
            Join the Research
            <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features; 