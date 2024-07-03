import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { FaLightbulb, FaTag } from 'react-icons/fa';

function IdeaForm({ onSubmit, categories }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && description && category) {
      onSubmit({ title, description, category });
      setTitle('');
      setDescription('');
      setCategory('');
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  return (
    <form onSubmit={handleSubmit} className="idea-form">
      <div className="input-container">
        <label htmlFor="title"><FaLightbulb /> Idea Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="input-container">
        <label htmlFor="description"><FaLightbulb /> Idea Description</label>
        <ReactQuill 
          theme="snow"
          value={description}
          onChange={setDescription}
          modules={modules}
          formats={formats}
        />
      </div>
      <div className="input-container">
        <label htmlFor="category"><FaTag /> Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <button type="submit">Submit Idea</button>
    </form>
  );
}

export default IdeaForm;
