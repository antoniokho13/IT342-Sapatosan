// CartService.java
package edu.cit.sapatosan.service;

import edu.cit.sapatosan.entity.*;
import edu.cit.sapatosan.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final CartProductRepository cartProductRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, CartProductRepository cartProductRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartProductRepository = cartProductRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public CartEntity getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    public CartEntity createCartForUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartEntity cart = new CartEntity();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    public CartProductEntity addProductToCart(Long userId, Long productId, Integer quantity) {
        CartEntity cart = cartRepository.findByUserId(userId);
        if (cart == null) {
            cart = createCartForUser(userId);
        }
        ProductEntity product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Not enough stock available");
        }

        CartProductEntity cartProduct = cartProductRepository.findByCartIdAndProductId(cart.getId(), productId);
        if (cartProduct == null) {
            cartProduct = new CartProductEntity();
            cartProduct.setCart(cart);
            cartProduct.setProduct(product);
            cartProduct.setQuantity(quantity);
        } else {
            if (product.getStock() < cartProduct.getQuantity() + quantity) {
                throw new RuntimeException("Not enough stock available");
            }
            cartProduct.setQuantity(cartProduct.getQuantity() + quantity);
        }

        return cartProductRepository.save(cartProduct);
    }

    public CartProductEntity updateProductQuantityInCart(Long userId, Long productId, Integer quantity) {
        CartEntity cart = cartRepository.findByUserId(userId);
        CartProductEntity cartProduct = cartProductRepository.findByCartIdAndProductId(cart.getId(), productId);
        if (cartProduct == null) {
            throw new RuntimeException("Product not found in cart");
        }
        cartProduct.setQuantity(quantity);
        return cartProductRepository.save(cartProduct);
    }

    public void removeProductFromCart(Long userId, Long productId) {
        CartEntity cart = cartRepository.findByUserId(userId);
        if (cart != null) {
            cartProductRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        }
    }

    public void clearCart(Long userId) {
        CartEntity cart = cartRepository.findByUserId(userId);
        cartProductRepository.deleteAll(cart.getCartProducts());
    }
}