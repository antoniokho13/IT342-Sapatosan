package edu.cit.sapatosan.service;

import edu.cit.sapatosan.entity.CartEntity;
import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.repository.CartRepository;
import edu.cit.sapatosan.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;

    public CartService(CartRepository cartRepository, OrderRepository orderRepository) {
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
    }

    public List<CartEntity> getAllCarts() {
        return cartRepository.findAll();
    }

    public Optional<CartEntity> getCartById(Long id) {
        return cartRepository.findById(id);
    }

    public CartEntity createCart(CartEntity cart) {
        return cartRepository.save(cart);
    }

    public Optional<CartEntity> updateCart(Long id, CartEntity updatedCart) {
        return cartRepository.findById(id).map(cart -> {
            cart.setUserId(updatedCart.getUserId());
            cart.setProductId(updatedCart.getProductId());
            cart.setStatus(updatedCart.getStatus());
            cart.setQuantity(updatedCart.getQuantity());
            cart.setPrice(updatedCart.getPrice());
            return cartRepository.save(cart);
        });
    }

    public void deleteCart(Long id) {
        cartRepository.deleteById(id);
    }

    public CartEntity addProductToCart(Long userId, Long productId, Integer quantity, Double price) {
        CartEntity cart = new CartEntity();
        cart.setUserId(userId);
        cart.setProductId(productId);
        cart.setStatus("PENDING");
        cart.setQuantity(quantity);
        cart.setPrice(price);
        return cartRepository.save(cart);
    }

    public List<CartEntity> getCartContents(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    public void removeProductFromCart(Long userId, Long productId) {
        cartRepository.deleteByUserIdAndProductId(userId, productId);
    }

    public OrderEntity checkoutCart(Long userId) {
        List<CartEntity> cartContents = cartRepository.findByUserId(userId);
        double totalAmount = cartContents.stream().mapToDouble(cart -> cart.getPrice() * cart.getQuantity()).sum();
        OrderEntity order = new OrderEntity();
        order.setUserId(userId);
        order.setTotalAmount(totalAmount);
        order.setStatus("COMPLETED");
        order.setQuantity(cartContents.size());
        order.setPrice(totalAmount);
        orderRepository.save(order);
        cartRepository.deleteAll(cartContents);
        return order;
    }
}