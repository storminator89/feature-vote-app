import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import Comment from './Comment';

function IdeaItem({ idea, onVote, onAddComment, onLikeComment, onReplyToComment, userVotes, currentUser }) {
  const [newComment, setNewComment] = useState('');
  const hasVoted = userVotes && userVotes[idea.id] !== undefined;
  const userVote = userVotes && userVotes[idea.id];

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(idea.id, { text: newComment });
      setNewComment('');
    }
  };

  const sortedComments = useMemo(() => {
    return idea.comments ? [...idea.comments].sort((a, b) => b.likes - a.likes) : [];
  }, [idea.comments]);

  return (
    <div className="idea-item">
      <div className="idea-header">
        <h3>Feature #{idea.id}: {idea.title}</h3>
        <span className="idea-category">{idea.category}</span>
      </div>
      <div className="idea-content">
        <div className="idea-description">
          <ReactMarkdown>{idea.description}</ReactMarkdown>
        </div>
        <div className="comment-section">
          <h4>Comments</h4>
          {sortedComments.length > 0 ? (
            <ul className="comment-list">
              {sortedComments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onLike={(commentId) => onLikeComment(idea.id, commentId)}
                  onReply={(commentId, replyText) => onReplyToComment(idea.id, commentId, replyText)}
                  currentUser={currentUser}
                  ideaId={idea.id}
                />
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
      </div>
      <div className="idea-footer">
        <div className="vote-section">
          <button
            onClick={() => onVote(idea.id, 'up')}
            disabled={hasVoted}
            className={`vote-button ${userVote === 'up' ? 'voted' : ''}`}
          >
            <FaThumbsUp />
          </button>
          <span>{idea.votes}</span>
          <button
            onClick={() => onVote(idea.id, 'down')}
            disabled={hasVoted}
            className={`vote-button ${userVote === 'down' ? 'voted' : ''}`}
          >
            <FaThumbsDown />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IdeaItem;