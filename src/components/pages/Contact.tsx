import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const Contact: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar activePage="contact" />

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0">
          <div className="h-[360px] md:h-[420px] bg-[radial-gradient(110%_90%_at_20%_10%,rgba(236,72,153,0.35),rgba(255,255,255,0)_45%),radial-gradient(80%_60%_at_80%_0%,rgba(236,72,153,0.25),rgba(255,255,255,0)_40%),linear-gradient(to_bottom,rgba(244,244,245,1),rgba(255,255,255,1))]"></div>
        </div>
        <div className="relative max-w-6xl mx-auto pt-24 md:pt-28 pb-10 md:pb-16 px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
            Contact the research team for questions, support, or to learn more about 
            participating in the WiMarka machine translation evaluation project.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16">
            Get in Touch
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Contact Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Research Team</h3>
              <div className="space-y-4">                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Student Researchers</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-800 text-sm font-medium">Shaira Lorraine Q. Montojo</p>
                          <p className="text-gray-600 text-sm font-normal">smontojo_200000000067@uic.edu.ph</p>
                        </div>
                        <div>
                          <p className="text-gray-800 text-sm font-medium">Al Gabriel A. Orig</p>
                          <p className="text-gray-600 text-sm font-normal">aorig_200000000296@uic.edu.ph</p>
                        </div>
                        <div>
                          <p className="text-gray-800 text-sm font-medium">Charlese Jeanrie A. Te</p>
                          <p className="text-gray-600 text-sm font-normal">cte_220000001593@uic.edu.ph</p>
                        </div>
                      </div>
                    </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Thesis Adviser</h4>
                    <p className="text-gray-600 text-sm">Ms. Kristine Mae Adlaon, MIT</p>
                    <p className="text-gray-600 text-sm">kadlaon@uic.edu.ph</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">How do I participate in the research?</h4>
                  <p className="text-gray-600 text-sm">
                    Register for an account and complete the training modules to start contributing to the research project.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Is my data secure?</h4>
                  <p className="text-gray-600 text-sm">
                    Yes. All data is handled according to academic research standards with appropriate privacy protections and ethical considerations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Resources */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
            Additional Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-beauty-bush-200/50 shadow-lg text-center">
              <div className="w-12 h-12 bg-beauty-bush-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Documentation</h3>
              <p className="text-gray-600 text-sm mb-4">
                Access comprehensive guides and tutorials that explain how to use the platform effectively.
              </p>
              <Link to="/about" className="text-beauty-bush-600 hover:text-beauty-bush-700 text-sm font-medium">
                Learn more →
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-beauty-bush-200/50 shadow-lg text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Help Center</h3>
              <p className="text-gray-600 text-sm mb-4">
                Find answers to common questions along with concise troubleshooting guides.
              </p>
              <Link to="/process" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Get help →
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-beauty-bush-200/50 shadow-lg text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Community</h3>
              <p className="text-gray-600 text-sm mb-4">
                Connect with other researchers and participants who support the project.
              </p>
              <Link to="/register" className="text-green-600 hover:text-green-700 text-sm font-medium">
                Join us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bug Report Section */}
      <section className="relative z-10 py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Found a Bug?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Help us improve the system by reporting any issues, bugs, or unexpected behavior you encounter.
          </p>
          <Link 
            to="/bug-report" 
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Report a Bug
          </Link>
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

export default Contact; 