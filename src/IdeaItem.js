// IdeaItem.js
import React from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import CommentSection from './CommentSection';

function IdeaItem({ idea, onVote, onAddComment, userVotes, currentUser }) {
  const hasVoted = userVotes && userVotes[idea.id] !== undefined;
  const userVote = userVotes && userVotes[idea.id];

  return (
    <div className="idea-item">
      <div className="idea-header">
        <h3>{idea.title}</h3>
        <span className="idea-category">{idea.category}</span>
      </div>
      <p className="idea-description">{idea.description}</p>
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
      <CommentSection 
        comments={idea.comments || []}
        onAddComment={(comment) => onAddComment(idea.id, comment)}
        currentUser={currentUser}
      />
    </div>
  );
}

export default IdeaItem;
