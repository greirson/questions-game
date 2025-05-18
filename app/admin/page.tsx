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

// Helper function to adjust URL for local uploads
const getMediaUrl = (originalUrl: string): string => {
  if (originalUrl && originalUrl.startsWith('/uploads/')) {
    // Remove '/uploads/' and prepend '/api/media/'
    return `/api/media${originalUrl.substring('/uploads'.length)}`;
  }
  return originalUrl; // Return original if not a local upload path
};

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
    if (content.startsWith('/uploads/')) { // This check is still useful for logic, but URL will be transformed
      const extension = content.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
      if (['mp4', 'webm'].includes(extension || '')) return 'video';
      return 'url'; // Or perhaps 'media_file' if you want to distinguish
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
              const type = getContentType(url); // Original URL for type detection
              const displayUrl = getMediaUrl(url); // Transformed URL for display

              switch (type) {
                case 'image':
                  return <img key={index} src={displayUrl} alt={`Preview ${index + 1}`} className={styles.previewImage} />;
                case 'video':
                  if (url.startsWith('/uploads/')) { // Check original URL for source type
                    const videoType = url.endsWith('.webm') ? 'video/webm' : 'video/mp4';
                    return (
                      <video key={index} controls className={styles.previewVideo}>
                        <source src={displayUrl} type={videoType} />
                        Your browser does not support the video tag.
                      </video>
                    );
                  }
                  // YouTube or other external video
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
                  return <a key={index} href={url} target="_blank" rel="noopener noreferrer">{url}</a>; // Original URL for external links
                default:
                  return null;
              }
            })}
          </div>
        );
      }
    } catch {
      // If not JSON, treat as single content
      const type = getContentType(content); // Original content for type detection
      const displayContent = getMediaUrl(content); // Transformed content for display

      switch (type) {
        case 'image':
          return <img src={displayContent} alt="Preview" className={styles.previewImage} />;
        case 'video':
          if (content.startsWith('/uploads/')) { // Check original content for source type
            const videoType = content.endsWith('.webm') ? 'video/webm' : 'video/mp4';
            return (
              <video controls className={styles.previewVideo}>
                <source src={displayContent} type={videoType} />
                Your browser does not support the video tag.
              </video>
            );
          }
          // YouTube or other external video
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
          return <a href={content} target="_blank" rel="noopener noreferrer">{content}</a>; // Original content for external links
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json(); // data.urls will be like ["/uploads/file1.jpg", "/uploads/file2.png"]
      
      if (editingQuestion) {
        let existingContentArray: string[] = [];
        try {
          if(editingQuestion.content) {
            existingContentArray = JSON.parse(editingQuestion.content);
            if (!Array.isArray(existingContentArray)) existingContentArray = [editingQuestion.content]; // Handle case where it was a single non-JSON string
          }
        } catch {
           if(editingQuestion.content) existingContentArray = [editingQuestion.content]; // If parsing fails, assume it was a single string
        }
        setEditingQuestion({ 
          ...editingQuestion, 
          content: JSON.stringify([...existingContentArray, ...data.urls])
        });
      } else {
        let currentNewQuestionContent: string[] = [];
         try {
          if(newQuestion.content) {
            currentNewQuestionContent = JSON.parse(newQuestion.content as string);
             if (!Array.isArray(currentNewQuestionContent)) currentNewQuestionContent = [newQuestion.content as string];
          }
        } catch {
          if(newQuestion.content) currentNewQuestionContent = [newQuestion.content as string];
        }
        setNewQuestion({ 
          ...newQuestion, 
          content: JSON.stringify([...currentNewQuestionContent, ...data.urls])
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload files. ${error instanceof Error ? error.message : 'Please try again.'}`);
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if(gameData) { // Ensure gameData is not null
                setGameData({...gameData, title: e.target.value });
              }
            }}
            onBlur={(e: ChangeEvent<HTMLInputElement>) => handleTitleUpdate(e.target.value)} // Update on blur
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
            value={editingQuestion?.title || newQuestion.title || ''}
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
            value={editingQuestion?.subtitle || newQuestion.subtitle || ''}
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
            Type: Multiple Media (URLs or Uploads). Store as JSON array: e.g., ["/uploads/file.jpg", "https://youtube.com/..."]
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
              value={editingQuestion?.content || newQuestion.content || ''}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                if (editingQuestion) {
                  setEditingQuestion({ ...editingQuestion, content: e.target.value });
                } else {
                  setNewQuestion({ ...newQuestion, content: e.target.value });
                }
              }}
              className={styles.contentInput}
              placeholder='Enter JSON array of URLs, e.g., ["/uploads/image.png", "https://example.com/video.mp4"]'
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
          <button type="button" className={styles.submitButton} onClick={() => {
            setEditingQuestion(null);
            setNewQuestion({ title: '', subtitle: '', content: '' }); // Clear new question form too
          }}>Cancel Edit</button>
        )}
      </form>

      <div className={styles.questionsList}>
        <h2>Existing Questions</h2>
        {gameData?.questions.map((question: Question, index: number) => (
          <div key={question.id} className={styles.questionCard}>
            <h3>{question.id}. {question.title}</h3>
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