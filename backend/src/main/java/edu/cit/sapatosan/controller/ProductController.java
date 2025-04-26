package edu.cit.sapatosan.controller;

import edu.cit.sapatosan.entity.ProductEntity;
import edu.cit.sapatosan.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductEntity>> getAllProducts() throws ExecutionException, InterruptedException {
        List<ProductEntity> products = productService.getAllProducts().get();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductEntity> getProductById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Optional<ProductEntity> product = productService.getProductById(id).get();
        return product.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // MODIFIED: Removed @RequestParam String imageUrl
    @PostMapping
    public ResponseEntity<Void> createProduct(@RequestBody ProductEntity product) {
        productService.createProduct(product); // Pass the complete product object
        return ResponseEntity.ok().build();
    }

    // MODIFIED: Removed @RequestParam String imageUrl
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateProduct(@PathVariable String id, @RequestBody ProductEntity updatedProduct) {
        productService.updateProduct(id, updatedProduct); // Pass the complete updated product object
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductEntity>> getProductsByCategory(@PathVariable String categoryId) throws ExecutionException, InterruptedException {
        List<ProductEntity> products = productService.getProductsByCategory(categoryId).get();
        return ResponseEntity.ok(products);
    }
}