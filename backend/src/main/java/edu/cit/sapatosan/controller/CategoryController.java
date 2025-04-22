package edu.cit.sapatosan.controller;

import edu.cit.sapatosan.entity.CategoryEntity;
import edu.cit.sapatosan.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryEntity>> getAllCategories() {
        try {
            List<CategoryEntity> categories = categoryService.getAllCategories().get();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryEntity> getCategoryById(@PathVariable String id) throws ExecutionException, InterruptedException {
        // Fetch a single category by ID with its product count
        Optional<CategoryEntity> category = categoryService.getCategoryById(id).get();
        return category.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Void> createCategory(@RequestBody CategoryEntity category) {
        try {
            categoryService.createCategory(category);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateCategory(@PathVariable String id, @RequestBody CategoryEntity updatedCategory) {
        // Update an existing category
        categoryService.updateCategory(id, updatedCategory);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        // Delete a category
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}