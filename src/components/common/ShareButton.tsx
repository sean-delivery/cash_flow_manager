import React from 'react';

type Props = {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function ShareButton({
  title,
  text,
  url = window.location.href,
  className,
  children
}: Props) {
  const onClick = async () => {
    const p = { title: title || document.title, text: text || '', url };
    try {
      if ((navigator as any).share) {
        await (navigator as any).share(p);
        return;
      }
      await navigator.clipboard.writeText([p.title, p.text, p.url].filter(Boolean).join(' - '));
      // טוסט אם קיים, אחרת alert
      // @ts-ignore
      (window as any)?.toast?.success?.('הקישור הועתק') || alert('הקישור הועתק');
    } catch (e) {}
  };

  return (
    <button 
      type="button" 
      onClick={onClick} 
      className={className} 
      data-testid="share-btn"
    >
      {children || 'שתף'}
    </button>
  );
}