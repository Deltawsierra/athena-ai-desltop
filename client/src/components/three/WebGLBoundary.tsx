/**
 * A WebGL failure must cost the canvas, not the page.
 *
 * This runs in Electron on whatever machine the app is installed on, and
 * three of those are ordinary: a VM with no GPU passthrough, a driver that
 * refuses the context, and a laptop that has already handed its last context
 * to something else. In all three, mounting a Canvas throws during render --
 * which without a boundary takes down the whole dashboard, so the screen a
 * customer sees is blank rather than merely flat.
 *
 * The fallback is not an apology. It is the same data laid out without the
 * globe, because the numbers are the point and the sphere is the flourish.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Shown instead of the canvas. Should carry the same information. */
  fallback: ReactNode;
  /** Named in the console so a support log says which canvas died. */
  label: string;
}

interface State {
  failed: boolean;
}

/** Whether a context can be had at all, checked before we try to render one. */
export function webglAvailable(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    // Contexts are a finite resource; hand this one straight back.
    const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default class WebGLBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Not swallowed. A canvas that fails silently on one machine and works on
    // every other is the kind of thing that gets found during a demo.
    console.error(
      `[athena] the ${this.props.label} canvas failed and was replaced by its ` +
        `fallback:`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.failed) return <>{this.props.fallback}</>;
    return <>{this.props.children}</>;
  }
}
