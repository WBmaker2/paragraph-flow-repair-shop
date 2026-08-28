import { StrictMode, Component, type ReactNode, type ErrorInfo } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/tokens.css";
import "./styles/app.css";
import "./styles/screens.css";
import "./styles/motion.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: unknown, _info: ErrorInfo) {
    // 기술 정보는 학생 화면에 노출하지 않는다(계획 §11).
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <h1>문단 흐름 수리소</h1>
          <p>활동을 다시 불러오지 못했어요.</p>
          <button type="button" onClick={() => window.location.reload()}>
            처음부터 다시 하기
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
