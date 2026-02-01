import React, { useState } from 'react';
import { LayoutDashboard, Loader2, Sparkles, XCircle, CheckCircle2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import Dashboard from './components/Dashboard';
import { analyzeCsvData } from './services/geminiService';
import { DashboardData } from './types';

type Step = 'upload' | 'preview' | 'dashboard';

function App() {
  const [step, setStep] = useState<Step>('upload');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Stored raw content for analysis
  const [csvContent, setCsvContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  // Step 1: Handle File Selection -> Move to Preview
  const handleFileSelect = (content: string, name: string) => {
    setCsvContent(content);
    setFileName(name);
    setError(null);
    setStep('preview');
  };

  // Step 2: Confirm Preview -> Move to Dashboard (Analysis)
  const handleConfirmAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const processedData = await analyzeCsvData(csvContent);
      setData(processedData);
      setStep('dashboard');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while analyzing the data.");
    } finally {
      setLoading(false);
    }
  };

  // Back from Preview to Upload
  const handleCancelPreview = () => {
    setStep('upload');
    setCsvContent("");
    setFileName("");
    setError(null);
  };

  // Reset from Dashboard to Upload
  const handleReset = () => {
    setData(null);
    setFileName("");
    setCsvContent("");
    setError(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
                <LayoutDashboard className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">DashSmart</h1>
          </div>
          
          {/* Step Indicator */}
          {!loading && step !== 'dashboard' && (
             <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'upload' ? 'border-blue-600 text-blue-600' : 'border-slate-300 text-slate-400'}`}>1</div>
                    <span>Upload</span>
                </div>
                <div className="w-8 h-px bg-slate-200"></div>
                <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'preview' ? 'border-blue-600 text-blue-600' : 'border-slate-300 text-slate-400'}`}>2</div>
                    <span>Preview</span>
                </div>
                <div className="w-8 h-px bg-slate-200"></div>
                <div className="flex items-center gap-2 text-slate-300">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-200">3</div>
                    <span>Dashboard</span>
                </div>
             </div>
          )}

          {step === 'dashboard' && (
            <button 
                onClick={handleReset}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2"
            >
                <XCircle size={16} />
                Close Analysis
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
              <div className="text-center space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-2 border border-blue-100">
                    <Sparkles size={16} />
                    <span>Powered by Gemini 3 Flash</span>
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  AI-Powered Dashboard in Seconds
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Upload your raw CSV data. We'll automatically identify variables, detect patterns, and generate a professional dashboard in seconds.
                </p>
              </div>
              
              <div className="w-full">
                <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && !loading && (
             <DataPreview 
                csvContent={csvContent} 
                fileName={fileName} 
                onConfirm={handleConfirmAnalysis} 
                onCancel={handleCancelPreview} 
             />
          )}

          {/* Loading State (Transition to Step 3) */}
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-blue-600 animate-pulse" size={24} />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-800">Generating Dashboard...</h3>
                    <p className="text-slate-500">Gemini is analyzing {fileName} for insights, trends, and KPIs.</p>
                </div>
            </div>
          )}

          {/* Step 3: Dashboard */}
          {step === 'dashboard' && data && (
            <Dashboard data={data} fileName={fileName} />
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="max-w-md mx-auto mt-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700 shadow-sm">
                <XCircle className="shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="font-semibold text-sm">Analysis Failed</h4>
                    <p className="text-sm opacity-90">{error}</p>
                    <button 
                        onClick={() => setError(null)}
                        className="text-xs font-semibold mt-2 hover:underline"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
          )}

        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-slate-500 mb-2">&copy; {new Date().getFullYear()} DashSmart AI.</p>
            <p className="text-xs text-slate-400">Secure • Private • AI-Powered</p>
        </div>
      </footer>
    </div>
  );
}

export default App;