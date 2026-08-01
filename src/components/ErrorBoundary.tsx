import { Component, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/**
 * 想定外のエラーでアプリ全体が真っ白になるのを防ぐ最終防波堤。
 * エラー内容と「再読み込み」ボタンを表示します (データは端末内に保存済み)。
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="crash">
        <h1 className="crash__title">エラーが発生しました</h1>
        <p className="crash__text">
          ご不便をおかけしました。下のボタンでアプリを再読み込みしてください。
          保存済みの記録は端末内に残っています。
        </p>
        <button className="btn btn--primary" onClick={() => location.reload()}>
          再読み込み
        </button>
        <details className="crash__detail">
          <summary>エラー詳細 (お問い合わせ用)</summary>
          <pre>{String(this.state.error?.stack ?? this.state.error)}</pre>
        </details>
      </div>
    );
  }
}
