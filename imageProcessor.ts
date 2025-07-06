import sharp from "sharp";
import axios from "axios";
import TelegramBot from "node-telegram-bot-api";

// Type definitions
interface WatermarkPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

type WatermarkPositionType =
  | "top-left"
  | "top-right"
  | "top"
  | "center"
  | "bottom-left"
  | "bottom-right"
  | "bottom";

interface TelegramFile {
  file_id: string;
  file_path: string;
  file_size?: number;
}

// Download image from Telegram file ID
async function downloadImage(
  fileId: string,
  bot: TelegramBot
): Promise<Buffer> {
  try {
    const file: TelegramFile = await bot.getFile(fileId);
    const response = await axios.get(
      `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`,
      {
        responseType: "arraybuffer",
      }
    );
    return Buffer.from(response.data);
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}

// Calculate watermark position and size
function calculateWatermarkPosition(
  photoWidth: number,
  photoHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: WatermarkPositionType
): WatermarkPosition {
  // Make watermark full width of the photo
  const scaledWatermarkWidth = photoWidth;
  const scaledWatermarkHeight = (watermarkHeight / watermarkWidth) * photoWidth;

  let x: number, y: number;

  switch (position) {
    case "top-left":
    case "top-right":
    case "top":
      x = 0;
      y = 0;
      break;
    case "center":
      x = 0;
      y = (photoHeight - scaledWatermarkHeight) / 2;
      break;
    case "bottom-left":
    case "bottom-right":
    case "bottom":
    default:
      x = 0;
      y = photoHeight - scaledWatermarkHeight;
      break;
  }

  return {
    x: Math.max(0, Math.round(x)),
    y: Math.max(0, Math.round(y)),
    width: Math.round(scaledWatermarkWidth),
    height: Math.round(scaledWatermarkHeight),
  };
}

// Apply watermark to image
async function applyWatermark(
  photoBuffer: Buffer,
  watermarkBuffer: Buffer,
  position: WatermarkPositionType = "bottom"
): Promise<Buffer> {
  try {
    // Get image metadata
    const photoMetadata = await sharp(photoBuffer).metadata();
    const watermarkMetadata = await sharp(watermarkBuffer).metadata();

    if (
      !photoMetadata.width ||
      !photoMetadata.height ||
      !watermarkMetadata.width ||
      !watermarkMetadata.height
    ) {
      throw new Error("Invalid image metadata");
    }

    // Calculate watermark position and size
    const { x, y, width, height } = calculateWatermarkPosition(
      photoMetadata.width,
      photoMetadata.height,
      watermarkMetadata.width,
      watermarkMetadata.height,
      position
    );

    // Resize watermark
    const resizedWatermark = await sharp(watermarkBuffer)
      .resize(width, height, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Create composite image
    const watermarkedImage = await sharp(photoBuffer)
      .composite([
        {
          input: resizedWatermark,
          top: y,
          left: x,
        },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    return watermarkedImage;
  } catch (error) {
    console.error("Error applying watermark:", error);
    throw error;
  }
}

// Process image with watermark
async function processImage(
  photoFileId: string,
  watermarkFileId: string,
  position: WatermarkPositionType,
  bot: TelegramBot
): Promise<Buffer> {
  try {
    // Download both images
    const [photoBuffer, watermarkBuffer] = await Promise.all([
      downloadImage(photoFileId, bot),
      downloadImage(watermarkFileId, bot),
    ]);

    // Apply watermark
    const watermarkedBuffer = await applyWatermark(
      photoBuffer,
      watermarkBuffer,
      position
    );

    return watermarkedBuffer;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}

export {
  downloadImage,
  applyWatermark,
  processImage,
  calculateWatermarkPosition,
  type WatermarkPositionType,
  type WatermarkPosition,
};
