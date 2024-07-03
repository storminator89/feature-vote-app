// Comment.js
import React, { useState } from 'react';
import { FaHeart, FaReply } from 'react-icons/fa';

function Comment({ comment, onLike, onReply, currentUser, ideaId }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleLike = () => {
    onLike(comment.id);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  return (
    <li className="comment-item">
      <div className="comment-header">
        <span className="comment-author">{comment.username}</span>
        <span className="comment-date">{formatDate(comment.created_at)}</span>
      </div>
      <p className="comment-text">{comment.text}</p>
      <div className="comment-footer">
        <button 
          className="comment-like-button" 
          onClick={handleLike} 
          aria-label="Like"
        >
          <FaHeart />
          <span className="comment-like-count">{comment.likes}</span>
        </button>
        <button 
          className="comment-reply-button" 
          onClick={() => setIsReplying(!isReplying)} 
          aria-label="Reply"
        >
          <FaReply />
          <span className="comment-reply-text">Reply</span>
        </button>
      </div>
      {isReplying && (
        <div className="reply-form">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
          />
          <button onClick={handleReply}>Submit</button>
        </div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <ul className="reply-list">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              currentUser={currentUser}
              ideaId={ideaId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default Comment;