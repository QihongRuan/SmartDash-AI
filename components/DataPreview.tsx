import React, { useMemo } from 'react';
import { FileText, Play, ArrowLeft, Table as TableIcon, Database } from 'lucide-react';

interface DataPreviewProps {
  csvContent: string;
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DataPreview: React.FC<DataPreviewProps> = ({ csvContent, fileName, onConfirm, onCancel }) => {
  // Parsing logic
  const { headers, rows, columns } = useMemo(() => {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return { headers: [], rows: [], columns: [] };

    // Simple CSV parser that handles basic commas.
    // NOTE: This assumes a simple CSV structure. Complex CSVs with quoted commas might need a library.
    const parseLine = (line: string) => {
        // Basic split by comma, respecting quotes is complex in regex but for simple preview this often suffices
        // or strictly regex: line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
    };

    const headers = parseLine(lines[0]);
    const dataLines = lines.slice(1, 6); // Take up to 5 sample rows
    const rows = dataLines.map(parseLine);

    const columns = headers.map((header, index) => {
      const sampleValues = rows.map(row => row[index]).filter(val => val !== undefined && val !== '');
      
      // Infer type
      let type = 'Categorical'; // Default (String)
      
      // Check for Numerical
      // We check if ALL non-empty samples are valid numbers
      const isNumber = sampleValues.length > 0 && sampleValues.every(val => !isNaN(Number(val)));
      
      if (isNumber) {
        type = 'Numerical';
      } else {
        // Check for Date
        // Flexible date parsing
        const isDate = sampleValues.length > 0 && sampleValues.every(val => {
            const d = Date.parse(val);
            // Check if it's a valid date and not just a number (Date.parse accepts numbers)
            return !isNaN(d) && isNaN(Number(val)); 
        });
        if (isDate) type = 'Date/Time';
      }

      return {
        name: header,
        type,
        samples: sampleValues.slice(0, 3).join(', ')
      };
    });

    return { headers, rows, columns };
  }, [csvContent]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Data Preview</h2>
          <p className="text-slate-500">Review your data structure before analysis</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-blue-100">
          <FileText size={16} />
          {fileName}
        </div>
      </div>

      {/* Variables Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Database size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Variable Detection</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 w-1/3">Variable Name</th>
                <th className="px-6 py-3 w-1/4">Detected Type</th>
                <th className="px-6 py-3">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{col.name}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${col.type === 'Numerical' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        col.type === 'Date/Time' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                        'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {col.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs truncate max-w-xs">
                    {col.samples}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <TableIcon size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Raw Data Sample (First 5 rows)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
              <tr>
                {headers.map((h, i) => <th key={i} className="px-4 py-3 bg-slate-50/50">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50">
                   {row.map((cell, cIdx) => (
                     <td key={cIdx} className="px-4 py-3 text-slate-600 font-mono text-xs">{cell}</td>
                   ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button 
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Upload
        </button>
        <button 
          onClick={onConfirm}
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <Play size={18} />
          Generate Dashboard
        </button>
      </div>
    </div>
  );
};

export default DataPreview;