package edu.cit.sapatosan.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "order_products")
public class OrderProductEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double price;

    // Getters and Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public OrderEntity getOrder() {
        return order;
    }
    public void setOrder(OrderEntity order) {
        this.order = order;
    }
    public ProductEntity getProduct() {
        return product;
    }
    public void setProduct(ProductEntity product) {
        this.product = product;
    }
    public Integer getQuantity() {
        return quantity;
    }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    public Double getPrice() {
        return price;
    }
    public void setPrice(Double price) {
        this.price = price;
    }
    @Override
    public String toString() {
        return "OrderProductEntity{" +
                "id=" + id +
                ", order=" + order +
                ", product=" + product +
                ", quantity=" + quantity +
                ", price=" + price +
                '}';
    }
    // Override equals and hashCode if necessary
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderProductEntity)) return false;
        OrderProductEntity that = (OrderProductEntity) o;
        return id != null && id.equals(that.id);
    }
    @Override
    public int hashCode() {
        return 31;
    }
    // Additional methods can be added as needed
    // For example, a method to calculate the total price for this order product
    public Double getTotalPrice() {
        return this.price * this.quantity;
    }
    // You can also add a method to display the order product details
    public String displayOrderProductDetails() {
        return "OrderProductEntity{" +
                "id=" + id +
                ", order=" + order.getId() +
                ", product=" + product.getId() +
                ", quantity=" + quantity +
                ", price=" + price +
                ", totalPrice=" + getTotalPrice() +
                '}';
    }
    // You can also add a method to update the quantity and price
    public void updateOrderProduct(Integer newQuantity, Double newPrice) {
        this.quantity = newQuantity;
        this.price = newPrice;
    }
    // You can also add a method to check if the order product is valid
    public boolean isValid() {
        return this.order != null && this.product != null && this.quantity > 0 && this.price > 0;
    }
}