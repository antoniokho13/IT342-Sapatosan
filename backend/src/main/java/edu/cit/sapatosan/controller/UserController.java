package edu.cit.sapatosan.controller;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
import edu.cit.sapatosan.entity.UserEntity;
import edu.cit.sapatosan.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        try {
            List<UserEntity> users = userService.getAllUsers().get();
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (InterruptedException | ExecutionException e) {
            // Handle the exception appropriately, e.g., log it and return an error response
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserEntity> getUserById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Optional<UserEntity> user = userService.getUserById(id).get();
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // New method to handle POST /api/users
    @PostMapping
    public ResponseEntity<Void> createUser(@RequestBody UserEntity user) {
        String id = UUID.randomUUID().toString(); // Generate a unique ID for the user
        userService.createUser(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}")
    public ResponseEntity<Void> createUserWithId(@PathVariable String id, @RequestBody UserEntity user) {
        userService.createUser(id, user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateUser(@PathVariable String id, @RequestBody UserEntity updatedUser) {
        userService.updateUser(id, updatedUser);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}