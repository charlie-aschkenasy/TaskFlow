import React, { useState } from 'react';
import { Bell, Plus, X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Reminder } from '../types';

interface ReminderManagerProps {
  reminders: Reminder[];
  onRemindersChange: (reminders: Reminder[]) => void;
  dueDate?: string;
  readOnly?: boolean;
}

export function ReminderManager({ reminders, onRemindersChange, dueDate, readOnly = false }: ReminderManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [reminderType, setReminderType] = useState<'absolute' | 'relative'>('relative');
  const [absoluteTime, setAbsoluteTime] = useState('');
  const [relativeAmount, setRelativeAmount] = useState(30);
  const [relativeUnit, setRelativeUnit] = useState<'minutes' | 'hours' | 'days' | 'weeks'>('minutes');
  const [customMessage, setCustomMessage] = useState('');

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      type: reminderType,
      enabled: true,
      triggered: false,
    };

    if (reminderType === 'absolute') {
      if (!absoluteTime) return;
      newReminder.absoluteTime = absoluteTime;
    } else {
      newReminder.relativeAmount = relativeAmount;
      newReminder.relativeUnit = relativeUnit;
    }

    if (customMessage.trim()) {
      newReminder.message = customMessage.trim();
    }

    onRemindersChange([...reminders, newReminder]);
    
    // Reset form
    setAbsoluteTime('');
    setRelativeAmount(30);
    setRelativeUnit('minutes');
    setCustomMessage('');
    setShowAddForm(false);
  };

  const removeReminder = (id: string) => {
    onRemindersChange(reminders.filter(r => r.id !== id));
  };

  const toggleReminder = (id: string) => {
    onRemindersChange(reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const formatReminderText = (reminder: Reminder): string => {
    if (reminder.type === 'absolute' && reminder.absoluteTime) {
      const date = new Date(reminder.absoluteTime);
      return `At ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (reminder.type === 'relative') {
      const amount = reminder.relativeAmount || 0;
      const unit = reminder.relativeUnit || 'minutes';
      return `${amount} ${unit} before due date`;
    }
    return 'Invalid reminder';
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16);
  };

  if (readOnly && reminders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {reminders.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Bell size={14} />
            Reminders ({reminders.length})
          </div>
          <div className="space-y-2">
            {reminders.map(reminder => (
              <div
                key={reminder.id}
                className={`flex items-center gap-3 p-2 rounded-lg border ${
                  reminder.enabled 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {reminder.type === 'absolute' ? (
                    <Calendar size={16} className={reminder.enabled ? 'text-blue-500' : 'text-gray-400'} />
                  ) : (
                    <Clock size={16} className={reminder.enabled ? 'text-blue-500' : 'text-gray-400'} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {formatReminderText(reminder)}
                  </div>
                  {reminder.message && (
                    <div className="text-xs text-gray-600 mt-1">
                      "{reminder.message}"
                    </div>
                  )}
                  {reminder.triggered && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <AlertCircle size={12} />
                      Triggered
                    </div>
                  )}
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`text-sm px-2 py-1 rounded transition-colors ${
                        reminder.enabled
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                      title={reminder.enabled ? 'Disable reminder' : 'Enable reminder'}
                    >
                      {reminder.enabled ? 'On' : 'Off'}
                    </button>
                    <button
                      onClick={() => removeReminder(reminder.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove reminder"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="space-y-2">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Plus size={14} />
              Add Reminder
            </button>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <form onSubmit={handleAddReminder} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="relative"
                        checked={reminderType === 'relative'}
                        onChange={(e) => setReminderType(e.target.value as 'relative')}
                        className="mr-2"
                      />
                      <span className="text-sm">Before due date</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="absolute"
                        checked={reminderType === 'absolute'}
                        onChange={(e) => setReminderType(e.target.value as 'absolute')}
                        className="mr-2"
                      />
                      <span className="text-sm">Specific time</span>
                    </label>
                  </div>
                </div>

                {reminderType === 'relative' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remind me
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={relativeAmount}
                        onChange={(e) => setRelativeAmount(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <select
                        value={relativeUnit}
                        onChange={(e) => setRelativeUnit(e.target.value as any)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                      </select>
                      <span className="flex items-center text-sm text-gray-600">before due date</span>
                    </div>
                    {!dueDate && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ This task has no due date. Relative reminders won't work.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remind me at
                    </label>
                    <input
                      type="datetime-local"
                      value={absoluteTime}
                      onChange={(e) => setAbsoluteTime(e.target.value)}
                      min={getMinDateTime()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Message (optional)
                  </label>
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Don't forget to bring your laptop!"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                  >
                    Add Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setAbsoluteTime('');
                      setRelativeAmount(30);
                      setRelativeUnit('minutes');
                      setCustomMessage('');
                    }}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}