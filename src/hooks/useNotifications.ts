import { useEffect, useRef } from 'react';
import { Task } from '../types';

export function useNotifications(tasks: Task[]) {
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationPermissionRef = useRef<NotificationPermission>('default');

  // Request notification permission on first use
  useEffect(() => {
    if ('Notification' in window) {
      notificationPermissionRef.current = Notification.permission;
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          notificationPermissionRef.current = permission;
        });
      }
    }
  }, []);

  // Check for due reminders
  useEffect(() => {
    const checkReminders = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }

      const now = new Date();
      const updatedTasks: Task[] = [];
      let hasUpdates = false;

      tasks.forEach(task => {
        if (task.completed || !task.reminders || task.reminders.length === 0) {
          return;
        }

        const updatedReminders = task.reminders.map(reminder => {
          if (!reminder.enabled || reminder.triggered) {
            return reminder;
          }

          let shouldTrigger = false;
          let reminderTime: Date | null = null;

          if (reminder.type === 'absolute' && reminder.absoluteTime) {
            reminderTime = new Date(reminder.absoluteTime);
            shouldTrigger = now >= reminderTime;
          } else if (reminder.type === 'relative' && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const amount = reminder.relativeAmount || 0;
            const unit = reminder.relativeUnit || 'minutes';
            
            reminderTime = new Date(dueDate);
            
            switch (unit) {
              case 'minutes':
                reminderTime.setMinutes(reminderTime.getMinutes() - amount);
                break;
              case 'hours':
                reminderTime.setHours(reminderTime.getHours() - amount);
                break;
              case 'days':
                reminderTime.setDate(reminderTime.getDate() - amount);
                break;
              case 'weeks':
                reminderTime.setDate(reminderTime.getDate() - (amount * 7));
                break;
            }
            
            shouldTrigger = now >= reminderTime;
          }

          if (shouldTrigger && reminderTime) {
            // Show notification
            const notificationTitle = `Reminder: ${task.title}`;
            const notificationBody = reminder.message || 
              (reminder.type === 'relative' 
                ? `Due ${task.dueDate ? `on ${new Date(task.dueDate).toLocaleDateString()}` : 'soon'}`
                : 'Time for your task!');

            const notification = new Notification(notificationTitle, {
              body: notificationBody,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `reminder-${reminder.id}`,
              requireInteraction: false,
              silent: false,
            });

            // Auto-close notification after 10 seconds
            setTimeout(() => {
              notification.close();
            }, 10000);

            // Handle notification click
            notification.onclick = () => {
              window.focus();
              notification.close();
            };

            hasUpdates = true;
            return { ...reminder, triggered: true };
          }

          return reminder;
        });

        if (hasUpdates) {
          updatedTasks.push({ ...task, reminders: updatedReminders });
        }
      });

      // Update tasks with triggered reminders
      if (hasUpdates && updatedTasks.length > 0) {
        // This would need to be connected to the task update function
        // For now, we'll store the updates in localStorage directly
        const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const newTasks = allTasks.map((task: Task) => {
          const updatedTask = updatedTasks.find(ut => ut.id === task.id);
          return updatedTask || task;
        });
        localStorage.setItem('tasks', JSON.stringify(newTasks));
      }
    };

    // Check reminders every minute
    checkIntervalRef.current = setInterval(checkReminders, 60000);
    
    // Check immediately
    checkReminders();

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [tasks]);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    notificationPermissionRef.current = permission;
    return permission === 'granted';
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Test Notification', {
        body: 'Your reminders are working correctly!',
        icon: '/favicon.ico',
      });

      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  };

  return {
    permission: notificationPermissionRef.current,
    requestPermission,
    testNotification,
  };
}