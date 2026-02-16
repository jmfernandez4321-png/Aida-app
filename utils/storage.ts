
import { User, Subject } from '../types';

const USER_KEY = 'aida_user';
const SUBJECTS_KEY = 'aida_subjects';

export const saveUser = (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveSubjects = (subjects: Subject[]) => localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
export const getSubjects = (): Subject[] => {
  const data = localStorage.getItem(SUBJECTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const logout = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SUBJECTS_KEY);
};
