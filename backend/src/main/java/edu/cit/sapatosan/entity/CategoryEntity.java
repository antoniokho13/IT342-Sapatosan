package edu.cit.sapatosan.entity;

public class CategoryEntity {
    private String id;
    private String name;
    private String description;
    private int products; // Number of products in the category
    private boolean isFeatured; // Whether the category is featured

    public CategoryEntity() {
        // Default constructor for Firebase
    }

    public CategoryEntity(String id, String name, String description, int products, boolean isFeatured) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.products = products;
        this.isFeatured = isFeatured;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getProducts() {
        return products;
    }

    public void setProducts(int products) {
        this.products = products;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }
}