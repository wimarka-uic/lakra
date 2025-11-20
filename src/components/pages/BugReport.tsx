import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const BugReport: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Open Google Form in new tab
    window.open('https://forms.gle/vNVEh7MWeVdonXUS7', '_blank');
    // Reset submitting state after a short delay
    setTimeout(() => setIsSubmitting(false), 1000);
  };

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
            Report a Bug
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
            Please help us improve the WiMarka system by reporting any issues, bugs, or unexpected behavior you encounter.
          </p>
        </div>
      </section>

      {/* Bug Report Form Section */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Submit Bug Report
            </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Please provide detailed information about the issue you encountered. 
                Complete details enable the development team to understand and resolve the problem quickly.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
            <div className="space-y-8">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to Report a Bug
                </h3>
                <ul className="text-blue-700 space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Describe what you were trying to accomplish when the issue occurred.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Explain what you expected to happen versus what actually occurred.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Include the steps required to reproduce the issue whenever possible.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Mention your browser, device, and any error messages you observed.</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-beauty-bush-600 hover:bg-beauty-bush-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Opening the form...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Submit Bug Report
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  This action opens the bug report form in a new browser tab.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What We Need
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Provide a clear description of the problem.</li>
                <li>• Share the steps required to reproduce the issue.</li>
                <li>• Detail the expected behavior versus the actual result.</li>
                <li>• Include browser and device information.</li>
                <li>• Attach screenshots whenever they are available.</li>
              </ul>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Response Time
              </h3>
              <p className="text-gray-600">
                The research team typically responds to bug reports within one to two business days. 
                For critical issues that affect system functionality, we aim to respond within twenty-four hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
            Need assistance with something else?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            If you have general questions or need support, visit our contact page.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="bg-beauty-bush-600 hover:bg-beauty-bush-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
            <Link 
              to="/" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BugReport;
