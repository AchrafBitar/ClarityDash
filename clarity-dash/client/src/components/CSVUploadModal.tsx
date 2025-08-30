import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import type { CSVMapping } from '../types';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, mapping: CSVMapping) => Promise<void>;
}

interface CSVPreview {
  headers: string[];
  data: string[][];
}

const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVPreview | null>(null);
  const [mapping, setMapping] = useState<CSVMapping>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Parse CSV to preview
    Papa.parse(selectedFile, {
      header: true,
      preview: 5, // Show first 5 rows
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV file. Please check the file format.');
          return;
        }

        const headers = results.meta.fields || [];
        const data = results.data.slice(0, 5) as string[][];
        
        setPreview({ headers, data });
        
        // Auto-map common column names
        const autoMapping: CSVMapping = {};
        headers.forEach((header, index) => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('description') || lowerHeader.includes('desc') || lowerHeader.includes('note')) {
            autoMapping.descriptionColumn = index + 1;
          } else if (lowerHeader.includes('amount') || lowerHeader.includes('sum') || lowerHeader.includes('value')) {
            autoMapping.amountColumn = index + 1;
          } else if (lowerHeader.includes('type') || lowerHeader.includes('category')) {
            autoMapping.typeColumn = index + 1;
          } else if (lowerHeader.includes('category') || lowerHeader.includes('cat')) {
            autoMapping.categoryColumn = index + 1;
          } else if (lowerHeader.includes('date')) {
            autoMapping.dateColumn = index + 1;
          }
        });
        setMapping(autoMapping);
      },
      error: () => {
        setError('Error reading CSV file');
      }
    });
  };

  const handleMappingChange = (field: keyof CSVMapping, value: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: value === '' ? undefined : parseInt(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    if (!mapping.descriptionColumn || !mapping.amountColumn) {
      setError('Description and Amount columns are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onUpload(file, mapping);
      setFile(null);
      setPreview(null);
      setMapping({});
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload CSV');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setMapping({});
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Import CSV Transactions</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select CSV File
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="space-y-2">
                <svg className="w-12 h-12 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <p className="text-slate-600">
                  {file ? file.name : 'Click to select or drag and drop a CSV file'}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse Files
                </button>
              </div>
            </div>
          </div>

          {/* Column Mapping */}
          {preview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Map CSV Columns</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description Column <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mapping.descriptionColumn || ''}
                    onChange={(e) => handleMappingChange('descriptionColumn', e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="">Select column</option>
                    {preview.headers.map((header, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}. {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount Column <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mapping.amountColumn || ''}
                    onChange={(e) => handleMappingChange('amountColumn', e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="">Select column</option>
                    {preview.headers.map((header, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}. {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type Column
                  </label>
                  <select
                    value={mapping.typeColumn || ''}
                    onChange={(e) => handleMappingChange('typeColumn', e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="">Select column (optional)</option>
                    {preview.headers.map((header, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}. {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category Column
                  </label>
                  <select
                    value={mapping.categoryColumn || ''}
                    onChange={(e) => handleMappingChange('categoryColumn', e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="">Select column (optional)</option>
                    {preview.headers.map((header, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}. {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date Column
                  </label>
                  <select
                    value={mapping.dateColumn || ''}
                    onChange={(e) => handleMappingChange('dateColumn', e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="">Select column (optional)</option>
                    {preview.headers.map((header, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}. {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Preview (First 5 rows)</h4>
                <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          {preview.headers.map((header, index) => (
                            <th key={index} className="px-4 py-2 text-left font-medium text-slate-700">
                              {index + 1}. {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.data.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t border-slate-200">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-2 text-slate-600">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all duration-200"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !file || !mapping.descriptionColumn || !mapping.amountColumn}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                'Upload CSV'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadModal;
