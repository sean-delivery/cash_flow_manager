import React, { useState } from 'react';
import { FileText, Upload, Download, Search, Filter, Eye, Edit, Trash2, Plus, Folder, File } from 'lucide-react';

const DocumentsManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const documents = [
    {
      id: '1',
      name: 'הצעת מחיר - כהן טכנולוגיות.pdf',
      category: 'הצעות מחיר',
      size: '2.4 MB',
      type: 'PDF',
      createdAt: new Date('2024-01-20'),
      modifiedAt: new Date('2024-01-22'),
      client: 'דוד כהן',
      status: 'פעיל'
    },
    {
      id: '2',
      name: 'חוזה שירות - לוי ושותפים.docx',
      category: 'חוזים',
      size: '1.8 MB',
      type: 'Word',
      createdAt: new Date('2024-01-18'),
      modifiedAt: new Date('2024-01-21'),
      client: 'שרה לוי',
      status: 'חתום'
    },
    {
      id: '3',
      name: 'חשבונית 2024-001.pdf',
      category: 'חשבוניות',
      size: '856 KB',
      type: 'PDF',
      createdAt: new Date('2024-01-15'),
      modifiedAt: new Date('2024-01-15'),
      client: 'אחמד עלי',
      status: 'שולם'
    },
    {
      id: '4',
      name: 'מצגת מוצר - גרסה 2.pptx',
      category: 'מצגות',
      size: '15.2 MB',
      type: 'PowerPoint',
      createdAt: new Date('2024-01-10'),
      modifiedAt: new Date('2024-01-19'),
      client: 'כללי',
      status: 'עדכני'
    },
    {
      id: '5',
      name: 'דוח מכירות Q1 2024.xlsx',
      category: 'דוחות',
      size: '3.1 MB',
      type: 'Excel',
      createdAt: new Date('2024-01-05'),
      modifiedAt: new Date('2024-01-20'),
      client: 'פנימי',
      status: 'סופי'
    }
  ];

  const categories = ['הצעות מחיר', 'חוזים', 'חשבוניות', 'מצגות', 'דוחות', 'מסמכים משפטיים', 'תמונות'];

  const filteredDocuments = documents.filter(doc => {
    return (
      (searchTerm === '' || 
       doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       doc.client.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (selectedCategory === '' || doc.category === selectedCategory)
    );
  });

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return '📄';
      case 'word': return '📝';
      case 'excel': return '📊';
      case 'powerpoint': return '📈';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'פעיל': return 'bg-blue-100 text-blue-800';
      case 'חתום': return 'bg-green-100 text-green-800';
      case 'שולם': return 'bg-green-100 text-green-800';
      case 'עדכני': return 'bg-purple-100 text-purple-800';
      case 'סופי': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse">
            <Upload className="h-5 w-5" />
            <span>העלה מסמך</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 space-x-reverse">
            <Plus className="h-5 w-5" />
            <span>צור מסמך</span>
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">ניהול מסמכים</h1>
          <p className="text-gray-600">{filteredDocuments.length} מסמכים</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">סה״כ מסמכים</p>
              <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">הועלו השבוע</p>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">נפח כולל</p>
              <p className="text-2xl font-bold text-purple-600">156MB</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Folder className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">ממתינים לאישור</p>
              <p className="text-2xl font-bold text-orange-600">3</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש מסמכים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
          >
            <option value="">כל הקטגוריות</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <FileText className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Folder className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מסמך
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  קטגוריה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  לקוח
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  גודל
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך עדכון
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className="text-2xl">{getFileIcon(doc.type)}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-500">{doc.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{doc.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{doc.size}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {doc.modifiedAt.toLocaleDateString('he-IL')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button className="p-1 text-blue-600 hover:text-blue-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:text-green-700">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-700">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsManager;