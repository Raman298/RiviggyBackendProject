import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { uploadAPI } from '../../services/api';

/**
 * FileUpload Component
 * Reusable component for uploading files (avatar, images, attachments)
 * 
 * Props:
 * - type: 'avatar' | 'restaurant-image' | 'attachments'
 * - restaurantId?: string (required if type='restaurant-image')
 * - onUploadSuccess: (filePath, file) => void
 * - onUploadError: (error) => void
 * - accept: string (file type filter, e.g., "image/*")
 * - label: string (display label)
 * - showPreview: boolean (show image preview)
 * - maxSize: number (max file size in MB)
 */
export default function FileUpload({
  type = 'avatar',
  restaurantId = null,
  onUploadSuccess = () => {},
  onUploadError = () => {},
  accept = 'image/*',
  label = 'Upload File',
  showPreview = true,
  maxSize = 5,
}) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const error = `File size must be less than ${maxSize}MB`;
      toast.error(error);
      onUploadError(error);
      return;
    }

    // Show preview if it's an image
    if (showPreview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }

    // Upload file
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append(type === 'attachments' ? 'attachments' : type === 'restaurant-image' ? 'coverImage' : 'avatar', file);

      let response;
      if (type === 'avatar') {
        response = await uploadAPI.uploadAvatar(formData);
      } else if (type === 'restaurant-image') {
        if (!restaurantId) {
          throw new Error('restaurantId is required for restaurant-image upload');
        }
        response = await uploadAPI.uploadRestaurantImage(restaurantId, formData);
      } else if (type === 'attachments') {
        response = await uploadAPI.uploadAttachments(formData);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        onUploadSuccess(response.data.filePath || response.data.files, file);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Upload failed';
      toast.error(message);
      onUploadError(message);
    } finally {
      setLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={loading}
        style={{ display: 'none' }}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        style={{
          background: '#FF8C42',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 10,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Syne',
          fontWeight: 600,
          fontSize: 14,
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? 'Uploading...' : label}
      </button>

      {preview && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: 200,
              maxHeight: 200,
              borderRadius: 10,
              objectFit: 'cover',
            }}
          />
        </div>
      )}
    </div>
  );
}
