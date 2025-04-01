// OrderService.java
package edu.cit.sapatosan.service;

import edu.cit.sapatosan.entity.*;
import edu.cit.sapatosan.repository.*;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartProductRepository cartProductRepository;
    private final OrderProductRepository orderProductRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, CartRepository cartRepository, CartProductRepository cartProductRepository, OrderProductRepository orderProductRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartProductRepository = cartProductRepository;
        this.orderProductRepository = orderProductRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<OrderEntity> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Optional<OrderEntity> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public OrderEntity createOrderFromCart(Long userId) {
        CartEntity cart = cartRepository.findByUserId(userId);
        if (cart == null || cart.getCartProducts().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        List<CartProductEntity> cartProducts = cart.getCartProducts();

        for (CartProductEntity cp : cartProducts) {
            ProductEntity product = cp.getProduct();
            if (product.getStock() < cp.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }
        }

        OrderEntity order = new OrderEntity();
        order.setUser(cart.getUser());
        order.setOrderDate(new Date());
        order.setStatus("COMPLETED");
        order.setTotalAmount(cartProducts.stream().mapToDouble(cp -> cp.getProduct().getPrice() * cp.getQuantity()).sum());

        order = orderRepository.save(order);

        for (CartProductEntity cartProduct : cartProducts) {
            ProductEntity product = cartProduct.getProduct();
            product.setStock(product.getStock() - cartProduct.getQuantity());
            productRepository.save(product);

            OrderProductEntity orderProduct = new OrderProductEntity();
            orderProduct.setOrder(order);
            orderProduct.setProduct(product);
            orderProduct.setQuantity(cartProduct.getQuantity());
            orderProduct.setPrice(product.getPrice());
            orderProductRepository.save(orderProduct);
        }

        cartProductRepository.deleteAll(cartProducts);
        cartRepository.save(cart);

        return order;
    }

    public OrderEntity createDirectOrder(Long userId, Long productId, Integer quantity) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        OrderEntity order = new OrderEntity();
        UserEntity user = new UserEntity();
        user.setId(userId);
        order.setUser(user);
        order.setOrderDate(new Date());
        order.setStatus("COMPLETED");
        order.setTotalAmount(product.getPrice() * quantity);

        order = orderRepository.save(order);

        OrderProductEntity orderProduct = new OrderProductEntity();
        orderProduct.setOrder(order);
        orderProduct.setProduct(product);
        orderProduct.setQuantity(quantity);
        orderProduct.setPrice(product.getPrice());
        orderProductRepository.save(orderProduct);

        return order;
    }
}