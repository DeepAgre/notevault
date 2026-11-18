import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ExternalLink, PhoneCall } from 'lucide-react';

export default function CrisisModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3D3940]/40 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl border-t-4 border-[#C85C68] md:p-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F2] text-[#C85C68]">
              <Heart size={24} fill="currentColor" />
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-[#F7F5F0] text-[#77716B] transition hover:bg-[#EFECE6]"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#302D2A]">
            We care about your well-being
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#625E59]">
            Your recent reflection indicates you might be carrying an overwhelming amount of heavy distress right now. Please remember you don't have to navigate this alone:
          </p>

          <div className="mt-5 space-y-3 rounded-2xl bg-[#FFF5F6] border border-[#FFE3E6] p-4 text-sm text-[#8A3A45]">
            <div className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-2"><PhoneCall size={15} /> National Helpline (India):</span>
              <strong className="select-all rounded-lg bg-white px-2.5 py-1 text-xs shadow-xs">9152987821</strong>
            </div>
            <div className="flex items-center justify-between font-medium pt-2 border-t border-[#FCDADB]">
              <span className="flex items-center gap-2"><ExternalLink size={15} /> Global Support Directory:</span>
              <a href="https://befrienders.org" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-black">
                befrienders.org
              </a>
            </div>
          </div>

          <div className="mt-7 flex justify-end">
            <button
              onClick={onClose}
              className="w-full cursor-pointer rounded-2xl bg-[#292726] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-black"
            >
              I understand, take me back to safety
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}