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

    public ProductService() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.productRef = database.getReference("products");
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
                future.complete(Optional.ofNullable(product));
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(new RuntimeException("Firebase operation failed", error.toException()));
            }
        });
        return future;
    }

    public void createProduct(ProductEntity product) {
        if (product.getCategoryId() == null || !isCategoryValid(product.getCategoryId())) {
            throw new IllegalArgumentException("Invalid category ID");
        }
        String id = productRef.push().getKey();
        if (id != null) {
            product.setId(id);
            productRef.child(id).setValueAsync(product);
            updateCategoryProductCount(product.getCategoryId(), 1); // Increment product count
        }
    }

    public void deleteProduct(String id) {
        productRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                ProductEntity product = snapshot.getValue(ProductEntity.class);
                if (product != null && product.getCategoryId() != null) {
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

    public void updateProduct(String id, ProductEntity updatedProduct) {
        productRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                ProductEntity existingProduct = snapshot.getValue(ProductEntity.class);
                if (existingProduct != null) {
                    if (!existingProduct.getCategoryId().equals(updatedProduct.getCategoryId())) {
                        updateCategoryProductCount(existingProduct.getCategoryId(), -1); // Decrement old category count
                        updateCategoryProductCount(updatedProduct.getCategoryId(), 1); // Increment new category count
                    }
                }
                productRef.child(id).setValueAsync(updatedProduct);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Failed to update product: " + error.getMessage());
            }
        });
    }

    private void updateCategoryProductCount(String categoryId, int delta) {
        DatabaseReference categoryRef = FirebaseDatabase.getInstance().getReference("categories").child(categoryId);
        categoryRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                CategoryEntity category = snapshot.getValue(CategoryEntity.class);
                if (category != null) {
                    category.setProducts(category.getProducts() + delta);
                    categoryRef.setValueAsync(category);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.err.println("Failed to update category product count: " + error.getMessage());
            }
        });
    }

    private boolean isCategoryValid(String categoryId) {
        DatabaseReference categoryRef = FirebaseDatabase.getInstance().getReference("categories").child(categoryId);
        CompletableFuture<Boolean> future = new CompletableFuture<>();
        categoryRef.addListenerForSingleValueEvent(new ValueEventListener() {
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
            return future.get();
        } catch (Exception e) {
            return false;
        }
    }
}