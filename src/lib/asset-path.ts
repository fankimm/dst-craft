const basePath = process.env.NODE_ENV === "production" ? "/dst-craft" : "";

export function assetPath(path: string): string {
  return `${basePath}${path}`;
}
