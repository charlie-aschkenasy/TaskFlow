import React, { useState } from 'react';
import { ArrowLeft, List, Tag, FolderOpen } from 'lucide-react';
import { ListManagement } from '../components/ListManagement';
import { ProjectManagement } from '../components/ProjectManagement';
import { TagManagement } from '../components/TagManagement';

interface SettingsPageProps {
  onBack: () => void;
}

type SettingsTab = 'lists' | 'projects' | 'tags';

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('lists');

  const tabs = [
    { id: 'lists' as SettingsTab, name: 'Lists', icon: List, description: 'Manage your task lists' },
    { id: 'projects' as SettingsTab, name: 'Projects', icon: FolderOpen, description: 'Manage your projects' },
    { id: 'tags' as SettingsTab, name: 'Tags', icon: Tag, description: 'Manage your tags' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'lists':
        return <ListManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'tags':
        return <TagManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to TaskFlow</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Manage
            </h2>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    <div>
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs text-gray-500">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}