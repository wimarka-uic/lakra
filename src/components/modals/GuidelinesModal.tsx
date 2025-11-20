import React from 'react';
import { Info } from 'lucide-react';
import Modal from './Modal';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const toneGuidelines = [
  {
    title: 'Write complete sentences',
    description: 'Communicate instructions with full sentences that include closing punctuation.',
  },
  {
    title: 'Spell out every word',
    description: 'Avoid abbreviations and contractions so the guidance reads as formally as possible.',
  },
  {
    title: 'Match formatting',
    description: 'Use consistent capitalization, typography, and spacing across instructions.',
  },
];

const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ isOpen, onClose, onAccept }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Annotation Guidelines"
      size="xl"
      closeOnBackdropClick={false}
      closeOnEscape={false}
      showCloseButton={true}
    >
      <div className="p-6">
        {/* Welcome Message */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <Info className="text-blue-600 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-blue-900">Welcome to the Lakra Annotation Tool.</h3>
          </div>
          <p className="text-blue-800">
            Thank you for participating in our machine translation evaluation project. Please read these guidelines carefully before starting your annotation work.
          </p>
        </div>

          {/* Main Guidelines */}
          <div className="space-y-6">
            {/* Overview */}
            <section>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Overview</h4>
              <p className="text-gray-600 mb-4">
                You will be evaluating machine-translated sentences by analyzing the quality of the translation compared to the source text. 
                Your task is to assess the quality of the translation and provide detailed feedback.
              </p>
            </section>

            <section>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Communication Tone</h4>
              <div className="grid md:grid-cols-3 gap-3">
                {toneGuidelines.map((item) => (
                  <div key={item.title} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Text Highlighting */}
            <section>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Text Highlighting and Error Classification</h4>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Select specific text portions to highlight and classify errors by type and severity:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Minor Errors</h5>
                    <div className="space-y-2">
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-3 h-3 bg-orange-400 rounded"></div>
                          <span className="text-sm font-medium text-orange-900">Minor Syntactic</span>
                        </div>
                        <p className="text-xs text-orange-800">
                          Small grammar, word order, or inflection errors that do not affect overall understanding.
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-3 h-3 bg-blue-400 rounded"></div>
                          <span className="text-sm font-medium text-blue-900">Minor Semantic</span>
                        </div>
                        <p className="text-xs text-blue-800">
                          Small meaning, context, or word choice errors that do not significantly impact comprehension.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Major Errors</h5>
                    <div className="space-y-2">
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span className="text-sm font-medium text-red-900">Major Syntactic</span>
                        </div>
                        <p className="text-xs text-red-800">
                          Significant grammar or structural errors that affect readability and understanding
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-3 h-3 bg-purple-500 rounded"></div>
                          <span className="text-sm font-medium text-purple-900">Major Semantic</span>
                        </div>
                        <p className="text-xs text-purple-800">
                          Serious meaning or context errors that significantly impact comprehension
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h6 className="font-medium text-gray-700 mb-2">How to Annotate:</h6>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Select the problematic text in the machine translation</li>
                    <li>Choose the appropriate error type and severity</li>
                    <li>Add a clear comment explaining the issue</li>
                    <li>Repeat for all errors you identify</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Final Form */}
            <section>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Final Form Requirement</h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-green-800 font-medium mb-2">
                      <strong>Required when you add error annotations:</strong>
                    </p>
                    <p className="text-green-800 mb-2">
                      After highlighting errors and adding comments, you must provide a corrected final form of the sentence. 
                      This should be your improved version of what the translation should be.
                    </p>
                    <p className="text-green-700 text-sm">
                      <strong>Note:</strong> If you do not highlight any errors, the final form is optional because you are indicating the translation is acceptable as is.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Scoring System */}
            <section>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Scoring System</h4>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Rate each translation on three dimensions using a 1-5 scale:
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">Fluency Score</h5>
                    <p className="text-sm text-blue-800 mb-2">
                      Evaluate how natural and readable the translation is.
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li><strong>5:</strong> Perfect fluency</li>
                      <li><strong>4:</strong> Good fluency, minor issues</li>
                      <li><strong>3:</strong> Acceptable fluency</li>
                      <li><strong>2:</strong> Poor fluency, hard to read</li>
                      <li><strong>1:</strong> Very poor fluency</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-900 mb-2">Adequacy Score</h5>
                    <p className="text-sm text-green-800 mb-2">
                      Determine how well the translation conveys the source meaning.
                    </p>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li><strong>5:</strong> Perfect meaning transfer</li>
                      <li><strong>4:</strong> Good meaning, minor loss</li>
                      <li><strong>3:</strong> Acceptable meaning</li>
                      <li><strong>2:</strong> Poor meaning transfer</li>
                      <li><strong>1:</strong> Very poor meaning</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h5 className="font-medium text-purple-900 mb-2">Overall Quality</h5>
                    <p className="text-sm text-purple-800 mb-2">
                      Provide a general assessment that considers fluency and adequacy.
                    </p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li><strong>5:</strong> Excellent translation</li>
                      <li><strong>4:</strong> Good translation</li>
                      <li><strong>3:</strong> Acceptable translation</li>
                      <li><strong>2:</strong> Poor translation</li>
                      <li><strong>1:</strong> Very poor translation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Best Practices */}
            <section>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Best Practices</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Recommended Practices</h5>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Read both sentences completely before annotating</li>
                    <li>Consider context and domain-specific terminology</li>
                    <li>Classify errors by type (syntactic vs semantic) and severity (minor vs major)</li>
                    <li>Highlight specific problematic words/phrases</li>
                    <li>Provide clear, constructive comments for each highlight</li>
                    <li>Give a corrected final form when you highlight errors</li>
                    <li>Be consistent in your evaluation criteria</li>
                    <li>Consider the target language's natural flow</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Practices to Avoid</h5>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Rush through annotations</li>
                    <li>Let personal preferences affect error classification</li>
                    <li>Ignore minor but important details</li>
                    <li>Give inconsistent ratings for similar issues</li>
                    <li>Leave vague or unhelpful comments</li>
                    <li>Mix up syntactic and semantic error types</li>
                    <li>Forget to provide a final form when highlighting errors</li>
                    <li>Over-highlight; select meaningful error segments instead</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h6 className="font-medium text-yellow-900 mb-2">Error Classification Tips:</h6>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p><strong>Syntactic errors:</strong> Grammar, word order, inflection, punctuation</p>
                  <p><strong>Semantic errors:</strong> Wrong meaning, incorrect word choice, missing context</p>
                  <p><strong>Minor errors:</strong> Do not significantly affect understanding</p>
                  <p><strong>Major errors:</strong> Seriously impact comprehension or readability</p>
                </div>
              </div>
            </section>

            {/* Examples */}
            <section>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Example Evaluation</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Source (English):</span>
                    <p className="text-sm italic">"The student submitted his assignment before the deadline."</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Machine Translation (Tagalog):</span>
                    <p className="text-sm">
                      "Ang estudyante <span className="bg-blue-100 border-b-2 border-blue-400 px-1 rounded text-blue-800">nagsumite ng kanyang takdang-aralin</span> bago ang <span className="bg-purple-100 border-b-2 border-purple-500 px-1 rounded text-purple-800">deadline</span>."
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Error Annotations:</span>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                        <div>
                          <span className="text-xs font-medium text-blue-800">Minor Semantic</span>
                          <span className="text-sm text-gray-700 ml-1">"nagsumite ng kanyang takdang-aralin"</span>
                          <p className="text-xs text-gray-600">More natural Tagalog: "ipinasa ang kanyang gawain"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                        <div>
                          <span className="text-xs font-medium text-purple-800">Major Semantic</span>
                          <span className="text-sm text-gray-700 ml-1">"deadline"</span>
                          <p className="text-xs text-gray-600">Should use proper Tagalog term: "takdang oras"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Final Form:</span>
                    <p className="text-sm bg-green-50 p-2 rounded border border-green-200">"Ipinasa ng mag-aaral ang kanyang gawain bago ang takdang oras."</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><strong>Fluency:</strong> 3</div>
                    <div><strong>Adequacy:</strong> 4</div>
                    <div><strong>Overall:</strong> 3</div>
                  </div>
                </div>
              </div>
            </section>
          </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 rounded-md hover:bg-gray-50"
          >
            I will review these guidelines later
          </button>
          <button
            onClick={onAccept}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium hover:scale-105 active:scale-95 hover:shadow-md"
          >
            I understand. Begin annotation.
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GuidelinesModal; 