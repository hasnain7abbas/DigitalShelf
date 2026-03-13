export interface ShelfItemFile {
  kind: "File";
  path: string;
  name: string;
  extension: string;
  size_bytes: number;
  thumbnail_b64: string | null;
}

export interface ShelfItemImage {
  kind: "Image";
  path: string;
  name: string;
  width: number;
  height: number;
  thumbnail_b64: string;
}

export interface ShelfItemText {
  kind: "Text";
  content: string;
  preview: string;
  source_app: string | null;
}

export interface ShelfItemLink {
  kind: "Link";
  url: string;
  title: string | null;
  favicon_b64: string | null;
}

export type ShelfItemData =
  | ShelfItemFile
  | ShelfItemImage
  | ShelfItemText
  | ShelfItemLink;

export interface ShelfItem {
  id: string;
  data: ShelfItemData;
  added_at: number;
}

export interface ShelfSettings {
  opacity: number;
  always_on_top: boolean;
  auto_collapse: boolean;
  collapse_delay_ms: number;
  max_items: number;
  hotkey: string;
  theme: "glass" | "solid" | "dark";
  width: number;
  edge: "Left" | "Right" | "Top" | "Bottom" | "Float";
}
