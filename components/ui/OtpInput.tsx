'use client';

import { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  onComplete: (otp: string) => void;
  onResend?: () => void;
  resendTimer?: number;
  isLoading?: boolean;
}

export function OtpInput({ onComplete, onResend, resendTimer = 0, isLoading }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInput = (e: React.FormEvent<HTMLInputElement>, index: number) => {
    const val = e.currentTarget.value;
    if (!/^\d*$/.test(val)) { e.currentTarget.value = ''; return; }
    const last = val.slice(-1);
    e.currentTarget.value = last;
    const next = [...digits];
    next[index] = last;
    setDigits(next);
    if (last && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!e.currentTarget.value && index > 0) {
        e.preventDefault();
        const prev = inputRefs.current[index - 1];
        if (prev) {
          prev.value = '';
          prev.focus();
          const next = [...digits];
          next[index - 1] = '';
          setDigits(next);
        }
      } else if (e.currentTarget.value) {
        e.currentTarget.value = '';
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
      const el = inputRefs.current[i];
      if (el) el.value = pasted[i];
    }
    setDigits(next);
    if (pasted.length < 6) {
      inputRefs.current[pasted.length]?.focus();
    } else {
      inputRefs.current[5]?.blur();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center gap-1 sm:gap-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            pattern="[0-9]*"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono border-2 border-slate-200 rounded-lg bg-white focus:border-[#11B4B4] focus:ring-1 focus:ring-[#11B4B4] outline-none transition-all"
            onInput={(e) => handleInput(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onComplete(digits.join(''))}
        disabled={digits.join('').length !== 6 || isLoading}
        className="w-full mt-8 min-h-[52px] rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-bold border-b-[5px] border-brand-hover transition-all duration-150 hover:brightness-110 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:border-b-[5px] disabled:translate-y-0 flex items-center justify-center"
      >
        {isLoading ? (
          <div className="w-5 h-5 mx-auto rounded-full border-2 border-white/30 border-t-white animate-spin" style={{ animationDuration: '0.65s' }} />
        ) : 'Verify Code'}
      </button>
      {onResend && (
        <p className="text-sm text-text-muted font-body mt-6">
          {resendTimer > 0 ? (
            <>Resend code in {resendTimer}s</>
          ) : (
            <><span>Didn&apos;t receive it? </span><span className="text-brand-primary font-semibold hover:underline cursor-pointer" onClick={onResend}>Resend code</span></>
          )}
        </p>
      )}
    </div>
  );
}
