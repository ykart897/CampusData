import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="panel grid min-h-72 place-items-center px-8 py-12 text-center">
      <div className="max-w-md">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <p className="muted-copy mt-2">{description}</p>
        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
