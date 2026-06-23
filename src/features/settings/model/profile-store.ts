import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProfileState {
  name: string;
  email: string;
  role: 'teacher_assistant' | 'instructor' | 'coordinator';
  otec: string;
  institution: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setRole: (role: 'teacher_assistant' | 'instructor' | 'coordinator') => void;
  setOtec: (otec: string) => void;
  setInstitution: (institution: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: '',
      email: '',
      role: 'teacher_assistant',
      otec: '',
      institution: '',
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      setRole: (role) => set({ role }),
      setOtec: (otec) => set({ otec }),
      setInstitution: (institution) => set({ institution }),
    }),
    { name: 'edutrack-profile' }
  )
);
