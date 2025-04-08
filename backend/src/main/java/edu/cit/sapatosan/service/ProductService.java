package edu.cit.sapatosan.service;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
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
                        product.setId(child.getKey()); // Set the id field using the key
                        products.add(product);
                    }
                }
                future.complete(products);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
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
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    public void createProduct(ProductEntity product) {
        String id = productRef.push().getKey(); // Generate a unique key for the product
        if (id != null) {
            product.setId(id); // Set the generated key as the product ID
            productRef.child(id).setValueAsync(product); // Save the product under the generated key

            // Update the products count in the corresponding category
            if (product.getCategoryId() != null) {
                DatabaseReference categoryRef = FirebaseDatabase.getInstance().getReference("categories").child(product.getCategoryId());
                categoryRef.addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        CategoryEntity category = snapshot.getValue(CategoryEntity.class);
                        if (category != null) {
                            int currentProducts = category.getProducts();
                            category.setProducts(currentProducts + 1); // Increment the products count
                            categoryRef.setValueAsync(category); // Update the category in the database
                        }
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {
                        System.err.println("Failed to update category products count: " + error.getMessage());
                    }
                });
            }
        }
    }

    public void updateProduct(String id, ProductEntity updatedProduct) {
        productRef.child(id).setValueAsync(updatedProduct);
    }

    public void deleteProduct(String id) {
        productRef.child(id).removeValueAsync();
    }
}