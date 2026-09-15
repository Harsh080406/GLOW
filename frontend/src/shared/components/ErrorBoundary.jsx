import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Page crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px", fontFamily: "monospace", background: "#fff1f1",
          minHeight: "100vh", color: "#b91c1c"
        }}>
          <h2>Something went wrong</h2>
          <pre style={{ marginTop: 16, fontSize: 13, whiteSpace: "pre-wrap" }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.history.back(); }}
            style={{ marginTop: 24, padding: "10px 20px", cursor: "pointer" }}
          >
            Go Back
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
