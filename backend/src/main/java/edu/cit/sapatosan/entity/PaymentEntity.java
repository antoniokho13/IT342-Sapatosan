package edu.cit.sapatosan.entity;

public class PaymentEntity {
    private String id; // Unique ID for the payment
    private String orderId; // Reference to the Order
    private Double amount; // Total amount from the order
    private String description; // Payment description
    private String link; // Payment link (checkout_url from PayMongo)
    private String status; // Payment status (e.g., pending, completed, failed)

    public PaymentEntity() {
        // Default constructor for Firebase
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }
}