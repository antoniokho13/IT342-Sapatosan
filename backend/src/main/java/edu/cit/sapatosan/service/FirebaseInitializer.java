package edu.cit.sapatosan.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Service
public class FirebaseInitializer {

    // Inject the database URL from application.properties
    @Value("${firebase.database.url}")
    private String databaseUrl;

    @PostConstruct
    public void initialize() {
        try {
            // Load the firebase-config.json from the classpath
            InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-config.json");

            if (serviceAccount == null) {
                throw new IllegalStateException("firebase-config.json not found in resources folder. Make sure it's in src/main/resources");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl(databaseUrl) // Set the database URL here
                    .build();

            // Initialize the default app only if it hasn't been initialized yet
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

        } catch (IOException e) {
            throw new IllegalStateException("Failed to initialize Firebase", e);
        }
    }
}