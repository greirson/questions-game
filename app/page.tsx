'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';

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

export default function Home() {
  const [gameData, setGameData] = useState<GameData | null>(null);

  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => setGameData(data));
  }, []);

  const renderContent = (content: string) => {
    try {
      // Try to parse content as JSON array of URLs
      const urls = JSON.parse(content);
      if (Array.isArray(urls)) {
        return (
          <div className={styles.multiContent}>
            {urls.map((url: string, index: number) => {
              // Check if content is an image URL
              if (/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url)) {
                return <img key={index} src={url} alt={`Question content ${index + 1}`} className={styles.contentImage} />;
              }
              
              // Check if content is a YouTube URL
              const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
              if (youtubeMatch) {
                return (
                  <iframe
                    key={index}
                    width="100%"
                    height="315"
                    src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                );
              }

              // Check if content is a URL
              if (/^https?:\/\//i.test(url)) {
                return <a key={index} href={url} target="_blank" rel="noopener noreferrer">{url}</a>;
              }

              // Default to text
              return <p key={index} className={styles.questionText}>{url}</p>;
            })}
          </div>
        );
      }
    } catch {
      // If not JSON, treat as single content
      // Check if content is an image URL
      if (/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(content)) {
        return <img src={content} alt="Question content" className={styles.contentImage} />;
      }
      
      // Check if content is a YouTube URL
      const youtubeMatch = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      if (youtubeMatch) {
        return (
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }

      // Check if content is a URL
      if (/^https?:\/\//i.test(content)) {
        return <a href={content} target="_blank" rel="noopener noreferrer">{content}</a>;
      }

      // Default to text
      return <p className={styles.questionText}>{content}</p>;
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.headerContainer}>
        <img src="/header.png" alt="Header" className={styles.headerImage} />
      </div>
      
      {gameData && (
        <React.Fragment>
          <h1 className={styles.title}>{gameData.title}</h1>
          <div className={styles.questionsContainer}>
            {gameData.questions.map((question: Question, index: number) => (
              <div key={question.id} className={styles.questionCard}>
                <h2 className={styles.questionTitle}>{index + 1}. {question.title}</h2>
                <h3 className={styles.questionSubtitle}>{question.subtitle}</h3>
                <div className={styles.questionContent}>
                  {renderContent(question.content)}
                </div>
              </div>
            ))}
          </div>
        </React.Fragment>
      )}
    </main>
  );
} 