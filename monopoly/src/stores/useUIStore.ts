import { create } from 'zustand';
import type { ModalType, ToastMessage } from '../types/game';

// ==================== Store 接口 ====================

interface UIStore {
  activeModal: ModalType | null;
  modalData: Record<string, unknown>;
  selectedCellIndex: number | null;
  toasts: ToastMessage[];
  diceRolling: boolean;
  isMoving: boolean;

  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  selectCell: (index: number | null) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  setDiceRolling: (rolling: boolean) => void;
  setIsMoving: (moving: boolean) => void;
}

// ==================== Store ====================

export const useUIStore = create<UIStore>((set, get) => ({
  activeModal: null,
  modalData: {},
  selectedCellIndex: null,
  toasts: [],
  diceRolling: false,
  isMoving: false,

  // ==================== 弹窗控制 ====================
  openModal: (type: ModalType, data?: Record<string, unknown>) => {
    set({
      activeModal: type,
      modalData: data ?? {},
    });
  },

  closeModal: () => {
    set({
      activeModal: null,
      modalData: {},
    });
  },

  // ==================== 格子选择 ====================
  selectCell: (index: number | null) => {
    set({ selectedCellIndex: index });
  },

  // ==================== Toast 消息 ====================
  addToast: (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    const duration = toast.duration ?? 3000;

    set({ toasts: [...get().toasts, newToast] });

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id: string) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },

  // ==================== 动画状态 ====================
  setDiceRolling: (rolling: boolean) => {
    set({ diceRolling: rolling });
  },

  setIsMoving: (moving: boolean) => {
    set({ isMoving: moving });
  },
}));
