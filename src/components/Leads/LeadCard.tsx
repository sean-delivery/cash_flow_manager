import React from 'react';
import { Star, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import { Lead } from '../../types';
import StarButton from '../common/StarButton';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, onDelete, onToggleStar }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'חדש': return 'bg-blue-100 text-blue-800';
      case 'בטיפול': return 'bg-yellow-100 text-yellow-800';
      case 'הצעה': return 'bg-purple-100 text-purple-800';
      case 'נסגר': return 'bg-green-100 text-green-800';
      case 'לא רלוונטי': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityStars = (priority: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < priority ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <StarButton leadId={lead.id} />
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
            {lead.status}
          </span>
        </div>
        <div className="flex items-center space-x-1 space-x-reverse">
          <button
            onClick={() => onEdit(lead)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(lead.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="text-right mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
        {lead.company && (
          <p className="text-sm text-gray-600">{lead.company}</p>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-end space-x-2 space-x-reverse">
          <span className="text-sm text-gray-600">{lead.phone}</span>
          <Phone className="h-4 w-4 text-gray-400" />
        </div>
        {lead.email && (
          <div className="flex items-center justify-end space-x-2 space-x-reverse">
            <span className="text-sm text-gray-600">{lead.email}</span>
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <div className="flex items-center justify-end space-x-2 space-x-reverse">
          <span className="text-sm text-gray-600">{lead.city} • {lead.category}</span>
          <MapPin className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 space-x-reverse">
          {getPriorityStars(lead.priority)}
        </div>
        <div className="text-left">
          {lead.value && (
            <p className="text-sm font-medium text-gray-900">₪{lead.value.toLocaleString()}</p>
          )}
          <p className="text-xs text-gray-500">
            {new Date(lead.createdAt).toLocaleDateString('he-IL')}
          </p>
        </div>
      </div>

      {lead.notes && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-right">{lead.notes}</p>
        </div>
      )}
    </div>
  );
};

export default LeadCard;