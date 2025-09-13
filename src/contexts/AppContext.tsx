import React, { createContext, useContext, useState } from 'react';

interface Child {
  id: string;
  name: string;
  age: number;
  grade: string;
  exam: string;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Progress {
  childId: string;
  topic: string;
  completed: number;
  total: number;
  lastActivity: Date;
}

interface AppContextType {
  currentUser: Parent | null;
  children: Child[];
  currentChild: Child | null;
  progress: Progress[];
  currentView: 'auth' | 'dashboard' | 'tutor' | 'curriculum';
  login: (parent: Parent) => void;
  logout: () => void;
  addChild: (child: Omit<Child, 'id'>) => void;
  selectChild: (child: Child) => void;
  setView: (view: 'auth' | 'dashboard' | 'tutor' | 'curriculum') => void;
  updateProgress: (childId: string, topic: string, completed: number, total: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Parent | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [currentView, setCurrentView] = useState<'auth' | 'dashboard' | 'tutor' | 'curriculum'>('auth');

  const login = (parent: Parent) => {
    setCurrentUser(parent);
    setCurrentView('dashboard');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentChild(null);
    setCurrentView('auth');
  };

  const addChild = (child: Omit<Child, 'id'>) => {
    const newChild = { ...child, id: Date.now().toString() };
    setChildrenList(prev => [...prev, newChild]);
  };

  const selectChild = (child: Child) => {
    setCurrentChild(child);
  };

  const setView = (view: 'auth' | 'dashboard' | 'tutor' | 'curriculum') => {
    setCurrentView(view);
  };

  const updateProgress = (childId: string, topic: string, completed: number, total: number) => {
    setProgress(prev => {
      const existing = prev.find(p => p.childId === childId && p.topic === topic);
      if (existing) {
        return prev.map(p => 
          p.childId === childId && p.topic === topic 
            ? { ...p, completed, total, lastActivity: new Date() }
            : p
        );
      }
      return [...prev, { childId, topic, completed, total, lastActivity: new Date() }];
    });
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      children: childrenList,
      currentChild,
      progress,
      currentView,
      login,
      logout,
      addChild,
      selectChild,
      setView,
      updateProgress
    }}>
      {children}
    </AppContext.Provider>
  );
};