const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function publicAssetPath(path: string) {
  return `${publicBasePath}${path.startsWith("/") ? path : `/${path}`}`;
}

export const dsiqLogoSrc = publicAssetPath("/assets/logo/dsiq-logo.png");
