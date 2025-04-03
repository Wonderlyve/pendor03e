import React, { useState } from 'react';
import { Star, MessageCircle, Share2, ThumbsUp, Calendar, Clock, Trophy, MoreVertical, Bookmark, Award, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CommentModal from './CommentModal';
import AuthPopup from './AuthPopup';

interface PostProps {
  post: {
    id: string;
    content: string;
    image_url: string | null;
    odds: number;
    confidence: number;
    created_at: string;
    likes: number;
    comments: number;
    shares: number;
    user: {
      username: string;
      avatar_url: string;
    };
    isLiked?: boolean;
  };
  onOpenBetModal: (prediction: any) => void;
}

const MAX_CHARS = 200;

export default function Post({ post, onOpenBetModal }: PostProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [showMenu, setShowMenu] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const { user } = useAuth();

  // Extract analysis text only (remove match lines)
  const getAnalysisText = (content: string) => {
    const lines = content.split('\n');
    const analysisLines = lines.filter(line => !line.match(/(.+) vs (.+) - (.+): (.+)/));
    return analysisLines.join('\n').trim();
  };

  const analysisText = getAnalysisText(post.content);
  const shouldTruncate = analysisText.length > MAX_CHARS;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDate(post.created_at);

  const handleLike = async () => {
    if (!user) {
      setShowAuthPopup(true);
      return;
    }

    try {
      if (localPost.isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', localPost.id)
          .eq('user_id', user.id);

        setLocalPost(prev => ({
          ...prev,
          likes: prev.likes - 1,
          isLiked: false
        }));
      } else {
        await supabase
          .from('post_likes')
          .insert([
            {
              post_id: localPost.id,
              user_id: user.id
            }
          ]);

        setLocalPost(prev => ({
          ...prev,
          likes: prev.likes + 1,
          isLiked: true
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleMenuAction = (action: string) => {
    if (!user) {
      setShowAuthPopup(true);
      return;
    }

    switch (action) {
      case 'save':
        console.log('Enregistrer le pronostic');
        break;
      case 'rate':
        console.log('Évaluer le pronostic');
        break;
      case 'recommend':
        console.log('Recommander');
        break;
      case 'markWin':
        console.log('Marquer comme gagné');
        break;
      case 'markLoss':
        console.log('Marquer comme perdu');
        break;
      case 'follow':
        console.log('Suivre le pronostiqueur');
        break;
    }
    setShowMenu(false);
  };

  React.useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMenu]);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={post.user.avatar_url}
            alt={post.user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{post.user.username}</h3>
            </div>
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
          </div>
        </div>

        {/* Menu Button */}
        <button
          onClick={() => setShowMenu(true)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <MoreVertical className="h-5 w-5 text-gray-500" />
        </button>

        {/* Menu Bottom Sheet */}
        {showMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMenu(false)}>
            <div 
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl h-[70vh] transform transition-transform duration-300 ease-out"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />
              
              <div className="px-4 py-2">
                <h3 className="text-lg font-semibold mb-4">Options</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleMenuAction('save')}
                    className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <Bookmark className="h-5 w-5 text-gray-600" />
                    <span>Enregistrer le pronostic</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction('rate')}
                    className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <Star className="h-5 w-5 text-gray-600" />
                    <span>Évaluer le pronostic</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction('recommend')}
                    className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <Award className="h-5 w-5 text-gray-600" />
                    <span>Recommander</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction('markWin')}
                    className="w-full p-3 text-left hover:bg-green-50 rounded-lg flex items-center space-x-3 transition-colors text-green-700"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Marquer comme gagné</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction('markLoss')}
                    className="w-full p-3 text-left hover:bg-red-50 rounded-lg flex items-center space-x-3 transition-colors text-red-700"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Marquer comme perdu</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction('follow')}
                    className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <UserPlus className="h-5 w-5 text-gray-600" />
                    <span>Suivre le pronostiqueur</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 mb-2 text-sm whitespace-pre-line">
          {expanded ? analysisText : `${analysisText.slice(0, MAX_CHARS)}${shouldTruncate ? '...' : ''}`}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {expanded ? 'Voir moins' : 'Lire la suite'}
          </button>
        )}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3 mt-2">
          <span>Côte totale:</span>
          <span className="px-2 py-1 bg-gray-100 rounded">{localPost.odds}</span>
        </div>
      </div>

      {/* Post Image */}
      {localPost.image_url && (
        <div className="aspect-video relative">
          <img 
            src={localPost.image_url} 
            alt="Post"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Prediction Info */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-accent" />
            <span className="font-medium">Confiance</span>
          </div>
          <span className="text-green-600 font-medium">{localPost.confidence}%</span>
        </div>

        {/* Social Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              localPost.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          >
            <ThumbsUp className={`h-5 w-5 ${localPost.isLiked ? 'fill-current' : ''}`} />
            <span>{localPost.likes}</span>
          </button>
          <button 
            onClick={() => setShowComments(true)}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{localPost.comments}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
            <Share2 className="h-5 w-5" />
            <span>{localPost.shares}</span>
          </button>
          <button 
            onClick={() => onOpenBetModal(localPost)}
            className="bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700 transition-colors"
          >
            Voir les paris
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      <CommentModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={localPost.id}
      />

      {/* Auth Popup */}
      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        message="Veuillez vous connecter pour effectuer cette action"
      />
    </div>
  );
}