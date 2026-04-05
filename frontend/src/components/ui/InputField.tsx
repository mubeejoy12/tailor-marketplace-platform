import { InputHTMLAttributes, ReactNode } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
}

export default function InputField({ label, error, icon, hint, className = "", ...props }: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[#111111]">
          {label}
          {props.required && <span className="text-[#0F766E] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#9CA3AF]
            focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]
            transition-all duration-200
            disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed
            ${icon ? "pl-10" : ""}
            ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}
            ${className}`}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-[#6B7280]">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
