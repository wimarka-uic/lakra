import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const AboutLanding: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar activePage="about" />

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0">
          <div className="h-[360px] md:h-[420px] bg-[radial-gradient(110%_90%_at_20%_10%,rgba(236,72,153,0.35),rgba(255,255,255,0)_45%),radial-gradient(80%_60%_at_80%_0%,rgba(236,72,153,0.25),rgba(255,255,255,0)_40%),linear-gradient(to_bottom,rgba(244,244,245,1),rgba(255,255,255,1))]"></div>
        </div>
        <div className="relative max-w-6xl mx-auto pt-24 md:pt-28 pb-10 md:pb-16 px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
            About Lakra
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
            A comprehensive machine translation evaluation platform developed for the WiMarka thesis research project, 
            designed to advance natural language processing for Philippine languages.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16">Research Team</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Student Researchers</h3>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 ring-2 ring-beauty-bush-400">
                    <img 
                      src="/smontojo.jpg" 
                      alt="Shaira Montojo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Montojo, Shaira Lorraine Q.</p>
                    <p className="text-sm text-gray-600">Student Researcher</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 ring-2 ring-beauty-bush-400">
                    <img 
                      src="/aorig.jpg" 
                      alt="Al Gabriel Orig" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Orig, Al Gabriel A.</p>
                    <p className="text-sm text-gray-600">Student Researcher</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 ring-2 ring-beauty-bush-400">
                    <img 
                      src="/cte.png" 
                      alt="Charlese Te" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Te, Charlese Jeanrie A.</p>
                    <p className="text-sm text-gray-600">Student Researcher</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Adviser</h3>
              <div className="flex items-center p-6 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-lg border border-green-400/30">
                <div className="w-20 h-20 rounded-full overflow-hidden mr-4 ring-2 ring-green-400">
                  <img 
                    src="/kadlaon.jpg" 
                    alt="Ms. Kristine Mae Adlaon" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Ms. Kristine Mae Adlaon, MIT</p>
                  <p className="text-sm text-gray-600">Thesis Adviser</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Overview */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16">Project Overview</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Research Objectives</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-beauty-bush-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Develop a reference-free evaluation metric for Philippine language machine translation</span>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-beauty-bush-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Create an annotation tool for collecting human evaluation data</span>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-beauty-bush-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Establish quality assessment frameworks for low-resource languages</span>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-beauty-bush-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Contribute to Filipino NLP research and development</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Key Features</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Human annotation interface for translation quality assessment</span>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Error classification system (syntactic/semantic, major/minor)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Multi-user annotation and evaluation workflows</span>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>AI-powered quality assessment with confidence scoring</span>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Comprehensive analytics and reporting tools</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Research Impact */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16">Research Impact</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg text-center">
              <div className="w-16 h-16 bg-beauty-bush-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Academic Contribution</h3>
              <p className="text-gray-600">
                Advancing machine translation evaluation methodologies for Philippine languages through rigorous academic research.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Technology Advancement</h3>
              <p className="text-gray-600">
                Developing tools and frameworks that improve machine translation quality for Filipino languages.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Community Impact</h3>
              <p className="text-gray-600">
                Making technology more accessible to Filipino speakers through improved translation tools.
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

export default AboutLanding; 