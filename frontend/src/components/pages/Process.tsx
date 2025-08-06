import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../layout/AnimatedBackground';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const Process: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-beauty-bush-50 overflow-hidden">
      <AnimatedBackground />
      
      <Navbar activePage="process" />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
            Research Process
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
            Understand how to participate in the WiMarka research project and contribute to 
            advancing machine translation evaluation for Philippine languages.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16">
            How to Participate
          </h2>
          
          <div className="space-y-16">
            {/* Step 1: Registration */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-beauty-bush-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      1
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Registration</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Create an account on the Lakra platform to access the annotation and evaluation tools. 
                    Registration is free and open to participants interested in contributing to the research.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Simple registration process</li>
                    <li>• Free access to all tools</li>
                    <li>• Research participation agreement</li>
                    <li>• Privacy and data protection</li>
                  </ul>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Getting Started</h4>
                  <p className="text-gray-600 text-sm">
                    Complete your profile and review the research guidelines to understand your role in the project.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Training */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="lg:w-1/2">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      2
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Training & Guidelines</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Complete the training modules to learn about error classification, quality assessment criteria, 
                    and the annotation workflow for Philippine language machine translation.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Error classification training</li>
                    <li>• Quality assessment guidelines</li>
                    <li>• Annotation workflow tutorial</li>
                    <li>• Practice exercises</li>
                  </ul>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Learning Resources</h4>
                  <p className="text-gray-600 text-sm">
                    Access comprehensive training materials and practice with sample translations to build your expertise.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Annotation */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      3
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Annotation & Evaluation</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Use the interactive annotation interface to evaluate machine translation outputs, 
                    classify errors, and provide quality assessments for Philippine language translations.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Interactive text highlighting</li>
                    <li>• Error classification system</li>
                    <li>• Quality scoring interface</li>
                    <li>• Progress tracking</li>
                  </ul>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Active Participation</h4>
                  <p className="text-gray-600 text-sm">
                    Contribute to the research by evaluating translations and providing detailed feedback on translation quality.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4: Research Integration */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="lg:w-1/2">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      4
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Research Contribution</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Your annotations and evaluations contribute directly to the WiMarka thesis research project, advancing machine translation evaluation for Philippine languages.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Data collection for research</li>
                    <li>• Machine translation evaluation</li>
                    <li>• Academic research contribution</li>
                    <li>• Philippine language advancement</li>
                  </ul>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Research Impact</h4>
                  <p className="text-gray-600 text-sm">
                    Your participation directly contributes to improving machine translation systems for Philippine languages, making technology more accessible to Filipino speakers worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
            Ready to join the process?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start your contribution to the WiMarka research project today and help advance machine translation for Philippine languages.
          </p>
          <Link 
            to="/register" 
            className="bg-beauty-bush-600 hover:bg-beauty-bush-700 text-white px-10 py-4 rounded-lg text-xl font-semibold transition-colors inline-flex items-center"
          >
            Get Started
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

export default Process; 