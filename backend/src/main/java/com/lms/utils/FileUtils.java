package com.lms.utils;

import org.springframework.http.MediaType;

/**
 * Shared utility for detecting file type from magic bytes.
 * Place in: src/main/java/com/lms/utils/FileUtils.java
 */
public class FileUtils {

    public static MediaType detectMediaType(byte[] data) {
        if (data == null || data.length < 4) return MediaType.APPLICATION_OCTET_STREAM;
        // PDF: %PDF
        if (data[0] == 0x25 && data[1] == 0x50 && data[2] == 0x44 && data[3] == 0x46)
            return MediaType.APPLICATION_PDF;
        // PNG: 89 50 4E 47
        if ((data[0] & 0xFF) == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47)
            return MediaType.IMAGE_PNG;
        // JPG: FF D8 FF
        if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8 && (data[2] & 0xFF) == 0xFF)
            return MediaType.IMAGE_JPEG;
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    public static String extensionFor(MediaType type) {
        if (MediaType.APPLICATION_PDF.equals(type))  return ".pdf";
        if (MediaType.IMAGE_PNG.equals(type))        return ".png";
        if (MediaType.IMAGE_JPEG.equals(type))       return ".jpg";
        return ".bin";
    }

    public static String inlineDisposition(String baseName, MediaType type) {
        return "inline; filename=\"" + baseName + extensionFor(type) + "\"";
    }

    public static String attachmentDisposition(String baseName, MediaType type) {
        return "attachment; filename=\"" + baseName + extensionFor(type) + "\"";
    }

    private FileUtils() {}
}