'use client';

import { useTabContext } from '@/contexts/TabContext';
import { TaskCommentEditor } from '@/components/features/TaskCommentEditor';

interface TabEditorAreaProps {
  children: React.ReactNode;
}

export function TabEditorArea({ children }: TabEditorAreaProps) {
  const { tabs, activeTabId, markTabAsCommented } = useTabContext();

  const activeTab = activeTabId ? tabs.find((t) => t.id === activeTabId) : null;

  if (activeTab) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <TaskCommentEditor
          key={activeTab.taskId}
          taskId={activeTab.taskId}
          taskTitle={activeTab.taskTitle}
          onCommented={() => markTabAsCommented(activeTab.id)}
        />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      {children}
    </main>
  );
}