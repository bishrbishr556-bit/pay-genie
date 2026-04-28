import { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-0 sm:p-6">
      <div className="w-full max-w-md min-h-screen sm:min-h-0 sm:h-[820px] sm:rounded-[2.5rem] bg-background overflow-hidden shadow-elevated relative sm:border-8 sm:border-slate-950">
        {children}
      </div>
    </div>
  );
}