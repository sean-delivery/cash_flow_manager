import React, { useState } from 'react';
import { Share, Mail, MessageSquare, Copy, ExternalLink } from 'lucide-react';
import ShareButton from '../common/ShareButton';

const DashboardShareButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const shareText = "🚀 גיליתי מכונת לידים מדהימה! מערכת CRM ישראלית מתקדמת שמוצאת לקוחות אמיתיים מ-Google Maps 🎯 #CRM #לידים #עסקים";
  const shareUrl = "https://sean-control-cash.com";

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    switch (platform) {
      case 'email':
        window.open(`mailto:?subject=CRM ישראל Pro&body=${encodedText} ${encodedUrl}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText} ${encodedUrl}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`);
        break;
      case 'tiktok':
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('הטקסט והלינק הועתקו ללוח! הדבק ב-TikTok');
        break;
    }
    setShowModal(false);
  };

  return (
    <>
      <ShareButton 
        title="מכונת לידים - מערכת CRM מתקדמת"
        text="חייב לשתף כלי ומכונת לידים ולקוחות חדשה יצאה לשוק"
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center space-x-2 space-x-reverse"
      >
        <Share className="h-4 w-4" />
        <span>שתף</span>
      </ShareButton>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">שתף את המערכת</h3>
              <p className="text-gray-600 mb-6 text-right text-sm">{shareText}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShare('email')}
                  className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <Mail className="h-5 w-5" />
                  <span>מייל</span>
                </button>
                
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>WhatsApp</span>
                </button>
                
                <button
                  onClick={() => handleShare('facebook')}
                  className="bg-blue-800 text-white p-3 rounded-lg hover:bg-blue-900 flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>Facebook</span>
                </button>
                
                <button
                  onClick={() => handleShare('tiktok')}
                  className="bg-black text-white p-3 rounded-lg hover:bg-gray-800 flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <Copy className="h-5 w-5" />
                  <span>TikTok</span>
                </button>
              </div>
              
              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardShareButton;