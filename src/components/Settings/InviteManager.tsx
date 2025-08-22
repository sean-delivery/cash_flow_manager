import React, { useState, useEffect } from 'react';
import { UserPlus, Copy, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { sb } from '../../lib/supabase';

interface Invite {
  id: string;
  invitee_email: string | null;
  role: 'viewer' | 'editor';
  token: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

const InviteManager: React.FC = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'viewer' as 'viewer' | 'editor'
  });

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      const { data, error } = await sb
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading invites:', error);
        return;
      }
      
      setInvites(data || []);
    } catch (error) {
      console.error('Error loading invites:', error);
    }
  };

  const createInvite = async () => {
    if (!newInvite.role) {
      alert('אנא בחר תפקיד');
      return;
    }

    try {
      const { data: user } = await sb.auth.getUser();
      if (!user.user) {
        alert('יש להתחבר קודם');
        return;
      }

      const { data, error } = await sb
        .from('invites')
        .insert({
          inviter_id: user.user.id,
          invitee_email: newInvite.email || null,
          role: newInvite.role
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invite:', error);
        alert('שגיאה ביצירת הזמנה');
        return;
      }

      const inviteUrl = `${window.location.origin}/invite?token=${data.token}`;
      navigator.clipboard.writeText(inviteUrl);
      alert('לינק הזמנה נוצר והועתק ללוח!');
      
      setShowCreateForm(false);
      setNewInvite({ email: '', role: 'viewer' });
      loadInvites();
    } catch (error) {
      console.error('Error creating invite:', error);
      alert('שגיאה ביצירת הזמנה');
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    alert('לינק הזמנה הועתק ללוח!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
        >
          <UserPlus className="h-4 w-4" />
          <span>הזמנה חדשה</span>
        </button>
        <h3 className="text-lg font-semibold text-gray-900 text-right">ניהול הזמנות</h3>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4 text-right">הזמנה חדשה</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                מייל (אופציונלי)
              </label>
              <input
                type="email"
                value={newInvite.email}
                onChange={(e) => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                תפקיד
              </label>
              <select
                value={newInvite.role}
                onChange={(e) => setNewInvite(prev => ({ ...prev, role: e.target.value as 'viewer' | 'editor' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
              >
                <option value="viewer">צופה - צפייה בלבד</option>
                <option value="editor">עורך - צפייה ועריכה</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                ביטול
              </button>
              <button
                onClick={createInvite}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                צור הזמנה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invites List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  מייל
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  תפקיד
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  תוקף
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {invite.invitee_email || 'כללי'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invite.role === 'editor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invite.role === 'editor' ? 'עורך' : 'צופה'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {invite.used ? (
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-700 text-sm">בשימוש</span>
                      </div>
                    ) : new Date(invite.expires_at) < new Date() ? (
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-700 text-sm">פג תוקף</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-700 text-sm">פעיל</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {new Date(invite.expires_at).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!invite.used && new Date(invite.expires_at) >= new Date() && (
                      <button
                        onClick={() => copyInviteLink(invite.token)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center space-x-1 space-x-reverse"
                      >
                        <Copy className="h-3 w-3" />
                        <span>העתק לינק</span>
                      </button>
                    )}
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

export default InviteManager;