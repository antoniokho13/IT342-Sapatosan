package edu.cit.sapatosan.service;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import edu.cit.sapatosan.entity.UserEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class UserService {
    private final DatabaseReference userRef;
    private final PasswordEncoder passwordEncoder;

    public UserService(PasswordEncoder passwordEncoder) {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.userRef = database.getReference("users");
        this.passwordEncoder = passwordEncoder;
    }

    public CompletableFuture<List<UserEntity>> getAllUsers() {
        CompletableFuture<List<UserEntity>> future = new CompletableFuture<>();
        userRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<UserEntity> users = new ArrayList<>();
                for (DataSnapshot child : snapshot.getChildren()) {
                    UserEntity user = child.getValue(UserEntity.class);
                    // Set the id using the key of the child snapshot
                    user.setId(child.getKey());
                    users.add(user);
                }
                future.complete(users);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    public CompletableFuture<Optional<UserEntity>> getUserById(String id) {
        CompletableFuture<Optional<UserEntity>> future = new CompletableFuture<>();
        userRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                UserEntity user = snapshot.getValue(UserEntity.class);
                if (user != null) {
                    user.setId(snapshot.getKey()); // Set the id here as well
                }
                future.complete(Optional.ofNullable(user));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    public CompletableFuture<Void> saveUserToDatabase(String id, UserEntity user) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        userRef.child(id).setValue(user, (error, ref) -> {
            if (error != null) {
                future.completeExceptionally(error.toException());
            } else {
                future.complete(null);
            }
        });
        return future;
    }

    public void createUser(String id, UserEntity user) {
        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Save the user to the database
        saveUserToDatabase(id, user);
    }

    public void updateUser(String id, UserEntity updatedUser) {
        // Check if the password is not already hashed
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().startsWith("{bcrypt}")) {
            updatedUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        userRef.child(id).setValueAsync(updatedUser);
    }
    public void deleteUser(String id) {
        userRef.child(id).removeValueAsync();
    }
}