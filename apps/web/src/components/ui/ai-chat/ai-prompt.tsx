'use client';

import { cn } from '@/lib/utils';
import { Button } from '@neonpro/ui';
import { Send } from 'lucide-react';
import React, { useRef, useState } from 'react';
import type { AIPromptProps } from './types';

/**
 * AI Prompt Component for NeonPro Aesthetic Clinic
 * Inspired by KokonutUI with aesthetic clinic branding
 */
export default function AIPrompt({
  onSubmit,
  placeholder = 'Pergunte sobre tratamentos estéticos...',
  disabled = false,
  className,
  model,
  onModelChange,
  showInput = true,
  models = [
    { value: 'gpt-5-mini', label: 'ChatGPT 5 Mini' },
    { value: 'gemini-2.5-flash', label: 'Gemini Flash 2.5' },
    // experimental (deactivated by default)
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', disabled: true },
    { value: 'o4-mini', label: 'o4-mini', disabled: true },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', disabled: true },
  ],
}: AIPromptProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSubmit?.(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div
      className={cn(
        'relative w-full max-w-2xl mx-auto',
        className,
      )}
    >
      <form onSubmit={handleSubmit} className='relative'>
        <div className='relative flex items-end gap-2 p-4 rounded-2xl border border-[#B4AC9C]/30 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl focus-within:border-[#294359] focus-within:shadow-[0_0_0_1px_#294359]'>
          {/* Aesthetic clinic gradient accent */}
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-[#112031]/5 via-[#294359]/5 to-[#AC9469]/5 pointer-events-none' />

          {/* Model selector */}
          <div className='flex-shrink-0 mb-1'>
            <label htmlFor='model-select' className='sr-only'>Selecionar modelo de IA</label>
            <select
              id='model-select'
              value={model}
              onChange={e => onModelChange?.(e.target.value)}
              className='h-8 rounded-md border border-[#D2D0C8] bg-white px-2 text-xs text-[#112031] focus:border-[#294359] focus:outline-none focus:ring-2 focus:ring-[#294359]/20'
              aria-label='Selecionar modelo de IA'
            >
              {models.map(m => (
                <option key={m.value} value={m.value} disabled={m.disabled}>
                  {m.label}
                  {m.disabled ? ' (desativado)' : ''}
                </option>
              ))}
            </select>
          </div>

          {showInput && (
            <>
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={e => {
                  setMessage(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled}
                className='flex-1 resize-none border-0 bg-transparent text-[#112031] placeholder-[#B4AC9C] focus:outline-none min-h-[24px] max-h-32 text-sm leading-6'
                rows={1}
              />

              {/* Send Button */}
              <Button
                type='submit'
                size='sm'
                disabled={!message.trim() || disabled}
                className='flex-shrink-0 h-8 w-8 p-0 rounded-full bg-gradient-to-br from-[#294359] to-[#112031] hover:from-[#AC9469] hover:to-[#294359] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg'
              >
                <Send className='w-4 h-4 text-white' />
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
