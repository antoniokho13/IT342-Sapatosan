package edu.cit.sapatosan.entity;

import java.util.Date;
import java.util.List;

public class OrderEntity {
    private String id;
    private String userId; // Reference to User
    private Date orderDate;
    private Double totalAmount;
    private String status;
    private List<String> orderProductIds; // References to OrderProductEntity

    public OrderEntity() {
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

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getOrderProductIds() {
        return orderProductIds;
    }

    public void setOrderProductIds(List<String> orderProductIds) {
        this.orderProductIds = orderProductIds;
    }
}