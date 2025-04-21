'use client';

import { useState, useEffect } from 'react';
import styles from './admin.module.css';

interface Question {
  id: number;
  title: string;
  subtitle: string;
  content: string;
}

interface GameData {
  title: string;
  questions: Question[];
}

export default function Admin() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    title: '',
    subtitle: '',
    content: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const response = await fetch('/api/questions');
    const data = await response.json();
    setGameData(data);
  };

  const handleTitleUpdate = async (newTitle: string) => {
    try {
      const response = await fetch('/api/title', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update title');
      }
      
      const data = await response.json();
      if (gameData) {
        setGameData({ ...gameData, title: data.title });
      }
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingQuestion)
      });
    } else {
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
    }
    setEditingQuestion(null);
    setNewQuestion({ title: '', subtitle: '', content: '' });
    fetchQuestions();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/questions?id=${id}`, {
      method: 'DELETE'
    });
    fetchQuestions();
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
  };

  const getContentType = (content: string | undefined) => {
    if (!content) return 'empty';
    if (content.startsWith('/uploads/')) {
      const extension = content.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
      if (['mp4', 'webm'].includes(extension || '')) return 'video';
      return 'url';
    }
    if (/^https?:\/\//i.test(content)) {
      if (/(youtube\.com|youtu\.be)/i.test(content)) return 'video';
      if (/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(content)) return 'image';
      return 'url';
    }
    return 'text';
  };

  const renderContentPreview = (content: string | undefined) => {
    if (!content) return null;
    const type = getContentType(content);
    switch (type) {
      case 'image':
        return <img src={content} alt="Preview" className={styles.previewImage} />;
      case 'video':
        if (content.startsWith('/uploads/')) {
          return (
            <video controls className={styles.previewVideo}>
              <source src={content} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          );
        }
        const videoId = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
        return videoId ? (
          <iframe
            width="100%"
            height="200"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : null;
      case 'url':
        return <a href={content} target="_blank" rel="noopener noreferrer">{content}</a>;
      case 'text':
        return <div className={styles.textPreview}>{content}</div>;
      default:
        return null;
    }
  };

  const handleReorder = async (questionId: number, direction: 'up' | 'down') => {
    try {
      const response = await fetch('/api/questions/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, direction })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reorder questions');
      }
      
      // Fetch the updated questions to get the new order and IDs
      const updatedResponse = await fetch('/api/questions');
      const updatedData = await updatedResponse.json();
      setGameData(updatedData);
    } catch (error) {
      console.error('Error reordering questions:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (editingQuestion) {
        setEditingQuestion({ ...editingQuestion, content: data.url });
      } else {
        setNewQuestion({ ...newQuestion, content: data.url });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.adminHeader}>
        Admin Panel - <a href="/" className={styles.backLink}>Back to Site</a>
      </h1>
      
      <div className={styles.form}>
        <h2>Site Title</h2>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={gameData?.title || ''}
            onChange={(e) => handleTitleUpdate(e.target.value)}
            className={styles.titleInput}
            placeholder="Enter site title"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
        <div className={styles.formGroup}>
          <label>Title:</label>
          <input
            type="text"
            value={editingQuestion?.title || newQuestion.title}
            onChange={(e) => {
              if (editingQuestion) {
                setEditingQuestion({ ...editingQuestion, title: e.target.value });
              } else {
                setNewQuestion({ ...newQuestion, title: e.target.value });
              }
            }}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Subtitle:</label>
          <input
            type="text"
            value={editingQuestion?.subtitle || newQuestion.subtitle}
            onChange={(e) => {
              if (editingQuestion) {
                setEditingQuestion({ ...editingQuestion, subtitle: e.target.value });
              } else {
                setNewQuestion({ ...newQuestion, subtitle: e.target.value });
              }
            }}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Content:</label>
          <div className={styles.contentTypeIndicator}>
            Type: {getContentType(editingQuestion?.content || newQuestion.content)}
          </div>
          <div className={styles.uploadSection}>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className={styles.fileInput}
            />
            <div className={styles.orDivider}>or</div>
            <textarea
              value={editingQuestion?.content || newQuestion.content}
              onChange={(e) => {
                if (editingQuestion) {
                  setEditingQuestion({ ...editingQuestion, content: e.target.value });
                } else {
                  setNewQuestion({ ...newQuestion, content: e.target.value });
                }
              }}
              className={styles.contentInput}
              placeholder="Enter text content or paste a URL for images/videos"
              rows={5}
            />
          </div>
          <div className={styles.previewSection}>
            <h3 className={styles.previewTitle}>Content Preview</h3>
            <div className={styles.previewContainer}>
              {renderContentPreview(editingQuestion?.content || newQuestion.content)}
            </div>
          </div>
        </div>
        <button type="submit" className={styles.submitButton}>{editingQuestion ? 'Update' : 'Add'}</button>
        {editingQuestion && (
          <button type="button" className={styles.submitButton} onClick={() => setEditingQuestion(null)}>Cancel</button>
        )}
      </form>

      <div className={styles.questionsList}>
        <h2>Existing Questions</h2>
        {gameData?.questions.map((question, index) => (
          <div key={question.id} className={styles.questionCard}>
            <h3>{question.title}</h3>
            <p>{question.subtitle}</p>
            <div className={styles.contentPreview}>
              {renderContentPreview(question.content)}
            </div>
            <div className={styles.actions}>
              <button 
                onClick={() => handleReorder(question.id, 'up')}
                disabled={index === 0}
                className={styles.reorderButton}
                title="Move up"
              >
                ↑
              </button>
              <button 
                onClick={() => handleReorder(question.id, 'down')}
                disabled={index === gameData.questions.length - 1}
                className={styles.reorderButton}
                title="Move down"
              >
                ↓
              </button>
              <button onClick={() => handleEdit(question)} className={styles.editButton}>Edit</button>
              <button onClick={() => handleDelete(question.id)} className={styles.deleteButton}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 