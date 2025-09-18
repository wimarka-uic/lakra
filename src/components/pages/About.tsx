import React from 'react';
import { Users } from 'lucide-react';
import Logo from '../ui/Logo';

const About: React.FC = () => {
  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full">
              <Logo size="large" className="h-32 w-auto" />
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Annotation Tool for WiMarka - A reference-free evaluation metric for machine translation of Philippine languages, 
            developed as part of academic research to advance natural language processing for Filipino languages.
          </p>
        </div>
      </div>

      {/* Research Team */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="flex items-center mb-6">
          <Users className="h-8 w-8 text-primary-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Research Team</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Researchers</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden mr-3 ring-2 ring-primary-200">
                  <img 
                    src="/smontojo.jpg" 
                    alt="Shaira Montojo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Montojo, Shaira Lorraine Q.</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-3 ring-2 ring-primary-200">
                  <img 
                    src="/aorig.jpg" 
                    alt="Al Gabriel Orig" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Orig, Al Gabriel A.</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden mr-3 ring-2 ring-primary-200">
                  <img 
                    src="/cte.png" 
                    alt="Charlese Te" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Te, Charlese Jeanrie A.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adviser</h3>
            <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="w-20 h-20 rounded-full overflow-hidden mr-4 ring-2 ring-green-200">
                <img 
                  src="/kadlaon.jpg" 
                  alt="Ms. Kristine Mae Adlaon" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ms. Kristine Mae Adlaon, MIT</p>
                <p className="text-sm text-gray-600">Thesis Adviser</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Overview</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Research Objectives</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Develop a reference-free evaluation metric for Philippine language machine translation
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Create an annotation tool for collecting human evaluation data
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Establish quality assessment frameworks for low-resource languages
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Contribute to Filipino NLP research and development
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Human annotation interface for translation quality assessment
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Error classification system (syntactic/semantic, major/minor)
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Multi-user annotation and evaluation workflows
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Support for multiple Philippine languages
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Impact & Contribution */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Research Impact</h2>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <p className="text-gray-700 leading-relaxed">
            This research contributes to the advancement of natural language processing for Philippine languages, 
            addressing the critical need for evaluation metrics in low-resource language scenarios. The Lakra 
            annotation tool serves as both a data collection platform and a practical implementation of reference-free 
            evaluation methodologies, supporting the broader goal of improving machine translation quality for Filipino languages.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">
          © 2025 University of the Immaculate Conception - College of Computer Studies
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This tool is part of ongoing academic research in machine translation evaluation for Philippine languages.
        </p>
      </div>
      </div>
    </>
  );
};

export default About;
