import React, { useState, useCallback } from 'react';
import { DocumentArrowUpIcon } from './IconComponents';

interface DocumentUploadProps {
    onFileUpload: (file: File) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (files: FileList | null) => {
        if (files && files.length > 0) {
            onFileUpload(files[0]);
        }
    };

    const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);
    
    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    }, [onFileUpload]);


    return (
        <div>
            <div
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragging ? 'border-cyan-400 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'}`}
            >
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-slate-500" />
                <p className="mt-2 text-sm text-slate-400">
                    <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">Upload a single document (.txt, .md, .pdf)</p>
                <input
                    type="file"
                    accept=".txt,.md,text/plain,application/pdf"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                />
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
                The system will attempt to extract applicant data from the document to pre-fill the form for your review.
            </p>
        </div>
    );
};