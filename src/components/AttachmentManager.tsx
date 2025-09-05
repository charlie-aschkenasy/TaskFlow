import React, { useState, useRef } from 'react';
import { Paperclip, Link, File, ExternalLink, X, Upload, Plus } from 'lucide-react';
import { Attachment } from '../types';

interface AttachmentManagerProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  readOnly?: boolean;
}

export function AttachmentManager({ attachments, onAttachmentsChange, readOnly = false }: AttachmentManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Create a blob URL for the file
      const url = URL.createObjectURL(file);
      
      const newAttachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        type: 'file',
        url: url,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      onAttachmentsChange([...attachments, newAttachment]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    // Auto-detect name from URL if not provided
    const name = linkName.trim() || getLinkNameFromUrl(linkUrl);

    const newAttachment: Attachment = {
      id: crypto.randomUUID(),
      name: name,
      type: 'link',
      url: linkUrl.trim(),
      uploadedAt: new Date().toISOString(),
    };

    onAttachmentsChange([...attachments, newAttachment]);
    setLinkUrl('');
    setLinkName('');
    setShowAddForm(false);
  };

  const getLinkNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '') || 'Link';
    } catch {
      return 'Link';
    }
  };

  const removeAttachment = (id: string) => {
    const attachment = attachments.find(a => a.id === id);
    if (attachment && attachment.type === 'file') {
      // Revoke blob URL to free memory
      URL.revokeObjectURL(attachment.url);
    }
    onAttachmentsChange(attachments.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'mp4':
      case 'mov':
      case 'avi':
        return '🎥';
      case 'mp3':
      case 'wav':
        return '🎵';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📄';
    }
  };

  if (readOnly && attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Paperclip size={14} />
            Attachments ({attachments.length})
          </div>
          <div className="space-y-2">
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border"
              >
                <div className="flex-shrink-0">
                  {attachment.type === 'file' ? (
                    <span className="text-lg">{getFileIcon(attachment.name)}</span>
                  ) : (
                    <Link size={16} className="text-blue-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {attachment.name}
                    </span>
                    {attachment.type === 'link' && (
                      <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  {attachment.size && (
                    <span className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (attachment.type === 'link') {
                        window.open(attachment.url, '_blank');
                      } else {
                        // For files, create a download link
                        const link = document.createElement('a');
                        link.href = attachment.url;
                        link.download = attachment.name;
                        link.click();
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title={attachment.type === 'link' ? 'Open link' : 'Download file'}
                  >
                    {attachment.type === 'link' ? <ExternalLink size={14} /> : <File size={14} />}
                  </button>
                  
                  {!readOnly && (
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="space-y-2">
          {!showAddForm ? (
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Upload size={14} />
                Upload File
              </button>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Link size={14} />
                Add Link
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="*/*"
              />
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <form onSubmit={handleAddLink} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link URL *
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name (optional)
                  </label>
                  <input
                    type="text"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    placeholder="Auto-detected from URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                  >
                    Add Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setLinkUrl('');
                      setLinkName('');
                    }}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}