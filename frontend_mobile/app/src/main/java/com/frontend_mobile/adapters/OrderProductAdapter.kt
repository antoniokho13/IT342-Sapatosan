package com.frontend_mobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.frontend_mobile.R
import com.frontend_mobile.models.OrderProductEntity

class OrderProductAdapter(private val products: List<OrderProductEntity>) :
    RecyclerView.Adapter<OrderProductAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val imageView: ImageView = view.findViewById(R.id.ivProductImage)
        val nameTextView: TextView = view.findViewById(R.id.tvProductName)
        val priceTextView: TextView = view.findViewById(R.id.tvProductPrice)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_order_product, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val product = products[position]
        holder.nameTextView.text = product.name
        holder.priceTextView.text = "₱${product.price}"

        Glide.with(holder.imageView.context)
            .load(product.imageUrl)
            .into(holder.imageView)
    }

    override fun getItemCount() = products.size
}