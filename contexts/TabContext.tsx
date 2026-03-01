'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { Tab } from '@/types';

interface TabContextType {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (taskId: string, taskTitle: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  markTabAsCommented: (id: string) => void;
}

const TabContext = createContext<TabContextType | null>(null);

export function TabProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = useCallback((taskId: string, taskTitle: string) => {
    setTabs((prev) => {
      const existing = prev.find((t) => t.taskId === taskId);
      if (existing) {
        setActiveTabId(existing.id);
        return prev;
      }
      const newTab: Tab = {
        id: `tab-${taskId}`,
        taskId,
        taskTitle,
        type: 'redaction',
        isCommented: false,
      };
      setActiveTabId(newTab.id);
      return [...prev, newTab];
    });
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== id);
      setActiveTabId((current) => {
        if (current !== id) return current;
        if (newTabs.length === 0) return null;
        const closedIndex = prev.findIndex((t) => t.id === id);
        const nextIndex = Math.min(closedIndex, newTabs.length - 1);
        return newTabs[nextIndex].id;
      });
      return newTabs;
    });
  }, []);

  const setActiveTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const markTabAsCommented = useCallback((id: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCommented: true } : t))
    );
  }, []);

  return (
    <TabContext.Provider value={{ tabs, activeTabId, openTab, closeTab, setActiveTab, markTabAsCommented }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabContext() {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error('useTabContext must be used within TabProvider');
  return ctx;
}