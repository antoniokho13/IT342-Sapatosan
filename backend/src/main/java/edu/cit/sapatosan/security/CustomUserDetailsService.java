package edu.cit.sapatosan.security;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import edu.cit.sapatosan.entity.UserEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.concurrent.CompletableFuture;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final DatabaseReference userRef;

    public CustomUserDetailsService() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.userRef = database.getReference("users");
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        CompletableFuture<UserEntity> future = new CompletableFuture<>();
        userRef.orderByChild("email").equalTo(email).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot child : snapshot.getChildren()) {
                    UserEntity user = child.getValue(UserEntity.class);
                    future.complete(user);
                    return;
                }
                future.completeExceptionally(new UsernameNotFoundException("User not found with email: " + email));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        try {
            UserEntity userEntity = future.get();
            GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + userEntity.getRole());
            return new User(userEntity.getEmail(), userEntity.getPassword(), Collections.singletonList(authority));
        } catch (Exception e) {
            throw new UsernameNotFoundException("User not found with email: " + email, e);
        }
    }
}