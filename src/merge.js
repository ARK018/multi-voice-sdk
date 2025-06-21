import fs from "fs/promises";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Merge multiple audio files into a single high-quality file
 * @param {Object} options - Merge configuration options
 * @param {string[]} options.inputFiles - Array of input file paths to merge
 * @param {string} options.outputFile - Output file path for the merged audio
 * @returns {Promise<void>} Promise that resolves when merging is complete
 */
export async function merge({ inputFiles, outputFile }) {
  if (!inputFiles || !Array.isArray(inputFiles) || inputFiles.length === 0) {
    throw new Error("inputFiles must be a non-empty array of file paths.");
  }

  if (!outputFile) {
    throw new Error("outputFile parameter is required.");
  }

  for (const file of inputFiles) {
    try {
      await fs.access(file);
    } catch (error) {
      throw new Error(`Input file not found: ${file}`);
    }
  }

  console.log(
    `🔄 Merging ${inputFiles.length} audio files with high-quality processing...`
  );
  console.log(`📁 Input files: ${inputFiles.join(", ")}`);
  console.log(`📤 Output file: ${outputFile}`);
  console.log(`🎚️ Quality: 48kHz, 320kbps, Professional Grade`);

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    inputFiles.forEach((file) => {
      command = command.input(file);
    }); // Simple high-quality approach with basic concat
    command
      .complexFilter([
        {
          filter: "concat",
          options: {
            n: inputFiles.length,
            v: 0,
            a: 1,
          },
          outputs: "concat_out",
        },
        {
          filter: "loudnorm",
          inputs: "concat_out",
          outputs: "out",
        },
      ])
      .outputOptions([
        "-map",
        "[out]",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "320k",
        "-ar",
        "48000",
        "-q:a",
        "0", // Highest quality VBR
      ])
      .output(outputFile)
      .on("start", () => {
        console.log("🎵 High-quality merging started...");
      })
      .on("progress", (progress) => {
        if (progress.percent) {
          console.log(`📊 Processing: ${Math.round(progress.percent)}%`);
        }
      })
      .on("end", () => {
        console.log(`✅ High-quality audio merge completed: ${outputFile}`);
        console.log(`🎯 Professional quality: 48kHz, 320kbps`);
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg error:", err.message);
        reject(new Error(`Failed to merge audio files: ${err.message}`));
      })
      .run();
  });
}
