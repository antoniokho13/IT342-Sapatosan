package edu.cit.sapatosan.util;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.FileInputStream;
import java.io.IOException;

public class PasswordMigration {
    public static void main(String[] args) {
        try {
            // Initialize Firebase
            FileInputStream serviceAccount = new FileInputStream("src/main/resources/firebase-config.json");
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl("https://sapatosan-73638-default-rtdb.asia-southeast1.firebasedatabase.app/")
                    .build();
            FirebaseApp.initializeApp(options);

            // Migrate passwords
            FirebaseDatabase database = FirebaseDatabase.getInstance();
            DatabaseReference usersRef = database.getReference("users");
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            usersRef.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    for (DataSnapshot userSnapshot : snapshot.getChildren()) {
                        String userId = userSnapshot.getKey();
                        String plainPassword = userSnapshot.child("password").getValue(String.class);

                        if (plainPassword != null && !plainPassword.startsWith("$2a$")) { // Check if not already encoded
                            String encodedPassword = encoder.encode(plainPassword);
                            usersRef.child(userId).child("password").setValueAsync(encodedPassword);
                        }
                    }
                    System.out.println("Password migration completed.");
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    System.err.println("Failed to fetch users: " + error.getMessage());
                }
            });
        } catch (IOException e) {
            System.err.println("Error initializing Firebase: " + e.getMessage());
        }
    }
}