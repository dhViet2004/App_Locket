import React, { useState, useRef, useEffect } from 'react';

export default function ImageUpload({ label, value, onChange, error, onUrlChange, onUpload, uploadEndpoint }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Sync preview with value prop
  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 10MB');
      return;
    }

    // Create local preview first
    const reader = new FileReader();
    reader.onloadend = () => {
      const localPreview = reader.result;
      setPreview(localPreview);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary if uploadEndpoint or onUpload is provided
    if (uploadEndpoint || onUpload) {
      setUploading(true);
      try {
        let imageUrl;
        if (onUpload) {
          // Custom upload function
          imageUrl = await onUpload(file);
        } else if (uploadEndpoint) {
          // Use default upload endpoint
          const formData = new FormData();
          formData.append('image', file);
          const response = await fetch(uploadEndpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
          }
          imageUrl = data.data?.imageUrl || data.imageUrl;
        }

        if (imageUrl) {
          setPreview(imageUrl);
          if (onChange) {
            onChange(imageUrl);
          }
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert(err.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
        setPreview(''); // Clear preview on error
      } finally {
        setUploading(false);
      }
    } else {
      // No upload, just use local preview
      if (onChange) {
        onChange(reader.result);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    if (onUrlChange) {
      onUrlChange(url);
    }
  };

  const handleRemove = () => {
    setPreview('');
    if (onChange) {
      onChange('');
    }
    if (onUrlChange) {
      onUrlChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* URL Input */}
      <div className="mb-3">
        <input
          type="url"
          value={value || ''}
          onChange={handleUrlChange}
          placeholder="Hoặc nhập URL ảnh: https://..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
        {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : preview
            ? 'border-gray-300 hover:border-indigo-400'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-sm text-gray-600">Đang tải ảnh lên...</p>
          </div>
        ) : preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
              onError={() => setPreview('')}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="mt-4">
              <span className="text-indigo-600 font-medium">Click để tải ảnh lên</span>
              <span className="text-gray-500"> hoặc kéo thả ảnh vào đây</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
}

