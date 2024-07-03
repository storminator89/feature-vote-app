// App.js
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import './App.css';
import IdeaForm from './IdeaForm';
import FilterBar from './FilterBar';
import IdeaItem from './IdeaItem';
import Login from './Login';
import Register from './Register';
import AdminPage from './AdminPage';
import axios from 'axios';

const CATEGORIES = ['UI', 'Performance', 'Feature', 'Bug Fix'];

function App() {
  const [user, setUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [errorMessage, setErrorMessage] = useState('');
  const [userVotes, setUserVotes] = useState({});

  const fetchIdeas = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ideas');
      console.log('Fetched ideas:', response.data);
      setIdeas(response.data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      setErrorMessage('Failed to load ideas. Please try again later.');
    }
  }, []);

  const fetchUserVotes = useCallback(async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/votes`);
      console.log('Fetched user votes:', response.data);
      setUserVotes(response.data);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Restored user from localStorage:', parsedUser);
      setUser(parsedUser);
    }
  }, [fetchIdeas]);

  useEffect(() => {
    if (user) {
      console.log('Fetching votes for user:', user);
      fetchUserVotes(user.id);
    }
  }, [user, fetchUserVotes]);

  const handleLogin = useCallback((userData) => {
    console.log('User logged in:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const handleLogout = useCallback(() => {
    console.log('User logged out');
    setUser(null);
    setUserVotes({});
    localStorage.removeItem('user');
  }, []);

  const addIdea = async (newIdea) => {
    try {
      console.log('Adding new idea:', newIdea);
      const response = await axios.post('http://localhost:5000/api/ideas', newIdea);
      const savedIdea = response.data;
      console.log('Saved idea:', savedIdea);
      setIdeas(prevIdeas => [...prevIdeas, { ...savedIdea, comments: [] }]);
    } catch (error) {
      console.error('Error adding idea:', error);
      setErrorMessage('Failed to add idea. Please try again.');
    }
  };

  const deleteIdea = async (id) => {
    try {
      console.log('Deleting idea:', id);
      await axios.delete(`http://localhost:5000/api/ideas/${id}`);
      setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id));
    } catch (error) {
      console.error('Error deleting idea:', error);
      setErrorMessage('Failed to delete idea. Please try again.');
    }
  };

  const handleVote = async (id, direction) => {
    if (!user) {
      setErrorMessage('Please log in to vote.');
      return;
    }

    if (userVotes[id]) {
      setErrorMessage('You have already voted for this idea.');
      return;
    }

    try {
      console.log('Voting for idea:', { id, direction, userId: user.id });
      const response = await axios.post(`http://localhost:5000/api/ideas/${id}/vote`, {
        direction,
        userId: user.id
      });
      console.log('Vote response:', response.data);

      setIdeas(prevIdeas => prevIdeas.map(idea => {
        if (idea.id === id) {
          return {
            ...idea,
            votes: Math.max(0, idea.votes + (direction === 'up' ? 1 : -1))
          };
        }
        return idea;
      }));

      setUserVotes(prevVotes => ({
        ...prevVotes,
        [id]: direction
      }));

      setErrorMessage('');
    } catch (error) {
      console.error('Error voting for idea:', error);
      setErrorMessage('Failed to vote. Please try again.');
    }
  };

  const handleAddComment = async (ideaId, commentData) => {
    try {
      console.log('Adding comment:', { ideaId, commentData, user });
      const response = await axios.post(`http://localhost:5000/api/ideas/${ideaId}/comments`, {
        text: commentData.text,
        userId: user.id,
        username: user.username
      });
      console.log('Server response:', response.data);
      const newComment = response.data;
      setIdeas(prevIdeas => prevIdeas.map(idea => {
        if (idea.id === ideaId) {
          return {
            ...idea,
            comments: [...(idea.comments || []), newComment]
          };
        }
        return idea;
      }));
    } catch (error) {
      console.error('Error adding comment:', error.response ? error.response.data : error.message);
      setErrorMessage('Failed to add comment. Please try again.');
    }
  };

  const handleDeleteComment = async (ideaId, commentId) => {
    try {
      console.log('Deleting comment:', { ideaId, commentId });
      await axios.delete(`http://localhost:5000/api/ideas/${ideaId}/comments/${commentId}`);
      setIdeas(prevIdeas => prevIdeas.map(idea => {
        if (idea.id === ideaId) {
          return {
            ...idea,
            comments: idea.comments.filter(comment => comment.id !== commentId)
          };
        }
        return idea;
      }));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setErrorMessage('Failed to delete comment. Please try again.');
    }
  };

  const handleLikeComment = async (ideaId, commentId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/ideas/${ideaId}/comments/${commentId}/like`, {
        userId: user.id
      });
      
      setIdeas(prevIdeas => prevIdeas.map(idea => {
        if (idea.id === ideaId) {
          return {
            ...idea,
            comments: updateCommentLikes(idea.comments, commentId, response.data.likes)
          };
        }
        return idea;
      }));
    } catch (error) {
      console.error('Error liking comment:', error);
      setErrorMessage('Failed to like comment. Please try again.');
    }
  };
  
  const updateCommentLikes = (comments, commentId, newLikes) => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, likes: newLikes };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentLikes(comment.replies, commentId, newLikes)
        };
      }
      return comment;
    });
  };

  const handleReplyToComment = async (ideaId, commentId, replyText) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/ideas/${ideaId}/comments/${commentId}/replies`, {
        text: replyText,
        userId: user.id,
        username: user.username
      });
      const newReply = response.data;
      setIdeas(prevIdeas => prevIdeas.map(idea => {
        if (idea.id === ideaId) {
          return {
            ...idea,
            comments: idea.comments.map(comment => 
              comment.id === commentId 
                ? { ...comment, replies: [...(comment.replies || []), newReply] }
                : comment
            )
          };
        }
        return idea;
      }));
    } catch (error) {
      console.error('Error replying to comment:', error);
      setErrorMessage('Failed to reply to comment. Please try again.');
    }
  };

  const filteredIdeas = useMemo(() => {
    const filtered = selectedCategory
      ? ideas.filter(idea => idea.category === selectedCategory)
      : ideas;
    return filtered.sort((a, b) => b.votes - a.votes);
  }, [ideas, selectedCategory]);

  if (!user) {
    return isRegistering ? (
      <Register onRegister={handleLogin} onLoginClick={() => setIsRegistering(false)} />
    ) : (
      <Login onLogin={handleLogin} onRegisterClick={() => setIsRegistering(true)} />
    );
  }

  const renderHomePage = () => (
    <>
      <div className="idea-form-container">
        <IdeaForm onSubmit={addIdea} categories={CATEGORIES} />
      </div>
      <div className="filter-bar-container">
        <FilterBar 
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="ideas-feed">
        {filteredIdeas.map(idea => (
          <IdeaItem 
            key={idea.id} 
            idea={idea} 
            onVote={handleVote}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
            onReplyToComment={handleReplyToComment}
            userVotes={userVotes}
            currentUser={user}
          />
        ))}
      </div>
    </>
  );

  const renderAdminPage = () => (
    <AdminPage 
      onDeleteIdea={deleteIdea} 
      onDeleteComment={handleDeleteComment}
      ideas={ideas}
    />
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1 onClick={() => setCurrentPage('home')}>Feature Ideas</h1>
        <div className="nav-buttons">
          <button onClick={() => setCurrentPage('admin')}>Admin</button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      <main className="App-main">
        {currentPage === 'home' ? renderHomePage() : renderAdminPage()}
      </main>
    </div>
  );
}

export default App;