import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import { modelPredictionAPI } from '../../services/supabase-api';
import type { ModelPredictionImport as ModelPredictionImportType } from '../../types';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Download,
  Brain,
  BarChart3
} from 'lucide-react';

const ModelPredictionImport: React.FC = () => {
  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importData, setImportData] = useState<ModelPredictionImportType>({
    model_name: '',
    model_version: '',
    predictions: []
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'application/json') {
      setImportResult({
        imported: 0,
        errors: ['Please select a JSON file']
      });
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate the JSON structure
        if (!data.model_name || !data.predictions || !Array.isArray(data.predictions)) {
          setImportResult({
            imported: 0,
            errors: ['Invalid JSON format. Expected model_name and predictions array.']
          });
          return;
        }

        setImportData(data);
        setImportResult(null);
      } catch (error) {
        setImportResult({
          imported: 0,
          errors: ['Invalid JSON file: ' + (error instanceof Error ? error.message : 'Unknown error')]
        });
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!importData.model_name || importData.predictions.length === 0) {
      setImportResult({
        imported: 0,
        errors: ['Please provide model name and predictions data']
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await modelPredictionAPI.importPredictions(importData);
      setImportResult(result);
      
      if (result.imported > 0) {
        // Reset form on successful import
        setImportData({
          model_name: '',
          model_version: '',
          predictions: []
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      logger.apiError('importPredictions', error as Error, {
        component: 'ModelPredictionImport',
        metadata: { userId: user?.id }
      });
      setImportResult({
        imported: 0,
        errors: ['Import failed: ' + (error instanceof Error ? error.message : 'Unknown error')]
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = {
      model_name: "example_model",
      model_version: "1.0.0",
      predictions: [
        {
          source_data: {
            content: "Sample text to analyze",
            data_type: "text",
            metadata: {
              domain: "general",
              language: "en"
            },
            domain: "general",
            language: "en"
          },
          prediction_data: {
            classification: "positive",
            confidence: 0.95,
            explanation: "The text expresses positive sentiment"
          },
          confidence_score: 0.95,
          prediction_metadata: {
            processing_time: 0.5,
            model_version: "1.0.0"
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model_prediction_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Import Model Predictions</h1>
          <p className="mt-2 text-gray-600">
            Import model predictions for evaluation and review by evaluators
          </p>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`mb-6 p-4 rounded-lg ${
            importResult.imported > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              {importResult.imported > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  importResult.imported > 0 ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.imported > 0 
                    ? `Successfully imported ${importResult.imported} predictions`
                    : 'Import failed'
                  }
                </p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-700 font-medium">Errors:</p>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-blue-600" />
              Upload Model Predictions
            </h3>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your JSON file here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supported format: JSON file with model predictions
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {selectedFile && (
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={downloadTemplate}
                className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Download JSON template
              </button>
            </div>
          </div>

          {/* Import Configuration */}
          {importData.model_name && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                Import Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={importData.model_name}
                    onChange={(e) => setImportData(prev => ({ ...prev, model_name: e.target.value }))}
                    className="input-field"
                    placeholder="Enter model name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Version (Optional)
                  </label>
                  <input
                    type="text"
                    value={importData.model_version}
                    onChange={(e) => setImportData(prev => ({ ...prev, model_version: e.target.value }))}
                    className="input-field"
                    placeholder="Enter model version"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Predictions to Import
                  </span>
                  <span className="text-sm text-gray-500">
                    {importData.predictions.length} items
                  </span>
                </div>
                <div className="mt-2 bg-gray-50 rounded border p-3 max-h-40 overflow-y-auto">
                  {importData.predictions.length > 0 ? (
                    <div className="space-y-2">
                      {importData.predictions.slice(0, 5).map((prediction, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          <span className="font-medium">Prediction {index + 1}:</span>
                          <span className="ml-2">
                            {prediction.source_data.content.substring(0, 50)}
                            {prediction.source_data.content.length > 50 ? '...' : ''}
                          </span>
                        </div>
                      ))}
                      {importData.predictions.length > 5 && (
                        <div className="text-sm text-gray-500">
                          ... and {importData.predictions.length - 5} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No predictions loaded</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleImport}
                  disabled={isImporting || !importData.model_name || importData.predictions.length === 0}
                  className="btn-primary flex items-center"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Importing...
                    </>
                  ) : (
                    <>
                      Import Predictions
                      <BarChart3 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Import Instructions</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>JSON Format:</strong> Your file should contain a JSON object with the following structure:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code>model_name</code>: Name of the model that generated the predictions</li>
                <li><code>model_version</code>: Optional version identifier</li>
                <li><code>predictions</code>: Array of prediction objects</li>
              </ul>
              <p><strong>Each prediction should include:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code>source_data</code>: The original data (content, type, metadata)</li>
                <li><code>prediction_data</code>: The model's prediction output</li>
                <li><code>confidence_score</code>: Optional confidence score (0-1)</li>
                <li><code>prediction_metadata</code>: Optional additional metadata</li>
              </ul>
              <p><strong>Note:</strong> After import, predictions will be available for evaluators to review and assess.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPredictionImport;
