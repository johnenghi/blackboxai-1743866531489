const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

async function compressVideo(videoBuffer, outputPath) {
    try {
        console.log('Starting video compression - Buffer size:', videoBuffer.length, 'bytes');
        
        // Write buffer to temp file for FFmpeg processing
        const tempPath = path.join('/tmp', `temp_${Date.now()}.mp4`);
        fs.writeFileSync(tempPath, videoBuffer);

        return new Promise((resolve, reject) => {
            ffmpeg(tempPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    '-crf 23', // Quality (lower = better)
                    '-preset medium', // Speed/quality tradeoff
                    '-movflags +faststart' // For web streaming
                ])
                .on('start', (command) => {
                    console.log('FFmpeg command:', command);
                })
                .on('progress', (progress) => {
                    console.log(`Processing: ${progress.timemark}`);
                })
                .on('end', () => {
                    console.log('Compression completed successfully');
                    fs.unlinkSync(tempPath); // Clean up temp file
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error('Compression error:', err);
                    fs.unlinkSync(tempPath); // Clean up temp file
                    reject(err);
                })
                .save(outputPath);
        });
    } catch (error) {
        console.error('Video compression error:', error);
        throw error;
    }
}

module.exports = { compressVideo };
