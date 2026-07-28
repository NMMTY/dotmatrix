import manifestJson from "../../.generated/component-manifest.json";

export type ControlKind = "boolean" | "number" | "select" | "text" | "readonly";

export interface PropDoc {
  name: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
  kind: ControlKind;
  options?: string[];
}

export interface ComponentDoc {
  name: string;
  filePath: string;
  description: string;
  props: PropDoc[];
}

const manifest = manifestJson as ComponentDoc[];

export function getComponentDoc(name: string): ComponentDoc | undefined {
  return manifest.find((doc) => doc.name === name);
}

export function getAllComponentDocs(): ComponentDoc[] {
  return manifest;
}
