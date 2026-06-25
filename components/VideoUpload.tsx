
import React, { useState, useCallback } from 'react';
import { UploadCloudIcon, FilmIcon } from './icons';

interface VideoUploadProps {
  onVideoSelect: (file: File) => void;
  videoFile: File | null;
  disabled: boolean;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoSelect, videoFile, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0] && files[0].type.startsWith('video/')) {
      onVideoSelect(files[0]);
      setVideoSrc(URL.createObjectURL(files[0]));
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [disabled]);
  
  const borderColor = isDragging ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600';
  const ringColor = isDragging ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : '';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">1. Upload Unboxing Video</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Upload a short video (&lt;1 min) of the package being opened. Ensure the shipping box remains in frame at all times.
      </p>
      
      {!videoFile ? (
         <label
          htmlFor="video-upload"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed ${borderColor} rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all ${ringColor}`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloudIcon className="w-10 h-10 mb-3 text-gray-400"/>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">MP4, MOV, WEBM (Max 50MB)</p>
          </div>
          <input id="video-upload" type="file" accept="video/*" className="hidden" disabled={disabled} onChange={(e) => handleFileChange(e.target.files)} />
        </label>
      ) : (
        <div className="mt-4">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <FilmIcon className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{videoFile.name}</span>
          </div>
          <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {videoSrc && <video src={videoSrc} controls className="w-full h-auto" />}
          </div>
        </div>
      )}
    </div>
  );
};
