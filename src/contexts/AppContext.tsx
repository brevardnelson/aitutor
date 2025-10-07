import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { childrenAPI, Child as APIChild, ProgressData } from '@/lib/api-children';

interface Child {
  id: number;
  name: string;
  age: number;
  gradeLevel: string;
  targetExam?: string;
  subjects: string[];
}

interface AppContextType {
  children: Child[];
  currentChild: Child | null;
  childrenProgress: Map<number, ProgressData[]>;
  selectedSubject: string | null;
  isLoadingChildren: boolean;
  addChild: (child: { name: string; age: number; gradeLevel: string; targetExam?: string; subjects: string[] }) => Promise<void>;
  selectChild: (child: Child) => void;
  setSubject: (subject: string) => void;
  clearSubject: () => void;
  refreshChildren: () => Promise<void>;
  getChildProgress: (childId: number) => ProgressData[];
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [childrenProgress, setChildrenProgress] = useState<Map<number, ProgressData[]>>(new Map());
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  // Fetch children when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshChildren();
    } else {
      setChildrenList([]);
      setCurrentChild(null);
      setChildrenProgress(new Map());
    }
  }, [isAuthenticated, user]);

  const refreshChildren = async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingChildren(true);
    try {
      const fetchedChildren = await childrenAPI.getChildren();
      setChildrenList(fetchedChildren);

      // Fetch progress for each child
      const progressMap = new Map<number, ProgressData[]>();
      await Promise.all(
        fetchedChildren.map(async (child) => {
          try {
            const progress = await childrenAPI.getChildProgress(child.id);
            progressMap.set(child.id, progress);
          } catch (error) {
            console.error(`Error fetching progress for child ${child.id}:`, error);
            progressMap.set(child.id, []);
          }
        })
      );
      setChildrenProgress(progressMap);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const addChild = async (childData: {
    name: string;
    age: number;
    gradeLevel: string;
    targetExam?: string;
    subjects: string[];
  }) => {
    try {
      await childrenAPI.createChild(childData);
      await refreshChildren();
    } catch (error) {
      console.error('Error adding child:', error);
      throw error;
    }
  };

  const selectChild = (child: Child) => {
    setCurrentChild(child);
  };

  const setSubject = (subject: string) => {
    setSelectedSubject(subject);
  };

  const clearSubject = () => {
    setSelectedSubject(null);
  };

  const getChildProgress = (childId: number): ProgressData[] => {
    return childrenProgress.get(childId) || [];
  };

  return (
    <AppContext.Provider value={{
      children: childrenList,
      currentChild,
      childrenProgress,
      selectedSubject,
      isLoadingChildren,
      addChild,
      selectChild,
      setSubject,
      clearSubject,
      refreshChildren,
      getChildProgress,
    }}>
      {children}
    </AppContext.Provider>
  );
};