
export enum AcademicYear {
  FIRST = '1ero',
  SECOND = '2do',
  THIRD = '3ero',
  FOURTH = '4to',
  FIFTH = '5to'
}

export interface User {
  firstName: string;
  lastName: string;
  year: AcademicYear;
  section: string;
  email: string;
  password?: string; // Added for sync simulation
}

export interface Evaluation {
  id: string;
  name: string;
  percentage: number; // 0-100
  grade?: number; // 0-20
  date: string;
}

export interface Task {
  id: string;
  name: string;
  dueDate: string;
  completed: boolean;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  teacher: string;
  evaluations: Evaluation[];
  tasks: Task[]; // Added tasks
}

export interface Holiday {
  date: string;
  name: string;
}

export enum ChatMode {
  FAST = 'Rápido',
  THINK = 'Pensar',
  IMAGE = 'Imagen'
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;
  thinking?: string;
}
