package edu.cit.sapatosan.entity;

import java.util.Map;

public class CartEntity {
    private String id;
    private String userId; // Reference to User
    private Map<String, Integer> cartProductIds; // <ProductId, Quantity>
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

    public Map<String, Integer> getCartProductIds() {
        return cartProductIds;
    }

    public void setCartProductIds(Map<String, Integer> cartProductIds) {
        this.cartProductIds = cartProductIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}