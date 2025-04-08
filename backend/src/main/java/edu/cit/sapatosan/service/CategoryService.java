package edu.cit.sapatosan.service;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
import edu.cit.sapatosan.entity.CategoryEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class CategoryService {
    private final DatabaseReference categoryRef;

    public CategoryService() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.categoryRef = database.getReference("categories");
    }

    public CompletableFuture<List<CategoryEntity>> getAllCategories() {
        CompletableFuture<List<CategoryEntity>> future = new CompletableFuture<>();
        categoryRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<CategoryEntity> categories = new ArrayList<>();
                for (DataSnapshot child : snapshot.getChildren()) {
                    CategoryEntity category = child.getValue(CategoryEntity.class);
                    if (category != null) {
                        category.setId(child.getKey()); // Set the id field using the key
                        categories.add(category);
                    }
                }
                future.complete(categories);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    public CompletableFuture<Optional<CategoryEntity>> getCategoryById(String id) {
        CompletableFuture<Optional<CategoryEntity>> future = new CompletableFuture<>();
        categoryRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                CategoryEntity category = snapshot.getValue(CategoryEntity.class);
                future.complete(Optional.ofNullable(category));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    public void createCategory(CategoryEntity category) {
        String id = categoryRef.push().getKey(); // Generate a unique key
        if (id != null) {
            category.setId(id); // Set the generated key as the category ID
            categoryRef.child(id).setValueAsync(category); // Save the category under the generated key
        }
    }

    public void updateCategory(String id, CategoryEntity updatedCategory) {
        categoryRef.child(id).setValueAsync(updatedCategory);
    }

    public void deleteCategory(String id) {
        categoryRef.child(id).removeValueAsync();
    }
}