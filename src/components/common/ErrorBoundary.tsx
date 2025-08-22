
import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; msg?: string };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: any) {
    return { hasError: true, msg: err?.message || 'אירעה שגיאה בלתי צפויה' };
  }

  componentDidCatch(error: any, info: any) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" style={{padding:16}}>
          <h3>משהו לא עבד…</h3>
          <p>{this.state.msg}</p>
          <button onClick={()=>location.reload()}>טען מחדש</button>
        </div>
      );
    }
    return this.props.children;
  }
}
