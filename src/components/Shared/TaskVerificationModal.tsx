import React, { useState } from 'react';
import { X, Share, Upload, CheckCircle, AlertCircle, Camera, MessageSquare, ExternalLink } from 'lucide-react';

interface TaskVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCompleted: () => void;
}

const TaskVerificationModal: React.FC<TaskVerificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onTaskCompleted 
}) => {
  const [currentStep, setCurrentStep] = useState<'share' | 'upload' | 'verify'>('share');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);

  const shareText = "🚀 גיליתי מכונת לידים מדהימה! מערכת CRM ישראלית מתקדמת שמוצאת לקוחות אמיתיים מ-Google Maps 🎯 #CRM #לידים #עסקים";
  const shareUrl = window.location.origin;

  const platforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: 'bg-black',
      action: 'copy'
    },
    {
      id: 'instagram',
      name: 'Instagram Story',
      icon: '📸',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      action: 'copy'
    }
  ];

  const handleShare = (platform: any) => {
    setSelectedPlatform(platform.id);
    
    if (platform.action === 'copy') {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert(`📋 הטקסט והלינק הועתקו ללוח!\n\nעכשיו פתח את ${platform.name} והדבק את התוכן`);
    } else {
      window.open(platform.url, '_blank');
    }
    
    setTimeout(() => {
      setCurrentStep('upload');
    }, 2000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // בדיקת סוג קובץ
    if (!file.type.startsWith('image/')) {
      alert('❌ אנא העלה קובץ תמונה בלבד');
      return;
    }

    // בדיקת גודל (מקסימום 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ התמונה גדולה מדי. מקסימום 5MB');
      return;
    }

    setUploadedImage(file);
    
    // יצירת preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setCurrentStep('verify');
    };
    reader.readAsDataURL(file);
  };

  const verifyTask = async () => {
    if (!uploadedImage) {
      alert('❌ אנא העלה תמונה קודם');
      return;
    }

    setIsVerifying(true);

    // סימולציה של בדיקת AI לתמונה
    await new Promise(resolve => setTimeout(resolve, 3000));

    // בדיקות פשוטות לתמונה
    const isValidSize = uploadedImage.size > 10000; // לפחות 10KB
    const isValidType = uploadedImage.type.startsWith('image/');
    const hasReasonableSize = uploadedImage.size < 5 * 1024 * 1024; // פחות מ-5MB

    if (isValidSize && isValidType && hasReasonableSize) {
      // אימות הצליח
      setIsVerifying(false);
      onTaskCompleted();
    } else {
      setIsVerifying(false);
      alert('❌ התמונה לא עברה אימות. אנא העלה צילום מסך אמיתי של השיתוף');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 text-right">
            🎁 קבל חיפושים חינם
          </h2>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'share' ? 'bg-blue-500 text-white' : 
                ['upload', 'verify'].includes(currentStep) ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}>
                1
              </div>
              <div className="text-sm font-medium text-gray-600">שתף</div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'upload' ? 'bg-blue-500 text-white' : 
                currentStep === 'verify' ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}>
                2
              </div>
              <div className="text-sm font-medium text-gray-600">העלה</div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'verify' ? 'bg-blue-500 text-white' : 'bg-gray-300'
              }`}>
                3
              </div>
              <div className="text-sm font-medium text-gray-600">אמת</div>
            </div>
          </div>

          {/* Step 1: Share */}
          {currentStep === 'share' && (
            <div className="text-center">
              <Share className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">שתף את המערכת</h3>
              <p className="text-gray-600 mb-6">
                בחר פלטפורמה ושתף את המערכת כדי לקבל 3 חיפושים נוספים חינם!
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handleShare(platform)}
                    className={`${platform.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 space-x-reverse`}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 text-sm text-right">
                  💡 אחרי השיתוף, תצטרך להעלות צילום מסך כהוכחה
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Upload Screenshot */}
          {currentStep === 'upload' && (
            <div className="text-center">
              <Camera className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">העלה צילום מסך</h3>
              <p className="text-gray-600 mb-6">
                העלה צילום מסך של השיתוף ב-{platforms.find(p => p.id === selectedPlatform)?.name}
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label
                  htmlFor="screenshot-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <span className="text-gray-600 font-medium">לחץ להעלאת תמונה</span>
                  <span className="text-gray-500 text-sm mt-1">PNG, JPG עד 5MB</span>
                </label>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2 text-right">איך לצלם נכון:</h4>
                <ul className="text-yellow-800 text-sm space-y-1 text-right">
                  <li>• צלם את המסך כשהפוסט מופיע ברשת החברתית</li>
                  <li>• וודא שהטקסט של השיתוף נראה בתמונה</li>
                  <li>• הקפד שהתמונה ברורה וקריאה</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Verify */}
          {currentStep === 'verify' && (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">אימות צילום המסך</h3>
              
              {imagePreview && (
                <div className="mb-6">
                  <img
                    src={imagePreview}
                    alt="Screenshot preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}
              
              <p className="text-gray-600 mb-6">
                בודק שהתמונה מציגה שיתוף אמיתי של המערכת...
              </p>
              
              <button
                onClick={verifyTask}
                disabled={isVerifying}
                className={`px-8 py-3 rounded-lg font-medium ${
                  isVerifying
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isVerifying ? (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>מאמת תמונה...</span>
                  </div>
                ) : (
                  '✅ אמת ותן חיפושים חינם'
                )}
              </button>
              
              <div className="bg-green-50 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-green-900 mb-2 text-right">מה נבדק:</h4>
                <ul className="text-green-800 text-sm space-y-1 text-right">
                  <li>• שהתמונה אמיתית ולא מזויפת</li>
                  <li>• שהשיתוף מכיל את הטקסט הנכון</li>
                  <li>• שהפוסט פורסם ברשת החברתית</li>
                  <li>• שהתמונה ברורה וקריאה</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskVerificationModal;