package edu.cit.sapatosan.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.StorageClient;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream; // Import this for reading from a string
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseInitializer {

    // These properties will be read from application.properties or environment variables
    @Value("${firebase.database.url}")
    private String databaseUrl;

    @Value("${firebase.storage.bucket-name}")
    private String storageBucketName;

    // --- ADDED: Define the environment variable name for the service account key ---
    private static final String FIREBASE_ENV_VAR_NAME = "FIREBASE_SERVICE_ACCOUNT_KEY";
    // -----------------------------------------------------------------------------

    @PostConstruct
    public void initialize() {
        try {
            // --- MODIFIED: Attempt to load service account JSON from environment variable ---
            String serviceAccountJson = System.getenv(FIREBASE_ENV_VAR_NAME);

            InputStream serviceAccount;

            if (serviceAccountJson != null && !serviceAccountJson.isEmpty()) {
                // If the environment variable is set, read credentials from its value
                System.out.println("INFO: Loading Firebase credentials from environment variable: " + FIREBASE_ENV_VAR_NAME);
                serviceAccount = new ByteArrayInputStream(serviceAccountJson.getBytes());
            } else {
                // --- Optional Fallback for Local Development ---
                // If the environment variable is NOT set, try loading from resources.
                // This is helpful for running locally without setting the env var.
                // For production deployment, you might prefer to remove this else block
                // to force using the environment variable and fail if it's missing.
                System.out.println("INFO: Environment variable " + FIREBASE_ENV_VAR_NAME + " not set. Attempting to load firebase-config.json from resources.");
                serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-config.json");

                if (serviceAccount == null) {
                    System.err.println("ERROR: Environment variable " + FIREBASE_ENV_VAR_NAME + " is not set and firebase-config.json not found in resources folder.");
                    throw new IllegalStateException("Firebase credentials not provided via environment variable or resources file.");
                }
                // --- End Optional Fallback ---
            }
            // ---------------------------------------------------------------------------------


            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl(databaseUrl)
                    .setStorageBucket(storageBucketName)
                    .build();

            // Initialize FirebaseApp only if it hasn't been initialized yet
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase app initialized successfully.");
            } else {
                System.out.println("Firebase app already initialized.");
            }
        } catch (IOException e) {
            System.err.println("ERROR: Failed to initialize Firebase due to IO issue (reading stream).");
            e.printStackTrace();
            // It's better to throw a specific exception or re-throw to indicate the cause
            throw new IllegalStateException("Failed to initialize Firebase credentials stream", e);
        } catch (Exception e) {
            // Catching a general Exception is broad, consider more specific catches if possible
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

    @Bean
    public Storage firebaseStorage() {
        if (FirebaseApp.getApps().isEmpty()) {
            throw new IllegalStateException("FirebaseApp is not initialized. Cannot get Storage instance.");
        }
        return StorageClient.getInstance().bucket().getStorage();
    }
}