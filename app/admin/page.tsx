'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

  const getContentType = (content: string | undefined): 'empty' | 'image' | 'video' | 'url' | 'text' => {
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
    
    try {
      // Try to parse content as JSON array of URLs
      const urls = JSON.parse(content);
      if (Array.isArray(urls)) {
        return (
          <div className={styles.multiPreview}>
            {urls.map((url: string, index: number) => {
              const type = getContentType(url);
              switch (type) {
                case 'image':
                  return <img key={index} src={url} alt={`Preview ${index + 1}`} className={styles.previewImage} />;
                case 'video':
                  if (url.startsWith('/uploads/')) {
                    return (
                      <video key={index} controls className={styles.previewVideo}>
                        <source src={url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    );
                  }
                  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
                  return videoId ? (
                    <iframe
                      key={index}
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : null;
                case 'url':
                  return <a key={index} href={url} target="_blank" rel="noopener noreferrer">{url}</a>;
                default:
                  return null;
              }
            })}
          </div>
        );
      }
    } catch {
      // If not JSON, treat as single content
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

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (editingQuestion) {
        // If editing, append new images to existing ones
        const existingContent = editingQuestion.content ? JSON.parse(editingQuestion.content) : [];
        setEditingQuestion({ 
          ...editingQuestion, 
          content: JSON.stringify([...existingContent, ...data.urls])
        });
      } else {
        // If new question, set the content as array of URLs
        setNewQuestion({ 
          ...newQuestion, 
          content: JSON.stringify(data.urls)
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files. Please try again.');
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleTitleUpdate(e.target.value)}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
            Type: Multiple Media
          </div>
          <div className={styles.uploadSection}>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className={styles.fileInput}
              multiple
            />
            <div className={styles.orDivider}>or</div>
            <textarea
              value={editingQuestion?.content || newQuestion.content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
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
        {gameData?.questions.map((question: Question, index: number) => (
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