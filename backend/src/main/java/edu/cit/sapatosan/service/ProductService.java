package edu.cit.sapatosan.service;

import com.google.firebase.database.*;
import edu.cit.sapatosan.entity.CategoryEntity;
import edu.cit.sapatosan.entity.ProductEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class ProductService {
    private final DatabaseReference productRef;
    private final DatabaseReference categoryRef; // Added reference for categories

    public ProductService() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.productRef = database.getReference("products");
        this.categoryRef = database.getReference("categories"); // Initialize category ref
    }

    public CompletableFuture<List<ProductEntity>> getAllProducts() {
        CompletableFuture<List<ProductEntity>> future = new CompletableFuture<>();
        productRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<ProductEntity> products = new ArrayList<>();
                for (DataSnapshot child : snapshot.getChildren()) {
                    ProductEntity product = child.getValue(ProductEntity.class);
                    if (product != null) {
                        product.setId(child.getKey());
                        products.add(product);
                    }
                }
                future.complete(products);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(new RuntimeException("Firebase operation failed", error.toException()));
            }
        });
        return future;
    }

    public CompletableFuture<Optional<ProductEntity>> getProductById(String id) {
        CompletableFuture<Optional<ProductEntity>> future = new CompletableFuture<>();
        productRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                ProductEntity product = snapshot.getValue(ProductEntity.class);
                // You might want to set the ID here as well if it's not automatically populated
                if (product != null) {
                    product.setId(snapshot.getKey());
                }
                future.complete(Optional.ofNullable(product));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(new RuntimeException("Firebase operation failed", error.toException()));
            }
        });
        return future;
    }

    public void deleteProduct(String id) {
        productRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                ProductEntity product = snapshot.getValue(ProductEntity.class);
                if (product != null && product.getCategoryId() != null) {
                    // NOTE: Asynchronous updates might lead to race conditions on the count
                    updateCategoryProductCount(product.getCategoryId(), -1);
                }
                productRef.child(id).removeValueAsync();
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Failed to delete product: " + error.getMessage());
            }
        });
    }

    // MODIFIED: Removed imageUrl parameter
    public void createProduct(ProductEntity product) {
        // NOTE: The isCategoryValid method uses a blocking .get().
        // This should ideally be refactored for better performance/scalability
        // in a real-world async application.
        if (product.getCategoryId() == null || !isCategoryValid(product.getCategoryId())) {
            throw new IllegalArgumentException("Invalid category ID");
        }
        String id = productRef.push().getKey();
        if (id != null) {
            product.setId(id);
            // The imageUrl is expected to be set on the product object
            productRef.child(id).setValueAsync(product);
            // NOTE: Asynchronous updates might lead to race conditions on the count
            updateCategoryProductCount(product.getCategoryId(), 1); // Increment product count
        }
    }

    // MODIFIED: Removed imageUrl parameter
    public void updateProduct(String id, ProductEntity updatedProduct) {
        // Ensure the ID is set on the updated product object
        updatedProduct.setId(id);

        productRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                ProductEntity existingProduct = snapshot.getValue(ProductEntity.class);
                if (existingProduct != null) {
                    if (!existingProduct.getCategoryId().equals(updatedProduct.getCategoryId())) {
                        // NOTE: Asynchronous updates might lead to race conditions on the count
                        updateCategoryProductCount(existingProduct.getCategoryId(), -1); // Decrement old category count
                        updateCategoryProductCount(updatedProduct.getCategoryId(), 1); // Increment new category count
                    }
                }
                // The imageUrl is expected to be set on the updatedProduct object
                productRef.child(id).setValueAsync(updatedProduct);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Failed to update product: " + error.getMessage());
            }
        });
    }

    private void updateCategoryProductCount(String categoryId, int delta) {
        // Use the initialized categoryRef
        DatabaseReference categoryItemRef = categoryRef.child(categoryId);
        categoryItemRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                CategoryEntity category = snapshot.getValue(CategoryEntity.class);
                if (category != null) {
                    category.setProducts(category.getProducts() + delta);
                    categoryItemRef.setValueAsync(category);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Failed to update category product count: " + error.getMessage());
            }
        });
    }

    private boolean isCategoryValid(String categoryId) {
        // Use the initialized categoryRef
        DatabaseReference categoryItemRef = categoryRef.child(categoryId);
        CompletableFuture<Boolean> future = new CompletableFuture<>();
        categoryItemRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                future.complete(snapshot.exists());
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        try {
            // This is a blocking call and can impact performance.
            // Consider refactoring to use asynchronous methods throughout the service.
            return future.get();
        } catch (Exception e) {
            System.err.println("Error checking category validity: " + e.getMessage());
            return false;
        }
    }
    public CompletableFuture<List<ProductEntity>> getProductsByCategory(String categoryId) {
        CompletableFuture<List<ProductEntity>> future = new CompletableFuture<>();
        productRef.orderByChild("categoryId").equalTo(categoryId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<ProductEntity> products = new ArrayList<>();
                for (DataSnapshot child : snapshot.getChildren()) {
                    ProductEntity product = child.getValue(ProductEntity.class);
                    if (product != null) {
                        product.setId(child.getKey());
                        products.add(product);
                    }
                }
                future.complete(products);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(new RuntimeException("Firebase operation failed", error.toException()));
            }
        });
        return future;
    }
}