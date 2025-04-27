package com.frontend_mobile.models

object CartManager {
    private val cartItems: MutableList<CartItem> = mutableListOf()

    fun addItem(cartItem: CartItem) {
        cartItems.add(cartItem)
    }

    fun removeItem(cartItem: CartItem) {
        cartItems.remove(cartItem)
    }

    fun getCartItems(): List<CartItem> = cartItems.toList()

    fun clearCart() {
        cartItems.clear()
    }
}