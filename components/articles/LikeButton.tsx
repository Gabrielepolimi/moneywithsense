'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  articleId: string;
  initialLikes: number;
}

export default function LikeButton({ articleId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has already liked and calculate the correct counter
  useEffect(() => {
    const likedArticles = JSON.parse(localStorage.getItem('moneywithsense_liked_articles') || '[]');
    const userHasLiked = likedArticles.includes(articleId);
    setIsLiked(userHasLiked);
    
    // Calculate correct counter: initial likes + user like
    const userLikes = userHasLiked ? 1 : 0;
    setLikes(initialLikes + userLikes);
  }, [articleId, initialLikes]);

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const likedArticles = JSON.parse(localStorage.getItem('moneywithsense_liked_articles') || '[]');
      
      if (isLiked) {
        // Remove like
        const newLikedArticles = likedArticles.filter((id: string) => id !== articleId);
        localStorage.setItem('moneywithsense_liked_articles', JSON.stringify(newLikedArticles));
        setLikes(initialLikes); // Return to initial likes
        setIsLiked(false);
      } else {
        // Add like
        const newLikedArticles = [...likedArticles, articleId];
        localStorage.setItem('moneywithsense_liked_articles', JSON.stringify(newLikedArticles));
        setLikes(initialLikes + 1); // Initial likes + 1
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-600 font-medium">
        Readers who found this helpful:
      </span>
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
          isLiked 
            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label={isLiked ? 'Remove like' : 'Like this article'}
      >
        <Heart 
          className={`w-5 h-5 transition-all duration-200 ${
            isLiked ? 'fill-red-600 text-red-600' : 'text-gray-600'
          }`} 
        />
        <span className="font-medium">
          {Math.max(0, likes)}
        </span>
      </button>
    </div>
  );
}
