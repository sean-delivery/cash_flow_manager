import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, User, CreditCard, Tag, FileText, Repeat } from 'lucide-react';
import { CashFlowEntry } from '../../types/cashflow';

interface CashFlowFormProps {
  entry?: CashFlowEntry | null;
  onSubmit: (entry: Omit<CashFlowEntry, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const CashFlowForm: React.FC<CashFlowFormProps> = ({ entry, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    description: '',
    client: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as CashFlowEntry['paymentMethod'],
    category: '',
    notes: '',
    isRecurring: false,
    recurringMonths: 1
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (entry) {
      setFormData({
        type: entry.type,
        amount: entry.amount.toString(),
        description: entry.description,
        client: entry.client || '',
        date: entry.date.toISOString().split('T')[0],
        paymentMethod: entry.paymentMethod,
        category: entry.category,
        notes: entry.notes || '',
        isRecurring: entry.isRecurring || false,
        recurringMonths: entry.recurringMonths || 1
      });
    }
  }, [entry]);

  const paymentMethods = [
    { value: 'cash', label: 'מזומן', icon: '💵' },
    { value: 'bit', label: 'ביט', icon: '📱' },
    { value: 'paybox', label: 'פייבוקס', icon: '📱' },
    { value: 'credit', label: 'אשראי', icon: '💳' },
    { value: 'paypal', label: 'פייפאל', icon: '🌐' },
    { value: 'bank_transfer', label: 'העברה בנקאית', icon: '🏦' },
    { value: 'check', label: 'צ\'ק', icon: '📄' }
  ];

  const incomeCategories = [
    'מכירות', 'שירותים', 'יעוץ', 'השכרה', 'השקעות', 'מענקים', 'אחר'
  ];

  const expenseCategories = [
    'שכירות', 'שכר עובדים', 'חשמל', 'מים', 'טלפון', 'אינטרנט', 'ביטוח',
    'חומרי גלם', 'שיווק', 'נסיעות', 'משרד', 'מחשבים', 'תחזוקה', 'מיסים', 'אחר'
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'סכום חייב להיות גדול מ-0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'תיאור הוא שדה חובה';
    }

    if (!formData.category) {
      newErrors.category = 'קטגוריה היא שדה חובה';
    }

    if (formData.isRecurring && formData.recurringMonths < 1) {
      newErrors.recurringMonths = 'מספר חודשים חייב להיות לפחות 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      client: formData.client.trim() || undefined,
      date: new Date(formData.date),
      paymentMethod: formData.paymentMethod,
      category: formData.category,
      notes: formData.notes.trim() || undefined,
      isRecurring: formData.isRecurring,
      recurringMonths: formData.isRecurring ? formData.recurringMonths : undefined
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 text-right">
            {entry ? 'עריכת רשומה' : 'רשומה חדשה'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-right">
              סוג רשומה
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'income')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <span className="text-2xl">💰</span>
                  <span className="font-medium">הכנסה</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('type', 'expense')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <span className="text-2xl">💸</span>
                  <span className="font-medium">הוצאה</span>
                </div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              סכום *
            </label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-right ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1 text-right">{errors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              תיאור *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-right ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="תיאור הרשומה"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1 text-right">{errors.description}</p>
            )}
          </div>

          {/* Client (for income) */}
          {formData.type === 'income' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                לקוח
              </label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="שם הלקוח"
                />
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              תאריך
            </label>
            <div className="relative">
              <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              אמצעי תשלום
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => handleInputChange('paymentMethod', method.value)}
                  className={`p-3 rounded-lg border transition-colors ${
                    formData.paymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{method.icon}</div>
                    <div className="text-xs font-medium">{method.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              קטגוריה *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-right ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">בחר קטגוריה</option>
              {(formData.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1 text-right">{errors.category}</p>
            )}
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center justify-end space-x-2 space-x-reverse">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">רשומה חוזרת</span>
              <Repeat className="h-4 w-4 text-gray-400" />
            </label>
            
            {formData.isRecurring && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  מספר חודשים
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.recurringMonths}
                  onChange={(e) => handleInputChange('recurringMonths', parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-right ${
                    errors.recurringMonths ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.recurringMonths && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.recurringMonths}</p>
                )}
                <p className="text-xs text-gray-500 mt-1 text-right">
                  יווצרו {formData.recurringMonths} רשומות, אחת לכל חודש
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              הערות
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              placeholder="הערות נוספות..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {entry ? 'עדכן' : 'הוסף'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashFlowForm;