import TelegramBot from "node-telegram-bot-api";
import {
  initializeDatabase,
  getUser,
  setUserWatermark,
  updateWatermarkPosition,
  hasWatermark,
} from "./database";
import { processImage, type WatermarkPositionType } from "./imageProcessor";
import axios from "axios";

// Type definitions
interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    username?: string;
    first_name?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  photo?: Array<{
    file_id: string;
    file_size: number;
    width: number;
    height: number;
  }>;
}

interface TelegramCallbackQuery {
  id: string;
  from: {
    id: number;
    username?: string;
    first_name?: string;
  };
  message: {
    message_id: number;
    chat: {
      id: number;
    };
  };
  data: string;
}

interface TelegramWebhookBody {
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

interface User {
  user_id: string;
  watermark_file_id: string;
  watermark_position: string;
  created_at: string;
  updated_at: string;
}

type UserState =
  | "waiting_for_watermark"
  | `customizing_${string}`
  | `changing_watermark_${string}`;

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
  polling: false,
});

// Store user states for watermark upload
const userStates = new Map<number, UserState>();

// Store photo file IDs for callback handling
const photoFileIds = new Map<string, string>();
let photoCounter = 0;

// Position options for watermark
const POSITION_OPTIONS: string[][] = [
  ["top-left", "top-right"],
  ["center"],
  ["bottom-left", "bottom-right"],
  ["bottom"],
];

// Set webhook using Telegram API directly
async function setWebhook(url: string): Promise<any> {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        url: `${url}/api/webhook`,
      }
    );

    console.log(response.data);

    const result = response.data;
    if (!result.ok) {
      throw new Error(`Failed to set webhook: ${result.description}`);
    }
    return result;
  } catch (error) {
    console.error("Error setting webhook:", error);
    throw error;
  }
}

// Initialize bot handlers
async function initializeBot(): Promise<void> {
  try {
    console.log("Initializing bot");
    // Initialize database
    await initializeDatabase();

    // Set webhook for serverless deployment
    if (process.env.WEBHOOK_URL) {
      console.log("Setting webhook to", process.env.WEBHOOK_URL);
      await setWebhook(process.env.WEBHOOK_URL);
      console.log("Webhook set successfully");
    }

    console.log("Bot initialized successfully");
  } catch (error) {
    console.error("Error initializing bot:", error);
    throw error;
  }
}

// Handle /start command
async function handleStart(msg: TelegramMessage): Promise<void> {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  try {
    const hasUserWatermark = await hasWatermark(userId.toString());

    if (hasUserWatermark) {
      const user = await getUser(userId.toString());
      if (!user) {
        const message = `Welcome to the Watermark Bot! 🖼️\n\nI'll help you add watermarks to your photos.\n\nTo get started, please send me an image that you'd like to use as your watermark (preferably a PNG with transparent background).`;
        await bot.sendMessage(chatId, message);
        return;
      }
      const message = `Welcome back! 🎉\n\nYour watermark is set to position: *${user.watermark_position}*\n\nSend me a photo to add your watermark, or send a new image to update your watermark.`;

      await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } else {
      const message = `Welcome to the Watermark Bot! 🖼️\n\nI'll help you add watermarks to your photos.\n\nTo get started, please send me an image that you'd like to use as your watermark (preferably a PNG with transparent background).`;

      userStates.set(userId, "waiting_for_watermark");
      await bot.sendMessage(chatId, message);
    }
  } catch (error) {
    console.error("Error handling start command:", error);
    await bot.sendMessage(
      chatId,
      "Sorry, something went wrong. Please try again."
    );
  }
}

// Handle photo messages
async function handlePhoto(msg: TelegramMessage): Promise<void> {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const photo = msg.photo![msg.photo!.length - 1]; // Get the largest photo
  const fileId = photo.file_id;

  try {
    const userState = userStates.get(userId);

    // If user is waiting to upload watermark
    if (userState === "waiting_for_watermark") {
      await setUserWatermark(userId.toString(), fileId);
      userStates.delete(userId);

      const message = `Perfect! ✅ Your watermark has been set.\n\nNow send me any photo and I'll add your watermark to it!`;
      await bot.sendMessage(chatId, message);
      return;
    }

    // If user is changing watermark for a specific photo
    if (userState && userState.startsWith("changing_watermark_")) {
      const photoId = userState.split("_")[2];
      const photoFileId = photoFileIds.get(photoId);

      if (!photoFileId) {
        await bot.sendMessage(
          chatId,
          "Original photo not found. Please try processing a new photo."
        );
        userStates.delete(userId);
        return;
      }

      // Update user's watermark
      await setUserWatermark(userId.toString(), fileId);
      userStates.delete(userId);

      // Get user's updated data
      const user = await getUser(userId.toString());
      if (!user) {
        await bot.sendMessage(
          chatId,
          "User data not found. Please try /start again."
        );
        return;
      }

      // Process the original photo with new watermark
      const watermarkedBuffer = await processImage(
        photoFileId,
        user.watermark_file_id,
        user.watermark_position as WatermarkPositionType,
        bot
      );

      // Create keyboard with both buttons
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "🎨 Customize Position",
              callback_data: `customize_${photoId}`,
            },
            {
              text: "🔄 Change Watermark",
              callback_data: `change_watermark_${photoId}`,
            },
          ],
        ],
      };

      // Send updated photo
      await bot.sendPhoto(chatId, watermarkedBuffer, {
        caption: `Updated! New watermark applied. Position: ${user.watermark_position}`,
        reply_markup: keyboard,
      });

      await bot.sendMessage(chatId, "✅ Watermark updated successfully!");
      return;
    }

    // Check if user has watermark
    const hasUserWatermark = await hasWatermark(userId.toString());

    if (!hasUserWatermark) {
      const message = `You don't have a watermark set yet. Please send me an image to use as your watermark first.`;
      userStates.set(userId, "waiting_for_watermark");
      await bot.sendMessage(chatId, message);
      return;
    }

    // Process the photo with watermark
    const user = await getUser(userId.toString());
    if (!user) {
      await bot.sendMessage(
        chatId,
        "User data not found. Please try /start again."
      );
      return;
    }
    const watermarkedBuffer = await processImage(
      fileId,
      user.watermark_file_id,
      user.watermark_position as WatermarkPositionType,
      bot
    );

    // Create a short identifier for the photo
    const photoId = `p${++photoCounter}`;
    photoFileIds.set(photoId, fileId);

    // Clean up old photo IDs to prevent memory leaks (keep only last 100)
    if (photoFileIds.size > 100) {
      const keysToDelete = Array.from(photoFileIds.keys()).slice(
        0,
        photoFileIds.size - 100
      );
      keysToDelete.forEach((key) => photoFileIds.delete(key));
    }

    // Create inline keyboard for position customization
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "🎨 Customize Position",
            callback_data: `customize_${photoId}`,
          },
          {
            text: "🔄 Change Watermark",
            callback_data: `change_watermark_${photoId}`,
          },
        ],
      ],
    };

    // Send watermarked photo
    await bot.sendPhoto(chatId, watermarkedBuffer, {
      caption: `Here's your photo with watermark! Position: ${user.watermark_position}`,
      reply_markup: keyboard,
    });
  } catch (error) {
    console.error("Error handling photo:", error);
    await bot.sendMessage(
      chatId,
      "Sorry, there was an error processing your photo. Please try again."
    );
  }
}

// Handle callback queries (inline buttons)
async function handleCallbackQuery(
  query: TelegramCallbackQuery
): Promise<void> {
  const userId = query.from.id;
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    if (data.startsWith("customize_")) {
      const photoId = data.split("_")[1];
      const photoFileId = photoFileIds.get(photoId);

      if (!photoFileId) {
        await bot.answerCallbackQuery(query.id, {
          text: "Photo not found. Please try again.",
        });
        return;
      }

      // Store the photo file ID for later use
      userStates.set(userId, `customizing_${photoId}`);

      const keyboard = {
        inline_keyboard: POSITION_OPTIONS.map((row) =>
          row.map((position) => ({
            text: position.replace("-", " ").toUpperCase(),
            callback_data: `position_${position}_${photoId}`,
          }))
        ),
      };

      await bot.editMessageReplyMarkup(keyboard, {
        chat_id: chatId,
        message_id: query.message.message_id,
      });

      try {
        await bot.answerCallbackQuery(query.id, {
          text: "Choose watermark position:",
        });
      } catch (error) {
        console.log(
          "Callback query already answered or timed out, continuing..."
        );
      }
    } else if (data.startsWith("position_")) {
      const [, position, photoId] = data.split("_");
      const photoFileId = photoFileIds.get(photoId);

      if (!photoFileId) {
        try {
          await bot.answerCallbackQuery(query.id, {
            text: "Photo not found. Please try again.",
          });
        } catch (error) {
          console.log(
            "Callback query already answered or timed out, continuing..."
          );
        }
        return;
      }

      // Update user's watermark position
      await updateWatermarkPosition(userId.toString(), position);

      // Get user's watermark
      const user = await getUser(userId.toString());
      if (!user) {
        await bot.answerCallbackQuery(query.id, {
          text: "User data not found. Please try /start again.",
        });
        return;
      }

      // Process photo with new position
      const watermarkedBuffer = await processImage(
        photoFileId,
        user.watermark_file_id,
        position as WatermarkPositionType,
        bot
      );

      // Create new keyboard
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "🎨 Customize Position",
              callback_data: `customize_${photoId}`,
            },
            {
              text: "🔄 Change Watermark",
              callback_data: `change_watermark_${photoId}`,
            },
          ],
        ],
      };

      // Send updated photo
      await bot.sendPhoto(chatId, watermarkedBuffer, {
        caption: `Updated! Watermark position: ${position}`,
        reply_markup: keyboard,
      });

      // Delete the original message
      await bot.deleteMessage(chatId, query.message.message_id);

      userStates.delete(userId);
      await bot.answerCallbackQuery(query.id, { text: "Position updated!" });
    } else if (data.startsWith("change_watermark_")) {
      const photoId = data.split("_")[2];
      const photoFileId = photoFileIds.get(photoId);

      if (!photoFileId) {
        await bot.answerCallbackQuery(query.id, {
          text: "Photo not found. Please try again.",
        });
        return;
      }

      // Store the photo file ID for later use and set state to wait for new watermark
      userStates.set(userId, `changing_watermark_${photoId}`);

      await bot.answerCallbackQuery(query.id, {
        text: "Please send me a new watermark image.",
      });

      await bot.sendMessage(
        chatId,
        "Please send me a new image to use as your watermark (preferably a PNG with transparent background)."
      );
    }
  } catch (error) {
    console.error("Error handling callback query:", error);
    await bot.answerCallbackQuery(query.id, {
      text: "Error occurred. Please try again.",
    });
  }
}

// Handle text messages
async function handleText(msg: TelegramMessage): Promise<void> {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const text = msg.text!;

  if (text === "/start") {
    console.log("Starting bot");
    await handleStart(msg);
  } else {
    const userState = userStates.get(userId);

    if (userState === "waiting_for_watermark") {
      await bot.sendMessage(
        chatId,
        "Please send me an image file to use as your watermark."
      );
    } else if (userState && userState.startsWith("changing_watermark_")) {
      await bot.sendMessage(
        chatId,
        "Please send me an image file to use as your new watermark."
      );
    } else {
      await bot.sendMessage(
        chatId,
        "Send me a photo to add your watermark, or use /start to see your options."
      );
    }
  }
}

// Main message handler
async function handleMessage(msg: TelegramMessage): Promise<void> {
  try {
    if (msg.photo) {
      await handlePhoto(msg);
    } else if (msg.text) {
      await handleText(msg);
    }
  } catch (error) {
    console.error("Error handling message:", error);
    try {
      await bot.sendMessage(
        msg.chat.id,
        "Sorry, something went wrong. Please try again."
      );
    } catch (sendError) {
      console.error("Error sending error message:", sendError);
    }
  }
}

// Webhook handler for serverless deployment
async function handleWebhook(
  body: TelegramWebhookBody
): Promise<{ status: string }> {
  try {
    if (body.message) {
      await handleMessage(body.message);
    } else if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
    }

    return { status: "OK" };
  } catch (error) {
    console.error("Webhook error:", error);
    throw error;
  }
}

export { bot, initializeBot, handleMessage, handleWebhook };
