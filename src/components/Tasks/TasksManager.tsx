import React, { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle, Circle, Star, ArrowRight } from 'lucide-react';
import { mockTasks } from '../../data/mockData';
import { Task } from '../../types';

interface TasksManagerProps {
  onNavigate?: (view: string) => void;
}

const TasksManager: React.FC<TasksManagerProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'גבוהה': return 'text-red-600 bg-red-100';
      case 'בינונית': return 'text-orange-600 bg-orange-100';
      case 'נמוכה': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date() && !tasks.find(t => t.dueDate === dueDate)?.completed;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse">
            <Plus className="h-5 w-5" />
            <span>משימה חדשה</span>
          </button>
          <div className="flex items-center space-x-2 space-x-reverse bg-white rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              הכל ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === 'pending' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              פעיל ({tasks.filter(t => !t.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === 'completed' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              הושלם ({tasks.filter(t => t.completed).length})
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end space-x-4 space-x-reverse mb-2">
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
            >
              <ArrowRight className="h-5 w-5" />
              <span>חזרה לדשבורד</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול משימות</h1>
          <p className="text-gray-600">{filteredTasks.length} משימות</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
              task.completed ? 'opacity-75' : ''
            } ${
              isOverdue(task.dueDate) ? 'border-l-4 border-l-red-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className={`p-1 rounded-full transition-colors ${
                    task.completed
                      ? 'text-green-600 hover:text-green-700'
                      : 'text-gray-400 hover:text-green-600'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle className="h-6 w-6 fill-current" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>
                <div className="text-right">
                  <h3 className={`text-lg font-medium ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                  <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                    {new Date(task.dueDate).toLocaleDateString('he-IL')}
                  </span>
                  <Calendar className="h-4 w-4" />
                </div>
                {isOverdue(task.dueDate) && (
                  <div className="flex items-center space-x-1 space-x-reverse text-red-600">
                    <span className="text-xs font-medium">איחור</span>
                    <Clock className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'completed' ? 'אין משימות שהושלמו' : 'אין משימות פעילות'}
          </h3>
          <p className="text-gray-500">
            {filter === 'completed' ? 'כל הכבוד! השלמת את כל המשימות' : 'צור משימה חדשה כדי להתחיל'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TasksManager;