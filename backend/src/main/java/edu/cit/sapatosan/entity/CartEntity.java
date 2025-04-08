package edu.cit.sapatosan.entity;

import java.util.List;

public class CartEntity {
    private String id;
    private String userId; // Reference to User
    private List<String> cartProductIds; // References to CartProductEntity
    private String status;

    public CartEntity() {
        // Default constructor for Firebase
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<String> getCartProductIds() {
        return cartProductIds;
    }

    public void setCartProductIds(List<String> cartProductIds) {
        this.cartProductIds = cartProductIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}