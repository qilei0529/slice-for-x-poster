import type { Frame } from "@/lib/frame";

export type AgentImageState = {
  id: string;
  name: string;
  frame: Frame;
};

export type AgentState = {
  sliceCount: number;
  tileWidth: number;
  tileHeight: number;
  background: string;
  radius: number;
  selectedId: string | null;
  previewOpen: boolean;
  exporting: boolean;
  error: string | null;
  images: AgentImageState[];
};

export type AgentConfigPatch = {
  sliceCount?: number;
  tileWidth?: number;
  tileHeight?: number;
  background?: string;
  radius?: number;
};

export type LoadImageInput =
  | { url: string; name?: string }
  | { base64: string; mime?: string; name?: string };

export type SliceForXApi = {
  version: string;
  getState: () => AgentState;
  setConfig: (patch: AgentConfigPatch) => void;
  loadImage: (input: LoadImageInput) => Promise<{ id: string }>;
  clear: () => void;
  select: (id: string | null) => void;
  remove: (id: string) => void;
  reorder: (id: string, edge: "front" | "back") => void;
  setFrame: (id: string, frame: Frame) => void;
  preview: (open?: boolean) => void;
  export: () => Promise<void>;
  help: () => string;
};

export type AgentApiHandlers = Omit<SliceForXApi, "version" | "help">;

declare global {
  interface Window {
    SliceForX?: SliceForXApi;
  }
}

const HELP = [
  "SliceForX computer-use API",
  "Manifest: /agent.json",
  "Methods:",
  "  getState() — serializable editor state",
  "  setConfig({ sliceCount?, tileWidth?, tileHeight?, background?, radius? })",
  "  loadImage({ url }) | loadImage({ base64, mime?, name? }) — prefer base64 if CORS blocks URL",
  "  clear() | select(id|null) | remove(id) | reorder(id, 'front'|'back')",
  "  setFrame(id, { x, y, width, height })",
  "  preview(open?) | export()",
  "DOM: click [data-agent='…'] (see /agent.json)",
].join("\n");

export function mountSliceForX(
  handlers: AgentApiHandlers,
  version: string,
): () => void {
  const api: SliceForXApi = {
    version,
    getState: () => handlers.getState(),
    setConfig: (patch) => handlers.setConfig(patch),
    loadImage: (input) => handlers.loadImage(input),
    clear: () => handlers.clear(),
    select: (id) => handlers.select(id),
    remove: (id) => handlers.remove(id),
    reorder: (id, edge) => handlers.reorder(id, edge),
    setFrame: (id, frame) => handlers.setFrame(id, frame),
    preview: (open) => handlers.preview(open),
    export: () => handlers.export(),
    help: () => HELP,
  };
  window.SliceForX = api;
  return () => {
    if (window.SliceForX === api) delete window.SliceForX;
  };
}

export type ResolvedImageSource = {
  src: string;
  name: string;
  /** True when src is an object URL that must be revoked on failure / clear. */
  objectUrl: boolean;
};

export async function resolveImageSource(
  input: LoadImageInput,
): Promise<ResolvedImageSource> {
  if ("base64" in input && typeof input.base64 === "string") {
    const mime = input.mime?.trim() || "image/png";
    if (!mime.startsWith("image/")) {
      throw new Error("mime must be an image/* type");
    }
    const raw = input.base64.includes(",")
      ? input.base64.slice(input.base64.indexOf(",") + 1)
      : input.base64;
    if (!raw) throw new Error("base64 is empty");
    return {
      src: `data:${mime};base64,${raw}`,
      name: sanitizeName(input.name) || "slice",
      objectUrl: false,
    };
  }

  if ("url" in input && typeof input.url === "string" && input.url.trim()) {
    const url = input.url.trim();
    if (url.startsWith("data:")) {
      return {
        src: url,
        name: sanitizeName(input.name) || "slice",
        objectUrl: false,
      };
    }
    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new Error(
        "Failed to fetch image (network or CORS). Prefer loadImage({ base64 }).",
      );
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch image: HTTP ${response.status}`);
    }
    const blob = await response.blob();
    if (!blob.type.startsWith("image/") && blob.type !== "") {
      throw new Error("URL did not return an image");
    }
    return {
      src: URL.createObjectURL(blob),
      name: sanitizeName(input.name) || nameFromUrl(url),
      objectUrl: true,
    };
  }

  throw new Error("Provide { url } or { base64 }");
}

function nameFromUrl(url: string) {
  try {
    const path = new URL(url, "https://example.invalid").pathname;
    const leaf = path.split("/").filter(Boolean).pop() ?? "slice";
    return sanitizeName(leaf.replace(/\.[^.]+$/, "")) || "slice";
  } catch {
    return "slice";
  }
}

function sanitizeName(name: string | undefined) {
  if (!name) return "";
  const trimmed = name.trim().replace(/[/\\?%*:|"<>]/g, "-");
  return trimmed.slice(0, 80);
}
