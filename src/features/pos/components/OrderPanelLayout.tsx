import type { ReactNode } from 'react';

interface OrderPanelLayoutProps {
  title: string;
  description: string;
  body: ReactNode;
  footer: ReactNode;
}

export function DesktopOrderPanel({
  title,
  description,
  body,
  footer,
}: OrderPanelLayoutProps) {
  return (
    <aside className="hidden w-full shrink-0 flex-col border-t border-gray-200 bg-white md:flex md:w-[380px] md:border-l md:border-t-0 xl:w-[420px]">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{body}</div>

      <div className="shrink-0 space-y-3 border-t border-gray-200 bg-white p-4">
        {footer}
      </div>
    </aside>
  );
}
