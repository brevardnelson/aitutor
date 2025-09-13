import React, { createContext, useContext, useState, useEffect } from 'react';

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
  subject: string;
  topic: string;
  completed: number;
  total: number;
  lastActivity: Date;
}

interface SubjectEnrollment {
  childId: string;
  subject: string;
  enrolledAt: Date;
}

interface AppContextType {
  currentUser: Parent | null;
  children: Child[];
  currentChild: Child | null;
  progress: Progress[];
  enrollments: SubjectEnrollment[];
  selectedSubject: string | null;
  login: (parent: Parent) => void;
  logout: () => void;
  addChild: (child: Omit<Child, 'id'>, subjects?: string[]) => void;
  selectChild: (child: Child) => void;
  setSubject: (subject: string) => void;
  clearSubject: () => void;
  enrollChildInSubject: (childId: string, subject: string) => void;
  getEnrolledChildren: (subject: string) => Child[];
  getUnenrolledChildren: (subject: string) => Child[];
  updateProgress: (childId: string, subject: string, topic: string, completed: number, total: number) => void;
  getSubjectProgress: (childId: string, subject: string) => Progress[];
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// Helper functions for localStorage persistence
const loadFromStorage = (key: string, defaultValue: any): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Parent | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>(() => 
    loadFromStorage('caribbean_ai_children', [])
  );
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [progress, setProgress] = useState<Progress[]>(() => 
    loadFromStorage('caribbean_ai_progress', [])
  );
  const [enrollments, setEnrollments] = useState<SubjectEnrollment[]>(() => 
    loadFromStorage('caribbean_ai_enrollments', [])
  );
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Persist children list to localStorage whenever it changes
  useEffect(() => {
    saveToStorage('caribbean_ai_children', childrenList);
  }, [childrenList]);

  // Persist enrollments to localStorage whenever they change
  useEffect(() => {
    saveToStorage('caribbean_ai_enrollments', enrollments);
  }, [enrollments]);

  // Persist progress to localStorage whenever it changes
  useEffect(() => {
    saveToStorage('caribbean_ai_progress', progress);
  }, [progress]);

  const login = (parent: Parent) => {
    setCurrentUser(parent);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentChild(null);
  };

  const enrollChildInSubject = (childId: string, subject: string) => {
    setEnrollments(prev => {
      // Check if already enrolled
      const existing = prev.find(e => e.childId === childId && e.subject === subject);
      if (existing) return prev;
      
      // Add new enrollment
      return [...prev, {
        childId,
        subject,
        enrolledAt: new Date()
      }];
    });
  };

  const addChild = (child: Omit<Child, 'id'>, subjects?: string[]) => {
    const newChild = { ...child, id: Date.now().toString() };
    setChildrenList(prev => [...prev, newChild]);
    
    // Enroll child in specified subjects or current subject as default
    const subjectsToEnroll = subjects && subjects.length > 0 ? subjects : [selectedSubject || 'math'];
    subjectsToEnroll.forEach(subject => {
      enrollChildInSubject(newChild.id, subject);
    });
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

  const getEnrolledChildren = (subject: string): Child[] => {
    const enrolledIds = enrollments
      .filter(e => e.subject === subject)
      .map(e => e.childId);
    
    return childrenList.filter(child => enrolledIds.includes(child.id));
  };

  const getUnenrolledChildren = (subject: string): Child[] => {
    const enrolledIds = enrollments
      .filter(e => e.subject === subject)
      .map(e => e.childId);
    
    return childrenList.filter(child => !enrolledIds.includes(child.id));
  };

  const updateProgress = (childId: string, subject: string, topic: string, completed: number, total: number) => {
    setProgress(prev => {
      const existing = prev.find(p => p.childId === childId && p.subject === subject && p.topic === topic);
      if (existing) {
        return prev.map(p => 
          p.childId === childId && p.subject === subject && p.topic === topic 
            ? { ...p, completed, total, lastActivity: new Date() }
            : p
        );
      }
      return [...prev, { childId, subject, topic, completed, total, lastActivity: new Date() }];
    });
  };

  const getSubjectProgress = (childId: string, subject: string): Progress[] => {
    return progress.filter(p => p.childId === childId && p.subject === subject);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      children: childrenList,
      currentChild,
      progress,
      enrollments,
      selectedSubject,
      login,
      logout,
      addChild,
      selectChild,
      setSubject,
      clearSubject,
      enrollChildInSubject,
      getEnrolledChildren,
      getUnenrolledChildren,
      updateProgress,
      getSubjectProgress
    }}>
      {children}
    </AppContext.Provider>
  );
};