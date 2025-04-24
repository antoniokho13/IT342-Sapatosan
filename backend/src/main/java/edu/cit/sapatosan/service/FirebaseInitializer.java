package edu.cit.sapatosan.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.google.cloud.storage.Storage; // Import for Storage Bean (Optional)
import com.google.firebase.cloud.StorageClient; // Import for StorageClient (Optional)


import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseInitializer {

    @Value("${firebase.database.url}")
    private String databaseUrl;

    // --- ADDED: Inject the Firebase Storage Bucket Name from application.properties ---
    @Value("${firebase.storage.bucket-name}") // This will now read from application.properties
    private String storageBucketName;
    // ---------------------------------------------------------------------------------


    @PostConstruct
    public void initialize() {
        try {
            // Load service account file from resources folder
            InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-config.json");

            if (serviceAccount == null) {
                System.err.println("ERROR: firebase-config.json not found in resources folder.");
                throw new IllegalStateException("firebase-config.json not found in resources folder.");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl(databaseUrl)
                    // --- ADDED: Set the Storage Bucket Name ---
                    // This tells the Firebase Admin SDK which storage bucket to use by default
                    .setStorageBucket(storageBucketName)
                    // ------------------------------------------
                    .build();

            // Initialize FirebaseApp only if it hasn't been initialized yet
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase app initialized successfully."); // Added success log
            } else {
                // If already initialized, you might want to check if the storage bucket is set
                // or just log that it's already done.
                System.out.println("Firebase app already initialized."); // Log if already initialized
                // Optional: Verify storage bucket is set if needed
                // if (FirebaseApp.getInstance().getOptions().getStorageBucket() == null) {
                //     System.err.println("Warning: Firebase app was already initialized but storage bucket is not set.");
                // }
            }
        } catch (IOException e) {
            System.err.println("ERROR: Failed to initialize Firebase due to file/IO issue.");
            e.printStackTrace();
            throw new IllegalStateException("Failed to initialize Firebase", e);
        } catch (Exception e) {
            System.err.println("ERROR: An unexpected error occurred during Firebase initialization.");
            e.printStackTrace();
            throw new IllegalStateException("Failed to initialize Firebase unexpectedly", e);
        }
    }

    @Bean
    public DatabaseReference firebaseDatabase() {
        // Ensure FirebaseApp is initialized before getting the database instance
        if (FirebaseApp.getApps().isEmpty()) {
            throw new IllegalStateException("FirebaseApp is not initialized. Cannot get DatabaseReference.");
        }
        return FirebaseDatabase.getInstance().getReference();
    }

    // --- Optional: Add a Bean for Firebase Storage if you need to inject it elsewhere ---
    // This allows you to @Autowired the Storage object directly into other classes
    @Bean
    public Storage firebaseStorage() {
        if (FirebaseApp.getApps().isEmpty()) {
            throw new IllegalStateException("FirebaseApp is not initialized. Cannot get Storage instance.");
        }
        // Get the Storage instance from the default bucket associated with the initialized app
        return StorageClient.getInstance().bucket().getStorage();
    }
    // ------------------------------------------------------------------------------------
}
