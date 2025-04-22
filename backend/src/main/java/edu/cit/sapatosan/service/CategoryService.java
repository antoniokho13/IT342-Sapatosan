package edu.cit.sapatosan.service;

import com.google.firebase.database.*;
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
                        category.setId(child.getKey());
                        // Calculate product count
                        DatabaseReference productRef = FirebaseDatabase.getInstance().getReference("products");
                        productRef.orderByChild("categoryId").equalTo(category.getId())
                                .addListenerForSingleValueEvent(new ValueEventListener() {
                                    @Override
                                    public void onDataChange(DataSnapshot productSnapshot) {
                                        category.setProducts((int) productSnapshot.getChildrenCount());
                                        categories.add(category);
                                        if (categories.size() == snapshot.getChildrenCount()) {
                                            future.complete(categories);
                                        }
                                    }

                                    @Override
                                    public void onCancelled(DatabaseError error) {
                                        future.completeExceptionally(new RuntimeException("Failed to fetch product count", error.toException()));
                                    }
                                });
                    }
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(new RuntimeException("Firebase operation failed", error.toException()));
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
                if (category != null) {
                    category.setId(snapshot.getKey());
                }
                future.complete(Optional.ofNullable(category));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(new RuntimeException("Firebase operation failed", error.toException()));
            }
        });
        return future;
    }

    public void createCategory(CategoryEntity category) {
        if (category.getName() == null || category.getName().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be null or empty");
        }
        String id = categoryRef.push().getKey();
        if (id != null) {
            category.setId(id);
            categoryRef.child(id).setValueAsync(category);
        }
    }

    public void updateCategory(String id, CategoryEntity updatedCategory) {
        if (updatedCategory.getName() == null || updatedCategory.getName().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be null or empty");
        }
        categoryRef.child(id).setValueAsync(updatedCategory);
    }

    public void deleteCategory(String id) {
        categoryRef.child(id).removeValueAsync();
    }
}