import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PlatformSelect } from "./platform-select";

const props = {
  id: "test-select",
  value: "one",
  options: [{ value: "one", label: "One" }],
  onValueChange: () => undefined,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PlatformSelect", () => {
  it.each(["Linux x86_64", "Windows NT 10.0"])(
    "uses the shadcn select on %s",
    (userAgent) => {
      vi.stubGlobal("navigator", { userAgent });

      const markup = renderToStaticMarkup(<PlatformSelect {...props} />);

      expect(markup).toContain('data-slot="select-trigger"');
      expect(markup).not.toContain('data-slot="native-select"');
    },
  );

  it("uses the native select on macOS", () => {
    vi.stubGlobal("navigator", { userAgent: "Macintosh" });

    const markup = renderToStaticMarkup(<PlatformSelect {...props} />);

    expect(markup).toContain('data-slot="native-select"');
    expect(markup).not.toContain('data-slot="select-trigger"');
  });
});
