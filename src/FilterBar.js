// src/FilterBar.js
import React from 'react';

function FilterBar({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="filter-bar">      
      <select 
        id="category-select"
        value={selectedCategory} 
        onChange={(e) => onSelectCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>
  );
}

export default FilterBar;
