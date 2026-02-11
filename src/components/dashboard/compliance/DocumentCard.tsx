import React from 'react';
import { FileText, UploadCloud, LucideIcon } from 'lucide-react';
import { UserProfile } from '@/src/types/types';

interface DocumentCardProps {
  title: string;
  icon: LucideIcon;
  isVerified: boolean;
  documentNumber?: string;
  uploadDate?: string;
  onUpload: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  title, 
  icon: Icon, 
  isVerified, 
  documentNumber, 
  uploadDate,
  onUpload
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
        <h4 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Icon size={18} className="text-slate-500 dark:text-slate-400" />
          {title}
        </h4>
        {isVerified && <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">APPROVED</span>}
      </div>
      <div className="p-6 text-center">
        {isVerified ? (
          <div className="py-4">
            <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-3">
              <Icon size={32} className="text-slate-400 dark:text-slate-500" />
            </div>
            {documentNumber && <p className="text-sm text-slate-500 dark:text-slate-400">Document on file: <span className="font-medium text-slate-900 dark:text-white">{documentNumber}</span></p>}
            {uploadDate && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Uploaded on {uploadDate}</p>}
          </div>
        ) : (
          <div 
            onClick={onUpload}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
          >
            <UploadCloud size={40} className="mx-auto text-slate-400 dark:text-slate-500 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors mb-3" />
            <p className="font-medium text-slate-900 dark:text-white">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF, JPG, or PNG (Max 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
