import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/app/App";
import { driveSession } from "../helpers/driveSession";

function installBoundary() {
  const calls = { fetch: 0, xhr: 0, ws: 0, es: 0, beacon: 0, storage: 0, cookie: 0, idb: 0 };

  window.fetch = vi.fn((..._args: unknown[]) => {
    calls.fetch += 1;
    return Promise.resolve(new Response("{}", { status: 200 }));
  }) as typeof window.fetch;

  class XhrStub {
    open() {
      calls.xhr += 1;
    }
    send() {}
    addEventListener() {}
    setRequestHeader() {}
  }
  (window as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = XhrStub;

  (window as unknown as { WebSocket: unknown }).WebSocket = class {
    constructor() {
      calls.ws += 1;
    }
    close() {}
  };

  (window as unknown as { EventSource: unknown }).EventSource = class {
    constructor() {
      calls.es += 1;
    }
    close() {}
  };

  Object.defineProperty(navigator, "sendBeacon", {
    value: () => {
      calls.beacon += 1;
      return true;
    },
    configurable: true,
  });

  const makeStorage = () => ({
    getItem: () => null,
    setItem: () => {
      calls.storage += 1;
    },
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    get length() {
      return 0;
    },
  });
  Object.defineProperty(window, "localStorage", { value: makeStorage(), configurable: true });
  Object.defineProperty(window, "sessionStorage", { value: makeStorage(), configurable: true });

  Object.defineProperty(window, "indexedDB", {
    value: {
      open: () => {
        calls.idb += 1;
      },
    },
    configurable: true,
  });

  Object.defineProperty(document, "cookie", {
    get: () => "",
    set: () => {
      calls.cookie += 1;
    },
    configurable: true,
  });

  return calls;
}

describe("런타임 경계", () => {
  it("학습 흐름 전체에서 외부 요청과 브라우저 저장 쓰기가 0건이다", async () => {
    const calls = installBoundary();
    const user = userEvent.setup();
    render(<App />);
    await driveSession(user, {});

    expect(calls.fetch).toBe(0);
    expect(calls.xhr).toBe(0);
    expect(calls.ws).toBe(0);
    expect(calls.es).toBe(0);
    expect(calls.beacon).toBe(0);
    expect(calls.storage).toBe(0);
    expect(calls.cookie).toBe(0);
    expect(calls.idb).toBe(0);
  });

  it("다시 시작해도 어떤 저장소에도 쓰지 않는다", async () => {
    const calls = installBoundary();
    const user = userEvent.setup();
    render(<App />);
    await driveSession(user, {});
    await user.click(screen.getByRole("button", { name: "처음부터 다시 하기" }));
    await user.click(screen.getByRole("button", { name: "다시 시작할게요" }));
    expect(screen.getByRole("button", { name: "활동 시작하기" })).toBeInTheDocument();
    expect(calls.storage).toBe(0);
    expect(calls.cookie).toBe(0);
  });
});
