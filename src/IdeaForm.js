import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaLightbulb, FaTag, FaEye, FaEyeSlash, FaBold, FaItalic, FaListUl, FaListOl, FaQuoteRight, FaCode } from 'react-icons/fa';
import './IdeaForm.css';

function IdeaForm({ onSubmit, categories }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && description && category) {
      onSubmit({ title, description, category });
      setTitle('');
      setDescription('');
      setCategory('');
      setShowPreview(false);
    }
  };

  const insertMarkdown = useCallback((start, end) => {
    const textarea = document.getElementById('description');
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const textBefore = description.substring(0, selectionStart);
    const textAfter = description.substring(selectionEnd, description.length);
    const selectedText = description.substring(selectionStart, selectionEnd);

    setDescription(
      textBefore + start + (selectedText || 'text') + end + textAfter
    );

    // Set focus back to textarea and update cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectionStart + start.length,
        selectionEnd + start.length + (selectedText ? 0 : 4)
      );
    }, 0);
  }, [description]);

  const toolbarItems = [
    { icon: <FaBold />, action: () => insertMarkdown('**', '**'), tooltip: 'Bold' },
    { icon: <FaItalic />, action: () => insertMarkdown('*', '*'), tooltip: 'Italic' },
    { icon: <FaListUl />, action: () => insertMarkdown('- ', ''), tooltip: 'Unordered List' },
    { icon: <FaListOl />, action: () => insertMarkdown('1. ', ''), tooltip: 'Ordered List' },
    { icon: <FaQuoteRight />, action: () => insertMarkdown('> ', ''), tooltip: 'Quote' },
    { icon: <FaCode />, action: () => insertMarkdown('`', '`'), tooltip: 'Inline Code' },
  ];

  return (
    <form onSubmit={handleSubmit} className="idea-form">
      <div className="input-container">
        <label htmlFor="title">
          <FaLightbulb /> Idea Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your idea title"
          required
        />
      </div>

      <div className="input-container">
        <label htmlFor="description">
          <FaLightbulb /> Idea Description (Markdown supported)
        </label>
        <div className="description-container">
          <div className="markdown-toolbar">
            {toolbarItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={item.action}
                title={item.tooltip}
              >
                {item.icon}
              </button>
            ))}
          </div>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your idea using Markdown."
            required
          />
          <button
            type="button"
            className="preview-toggle"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <FaEyeSlash /> : <FaEye />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
        {showPreview && (
          <div className="markdown-preview">
            <h4>Preview:</h4>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </div>
        )}
      </div>

      <div className="input-container">
        <label htmlFor="category">
          <FaTag /> Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="submit-button">
        Submit Idea
      </button>
    </form>
  );
}

export default IdeaForm;