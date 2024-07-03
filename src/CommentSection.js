import React, { useState } from 'react';

function CommentSection({ comments, onAddComment, currentUser }) {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment({ text: newComment });
      setNewComment('');
    }
  };

  return (
    <div className="comment-section">
      <h4>Comments</h4>
      {comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map((comment, index) => (
            <li key={index} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.username || 'Anonymous'}</span>
                <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p className="comment-text">{comment.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
      <form onSubmit={handleAddComment} className="comment-form">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="comment-input"
        />
        <button type="submit" className="comment-submit">Post</button>
      </form>
    </div>
  );
}

export default CommentSection;
