package edu.cit.sapatosan.entity;

public class PaymentEntity {
    private String id;
    private String orderId;
    private Double amount;
    private String description;
    private String link;
    private String status;
    private String linkId; // Add this to store PayMongo link ID

    public PaymentEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLinkId() { return linkId; }
    public void setLinkId(String linkId) { this.linkId = linkId; }
}