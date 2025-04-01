package edu.cit.sapatosan.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cart_products")
public class CartProductEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private CartEntity cart;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Column(nullable = false)
    private Integer quantity;

    // Getters and Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public CartEntity getCart() {
        return cart;
    }
    public void setCart(CartEntity cart) {
        this.cart = cart;
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
    @Override
    public String toString() {
        return "CartProductEntity{" +
                "id=" + id +
                ", cart=" + cart +
                ", product=" + product +
                ", quantity=" + quantity +
                '}';
    }
    // Override equals and hashCode if necessary
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CartProductEntity)) return false;
        CartProductEntity that = (CartProductEntity) o;
        return id != null && id.equals(that.id);
    }
    @Override
    public int hashCode() {
        return 31;
    }
    // You can also add a constructor if needed
    public CartProductEntity() {
    }
    public CartProductEntity(CartEntity cart, ProductEntity product, Integer quantity) {
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
    }
}