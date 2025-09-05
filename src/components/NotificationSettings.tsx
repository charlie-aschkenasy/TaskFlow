import React from 'react';
import { Bell, BellOff, TestTube } from 'lucide-react';

interface NotificationSettingsProps {
  permission: NotificationPermission;
  onRequestPermission: () => Promise<boolean>;
  onTestNotification: () => void;
}

export function NotificationSettings({ 
  permission, 
  onRequestPermission, 
  onTestNotification 
}: NotificationSettingsProps) {
  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Enabled', color: 'text-green-600', icon: Bell };
      case 'denied':
        return { text: 'Blocked', color: 'text-red-600', icon: BellOff };
      default:
        return { text: 'Not Set', color: 'text-yellow-600', icon: BellOff };
    }
  };

  const status = getPermissionStatus();
  const StatusIcon = status.icon;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon size={18} className={status.color} />
          <h3 className="font-medium text-gray-900">Notifications</h3>
        </div>
        <span className={`text-sm font-medium ${status.color}`}>
          {status.text}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        Get browser notifications for your task reminders to never miss important deadlines.
      </p>

      <div className="flex gap-2">
        {permission !== 'granted' && (
          <button
            onClick={onRequestPermission}
            className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Enable Notifications
          </button>
        )}
        
        {permission === 'granted' && (
          <button
            onClick={onTestNotification}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
          >
            <TestTube size={14} />
            Test Notification
          </button>
        )}
      </div>

      {permission === 'denied' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-700">
            Notifications are blocked. To enable them, click the notification icon in your browser's address bar and allow notifications for this site.
          </p>
        </div>
      )}
    </div>
  );
}