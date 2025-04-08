package edu.cit.sapatosan.service;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import edu.cit.sapatosan.entity.TokenBlacklist;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class TokenBlacklistService {

    private final DatabaseReference blacklistRef;

    public TokenBlacklistService(FirebaseInitializer firebaseInitializer) {
        // Ensure FirebaseApp is initialized
        this.blacklistRef = FirebaseDatabase.getInstance().getReference("tokenBlacklist");
    }

    public void addTokenToBlacklist(String token, long expirationTime) {
        TokenBlacklist blacklistEntry = new TokenBlacklist();
        blacklistEntry.setToken(token);
        blacklistEntry.setExpirationDate(new java.util.Date(expirationTime));
        blacklistRef.push().setValueAsync(blacklistEntry);
    }

    public CompletableFuture<Boolean> isTokenBlacklisted(String token) {
        CompletableFuture<Boolean> future = new CompletableFuture<>();
        blacklistRef.orderByChild("token").equalTo(token).addListenerForSingleValueEvent(new com.google.firebase.database.ValueEventListener() {
            @Override
            public void onDataChange(com.google.firebase.database.DataSnapshot snapshot) {
                future.complete(snapshot.exists());
            }

            @Override
            public void onCancelled(com.google.firebase.database.DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }
}