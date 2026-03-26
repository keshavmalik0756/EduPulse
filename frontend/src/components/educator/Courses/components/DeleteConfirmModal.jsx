import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, courseTitle, isBulk, count }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-center text-gray-900 mb-2">
                {isBulk ? `Delete ${count} Courses?` : 'Delete Course?'}
              </h3>
              
              <p className="text-center text-gray-500 mb-8 text-sm sm:text-base">
                {isBulk 
                  ? `Are you sure you want to permanently delete these ${count} selected courses?`
                  : <>Are you sure you want to delete <span className="font-bold text-gray-900">"{courseTitle}"</span>?</>
                }
                <span className="block mt-3 p-3 bg-red-50/50 rounded-xl border border-red-100/50 font-semibold text-red-600 uppercase text-[10px] tracking-widest leading-relaxed">
                  This action is irreversible. All associated lectures, materials, and student progress will be purged.
                </span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                >
                  No, Keep it
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  Yes, Delete
                </button>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
