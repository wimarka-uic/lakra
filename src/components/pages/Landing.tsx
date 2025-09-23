import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Logo from '../ui/Logo';

const Landing: React.FC = () => {

  return (
    <div className="relative min-h-screen bg-white">
      <Navbar activePage="landing" />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <div className="h-[460px] md:h-[580px] bg-[radial-gradient(110%_90%_at_20%_10%,rgba(236,72,153,0.35),rgba(255,255,255,0)_45%),radial-gradient(80%_60%_at_80%_0%,rgba(236,72,153,0.25),rgba(255,255,255,0)_40%),linear-gradient(to_bottom,rgba(244,244,245,1),rgba(255,255,255,1))]"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center text-sm text-gray-600 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-beauty-bush-600 mr-2"></span>
                MT Evaluation Platform
              </p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                Automate & manage translation quality with ease
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-xl">
                Lakra streamlines human annotation and assisted evaluation for Philippine languages—fast, consistent, and research-grade.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="bg-beauty-bush-600 hover:bg-beauty-bush-700 text-white px-7 py-3 rounded-lg font-semibold inline-flex items-center justify-center">
                  Free Sign Up
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link to="/features" className="border-2 border-beauty-bush-600 text-beauty-bush-700 hover:bg-beauty-bush-600 hover:text-white px-7 py-3 rounded-lg font-semibold inline-flex items-center justify-center">
                  Explore Features
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm">
                <Logo size="large" className="h-20 w-auto" />
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-3xl font-bold text-gray-900">100%</p>
                    <p className="text-xs text-gray-500">Human-in-the-loop</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-3xl font-bold text-gray-900">90%</p>
                    <p className="text-xs text-gray-500">Task success</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-3xl font-bold text-gray-900">10k</p>
                    <p className="text-xs text-gray-500">Sentences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16">
            Platform Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Annotation Interface */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="mb-6">
                <div className="bg-beauty-bush-50 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">Human Annotation Interface</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 text-xs">Active</span>
                      </div>
                    </div>
                    
                    {/* Demo Content */}
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <p className="text-gray-800 text-sm mb-2">Original: "Kumusta ka na? Kamusta ang trabaho mo?"</p>
                      <p className="text-gray-600 text-sm">Translation: "How are you? How is your work?"</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-beauty-bush-500 h-2 rounded-full" style={{ width: '85%' }}></div>
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
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="mb-6">
                <div className="bg-beauty-bush-50 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">Quality Assessment</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-yellow-600 text-xs">Coming Soon</span>
                      </div>
                    </div>
                    
                    {/* Blurred Demo Content */}
                    <div className="bg-gray-50 rounded p-3 relative overflow-hidden border border-gray-200">
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
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Assisted Quality Assessment</h3>
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