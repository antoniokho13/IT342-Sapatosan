package edu.cit.sapatosan.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Value("${upload.folder}")
    private String uploadFolder;


    // Ensure your Spring Boot application is configured to serve static content
    // from the 'uploads' folder. See step 4 below.
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Ensure the upload folder exists
            Path uploadPath = Paths.get(uploadFolder).toAbsolutePath().normalize(); // Use absolute path and normalize
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save the file locally
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName).normalize(); // Normalize file path

            // Basic security check: Prevent directory traversal
            if (!filePath.startsWith(uploadPath)) {
                throw new IOException("Invalid file path");
            }


            file.transferTo(filePath.toFile());

            // Generate the file URL
            // Assumes your application serves static content from /uploads mapping to the uploadFolder
            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/") // This MUST match your static resource configuration path
                    .path(fileName)
                    .toUriString();

            // Return the file URL
            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            e.printStackTrace(); // Log the error for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // Log other potential errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during file upload: " + e.getMessage());
        }
    }
}