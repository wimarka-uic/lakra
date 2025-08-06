import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../layout/AnimatedBackground';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Logo from '../ui/Logo';

const Landing: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-beauty-bush-50 overflow-hidden">
      <AnimatedBackground />
      
      <Navbar activePage="landing" />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Logo size="large" className="h-24 md:h-32 w-auto mx-auto" />
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
            Advanced machine translation evaluation platform for Philippine languages, 
            featuring human annotation interfaces and AI-powered quality assessment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-beauty-bush-600 hover:bg-beauty-bush-700 text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors inline-flex items-center justify-center"
            >
              Get Started
              <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link 
              to="/features" 
              className="border-2 border-beauty-bush-600 text-beauty-bush-600 hover:bg-beauty-bush-600 hover:text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors inline-flex items-center justify-center"
            >
              Learn More
              <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16">
            Platform Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Annotation Interface */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <div className="mb-6">
                <div className="bg-beauty-bush-50 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">Human Annotation Interface</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-600 text-xs">Active</span>
                      </div>
                    </div>
                    
                    {/* Demo Content */}
                    <div className="bg-white rounded p-3 border border-beauty-bush-200">
                      <p className="text-gray-800 text-sm mb-2">Original: "Kumusta ka na? Kamusta ang trabaho mo?"</p>
                      <p className="text-gray-600 text-sm">Translation: "How are you? How is your work?"</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-beauty-bush-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-gray-500 text-xs">85% Quality</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Human Annotation Interface</h3>
              <p className="text-gray-600">
                Interactive text highlighting and error classification system for evaluating machine translation quality, supporting multiple Philippine languages with detailed error analysis and quality scoring.
              </p>
            </div>

            {/* MT Quality Assessment */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <div className="mb-6">
                <div className="bg-beauty-bush-50 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">AI-Powered Quality Assessment</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-yellow-600 text-xs">Coming Soon</span>
                      </div>
                    </div>
                    
                    {/* Blurred Demo Content */}
                    <div className="bg-gray-100 rounded p-3 relative overflow-hidden">
                      <div className="blur-sm">
                        <p className="text-gray-800 text-sm mb-2">Original: "Kumusta ka na? Kamusta ang trabaho mo?"</p>
                        <p className="text-gray-600 text-sm">Translation: "How are you? How is your work?"</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-400 rounded"></div>
                          <span className="text-gray-500 text-xs">Quality Score</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-beauty-bush-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
                          Coming Soon
                        </div>
                      </div>
                    </div>
                    

                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">AI-Assisted Quality Assessment</h3>
              <p className="text-gray-600">
                DistilBERT-based quality scoring with confidence levels, automatic error detection, and human-in-the-loop validation for comprehensive MT quality analysis and evaluation workflows.
              </p>
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

export default Landing; 