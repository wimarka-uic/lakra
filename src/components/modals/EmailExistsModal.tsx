import React from 'react';
import Modal from './Modal';
import { AlertCircle, Mail, ArrowRight, X } from 'lucide-react';

interface EmailExistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryDifferentEmail: () => void;
  email: string;
}

const EmailExistsModal: React.FC<EmailExistsModalProps> = ({
  isOpen,
  onClose,
  onTryDifferentEmail,
  email
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={false}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start mb-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email Already Registered
            </h3>
            <p className="text-sm text-gray-600">
              This email address is already associated with an existing account.
            </p>
          </div>
        </div>

        {/* Email Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-3" />
            <span className="text-sm font-medium text-gray-900">{email}</span>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-800">
                <strong>Account Already Exists:</strong> This email address is already registered. 
                Please use a different email address to create a new account.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button
            onClick={onTryDifferentEmail}
            className="flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Use Different Email
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Already have an account? <a href="/login" className="text-primary-600 hover:text-primary-500 underline">Sign in here</a>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default EmailExistsModal;
