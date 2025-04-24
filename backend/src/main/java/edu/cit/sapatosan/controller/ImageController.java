package edu.cit.sapatosan.controller;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.StorageClient;
import com.google.firebase.database.DatabaseReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final Storage storage;
    private final DatabaseReference databaseReference;

    public ImageController(Storage storage, DatabaseReference databaseReference) {
        this.storage = storage;
        this.databaseReference = databaseReference;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            String originalFilename = file.getOriginalFilename();
            String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9.\\-_]", "_");
            String uniqueFileName = System.currentTimeMillis() + "_" + safeFilename;
            String storagePath = "product_images/" + uniqueFileName;

            BlobId blobId = BlobId.of(StorageClient.getInstance().bucket().getName(), storagePath);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType(file.getContentType())
                    .build();

            storage.create(blobInfo, file.getInputStream());

            String downloadUrl = "https://firebasestorage.googleapis.com/v0/b/"
                    + URLEncoder.encode(StorageClient.getInstance().bucket().getName(), StandardCharsets.UTF_8)
                    + "/o/"
                    + URLEncoder.encode(storagePath, StandardCharsets.UTF_8).replace("+", "%20")
                    + "?alt=media";

            // Save the image URL to Firebase Realtime Database
            String imageId = databaseReference.child("images").push().getKey();
            if (imageId != null) {
                databaseReference.child("images").child(imageId).setValueAsync(downloadUrl);
            }

            return ResponseEntity.ok(downloadUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image: " + e.getMessage());
        }
    }
}