import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/useUIStore';
import './Toast.css';

/** Toast 图标映射 */
const TOAST_ICONS: Record<string, string> = {
  info: '\u2139\uFE0F',
  success: '\u2705',
  warning: '\u26A0\uFE0F',
  error: '\u274C',
};

/** Toast 动画配置 */
const toastVariants = {
  initial: { opacity: 0, x: 80, scale: 0.9 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 80, scale: 0.9 },
};

/** Toast 消息组件 - 页面右上角显示通知 */
const Toast: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => removeToast(toast.id)}
            role="alert"
          >
            <span className="toast__icon">{TOAST_ICONS[toast.type] || ''}</span>
            <span className="toast__message">{toast.message}</span>
            <button
              className="toast__close"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              aria-label="关闭"
            >
              &times;
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
