import { useState, useEffect, useCallback } from 'react';

export interface LongTask {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface UseLongTasksReturn {
  tasks: LongTask[];
  addTask: (name: string, metadata?: Record<string, any>) => string;
  updateTask: (id: string, updates: Partial<LongTask>) => void;
  removeTask: (id: string) => void;
  clearCompletedTasks: () => void;
  getTask: (id: string) => LongTask | undefined;
  isRunning: (id: string) => boolean;
}

export function useLongTasks(): UseLongTasksReturn {
  const [tasks, setTasks] = useState<LongTask[]>([]);

  const addTask = useCallback((name: string, metadata?: Record<string, any>): string => {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask: LongTask = {
      id,
      name,
      startTime: Date.now(),
      duration: 0,
      status: 'pending',
      metadata,
    };

    setTasks(prev => [...prev, newTask]);
    return id;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<LongTask>) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              ...updates,
              duration: updates.status === 'completed' || updates.status === 'failed'
                ? Date.now() - task.startTime
                : task.duration
            }
          : task
      )
    );
  }, []);

  const removeTask = useCallback((_id: any) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(task => task.status !== 'completed' && task.status !== 'failed'));
  }, []);

  const getTask = useCallback((_id: any) => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  const isRunning = useCallback((_id: any) => {
    const task = tasks.find(t => t.id === id);
    return task?.status === 'running';
  }, [tasks]);

  // Auto-update task durations for running tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev =>
        prev.map(task => {
          if (task.status === 'running') {
            return {
              ...task,
              duration: Date.now() - task.startTime
            };
          }
          return task;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    tasks,
    addTask,
    updateTask,
    removeTask,
    clearCompletedTasks,
    getTask,
    isRunning,
  };
}