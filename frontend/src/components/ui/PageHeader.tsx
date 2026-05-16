import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker: string;
  title: string;
  description?: string;
  aside?: ReactNode;
};

export function PageHeader({ kicker, title, description, aside }: PageHeaderProps) {
  return (
    <div className="mb-7 flex items-end justify-between gap-6">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h1 className="headline mt-2">{title}</h1>
        {description && <p className="muted-copy mt-2 max-w-3xl">{description}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
