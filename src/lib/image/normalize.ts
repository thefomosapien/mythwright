import sharp from "sharp";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const COMIC_PAGE_MAX_EDGE = 2400;
const COMIC_PAGE_QUALITY = 85;
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 75;

const COVER_DIMENSIONS = {
  avatar: { width: 400, height: 400, fit: "cover" as const },
  cover: { width: 1200, height: 1600, fit: "inside" as const },
  banner: { width: 1920, height: 600, fit: "cover" as const },
} as const;

export interface NormalizedImage {
  buffer: Buffer;
  thumbnailBuffer: Buffer;
  width: number;
  height: number;
  format: "webp";
}

function validateInput(input: Buffer, mimeType?: string) {
  if (input.length > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  if (mimeType && !ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(
      `Unsupported image type: ${mimeType}. Allowed: PNG, JPG, WebP`
    );
  }
}

export async function normalizeComicPage(
  input: Buffer,
  mimeType?: string
): Promise<NormalizedImage> {
  validateInput(input, mimeType);

  // Strip EXIF and get metadata
  const image = sharp(input).rotate(); // .rotate() auto-orients based on EXIF then strips
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions");
  }

  // Resize to max 2400px longest edge, preserve aspect ratio, don't upscale
  const longestEdge = Math.max(metadata.width, metadata.height);
  const needsResize = longestEdge > COMIC_PAGE_MAX_EDGE;

  let resized = image;
  if (needsResize) {
    if (metadata.width >= metadata.height) {
      resized = image.resize(COMIC_PAGE_MAX_EDGE, undefined, {
        fit: "inside",
        withoutEnlargement: true,
      });
    } else {
      resized = image.resize(undefined, COMIC_PAGE_MAX_EDGE, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }
  }

  // Convert to WebP
  const fullBuffer = await resized
    .webp({ quality: COMIC_PAGE_QUALITY })
    .toBuffer();

  // Get final dimensions
  const fullMeta = await sharp(fullBuffer).metadata();

  // Generate 400px-wide thumbnail
  const thumbnailBuffer = await sharp(fullBuffer)
    .resize(THUMBNAIL_WIDTH, undefined, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: THUMBNAIL_QUALITY })
    .toBuffer();

  return {
    buffer: fullBuffer,
    thumbnailBuffer,
    width: fullMeta.width!,
    height: fullMeta.height!,
    format: "webp",
  };
}

export async function normalizeCoverImage(
  input: Buffer,
  type: "avatar" | "cover" | "banner",
  mimeType?: string
): Promise<NormalizedImage> {
  validateInput(input, mimeType);

  const dims = COVER_DIMENSIONS[type];
  const image = sharp(input).rotate();

  // Resize to target dimensions
  const resized = image.resize(dims.width, dims.height, {
    fit: dims.fit,
    withoutEnlargement: true,
    position: "center",
  });

  const fullBuffer = await resized
    .webp({ quality: COMIC_PAGE_QUALITY })
    .toBuffer();

  const fullMeta = await sharp(fullBuffer).metadata();

  // Generate thumbnail
  const thumbnailBuffer = await sharp(fullBuffer)
    .resize(THUMBNAIL_WIDTH, undefined, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: THUMBNAIL_QUALITY })
    .toBuffer();

  return {
    buffer: fullBuffer,
    thumbnailBuffer,
    width: fullMeta.width!,
    height: fullMeta.height!,
    format: "webp",
  };
}
