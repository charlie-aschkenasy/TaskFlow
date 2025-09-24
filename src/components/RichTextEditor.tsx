import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, readOnly = false }: RichTextEditorProps) {
  const modules = {
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link',
    'align'
  ];

  return (
    <div className={`rich-text-editor ${readOnly ? 'read-only' : ''}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          backgroundColor: readOnly ? 'transparent' : 'white',
        }}
      />
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-bottom: none;
          border-radius: 0.375rem 0.375rem 0 0;
        }
        
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-top: none;
          border-radius: 0 0 0.375rem 0.375rem;
          font-family: inherit;
        }
        
        .rich-text-editor.read-only .ql-container {
          border: none;
          padding: 0;
        }
        
        .rich-text-editor .ql-editor {
          min-height: 80px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .rich-text-editor.read-only .ql-editor {
          padding: 0;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
        
        .rich-text-editor .ql-editor ol,
        .rich-text-editor .ql-editor ul {
          padding-left: 1.5em;
        }
        
        .rich-text-editor .ql-editor li {
          margin-bottom: 0.25em;
        }
        
        .rich-text-editor .ql-editor h1,
        .rich-text-editor .ql-editor h2,
        .rich-text-editor .ql-editor h3 {
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        
        .rich-text-editor .ql-editor h1 {
          font-size: 1.5em;
        }
        
        .rich-text-editor .ql-editor h2 {
          font-size: 1.25em;
        }
        
        .rich-text-editor .ql-editor h3 {
          font-size: 1.125em;
        }
        
        .rich-text-editor .ql-editor strong {
          font-weight: 600;
        }
        
        .rich-text-editor .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .rich-text-editor .ql-editor a:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}