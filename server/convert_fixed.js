const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Verify FFmpeg is available
if (!ffmpegPath) {
    throw new Error('FFmpeg not found. Please install ffmpeg-static package.');
}
ffmpeg.setFfmpegPath(ffmpegPath);

async function compressVideo(inputBuffer, outputPath) {
    // Basic validation - check minimum file size (10KB) and magic numbers for MP4
    if (inputBuffer.length < 10240 || 
        !inputBuffer.slice(4, 8).equals(Buffer.from('ftyp'))) {
        throw new Error('Invalid video file format');
    }

    const tempPath = path.join('/tmp', `temp_${Date.now()}.mp4`);
    
    try {
        console.log(`Starting compression - Input size: ${inputBuffer.length} bytes`);
        
        // Write buffer to temp file
        await fs.promises.writeFile(tempPath, inputBuffer);
        
        return new Promise((resolve, reject) => {
            ffmpeg(tempPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    '-crf 23',
                    '-preset fast',
                    '-movflags +faststart'
                ])
                .on('start', (cmd) => console.log('FFmpeg command:', cmd))
                .on('progress', (progress) => console.log('Progress:', progress.timemark))
                .on('end', () => {
                    console.log('Compression successful');
                    fs.unlink(tempPath, () => resolve(outputPath));
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    fs.unlink(tempPath, () => reject(err));
                })
                .save(outputPath);
        });
    } catch (err) {
        console.error('Compression failed:', err);
        try { fs.unlinkSync(tempPath); } catch {}
        throw err;
    }
}

module.exports = { compressVideo };