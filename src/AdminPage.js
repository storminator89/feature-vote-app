// AdminPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css';
import { BASE_URL } from './config';

function AdminPage({ onDeleteIdea, onDeleteComment }) {
  const [ideas, setIdeas] = useState([]);
  const [expandedIdea, setExpandedIdea] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/ideas`);
      setIdeas(response.data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const deleteIdea = async (id) => {
    await onDeleteIdea(id);
    setIdeas(ideas.filter(idea => idea.id !== id));
  };

  const deleteComment = async (ideaId, commentId) => {
    await onDeleteComment(ideaId, commentId);
    setIdeas(ideas.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          comments: idea.comments.filter(comment => comment.id !== commentId)
        };
      }
      return idea;
    }));
  };

  const toggleExpand = (id) => {
    setExpandedIdea(expandedIdea === id ? null : id);
  };

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Votes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ideas.map(idea => (
            <React.Fragment key={idea.id}>
              <tr>
                <td>{idea.id}</td>
                <td>{idea.title}</td>
                <td>{idea.category}</td>
                <td>{idea.votes}</td>
                <td>
                  <button onClick={() => deleteIdea(idea.id)}>Delete Idea</button>
                  <button onClick={() => toggleExpand(idea.id)}>
                    {expandedIdea === idea.id ? 'Hide Comments' : 'Show Comments'}
                  </button>
                </td>
              </tr>
              {expandedIdea === idea.id && (
                <tr>
                  <td colSpan="5">
                    <h4>Comments:</h4>
                    {idea.comments && idea.comments.length > 0 ? (
                      <ul>
                        {idea.comments.map(comment => (
                          <li key={comment.id}>
                            {comment.text} - by {comment.username}
                            <button onClick={() => deleteComment(idea.id, comment.id)}>Delete Comment</button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No comments for this idea.</p>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;
