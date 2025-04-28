package edu.cit.sapatosan.service;

import com.google.firebase.database.*;
import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.entity.OrderProductEntity;
import edu.cit.sapatosan.entity.PaymentEntity;
import edu.cit.sapatosan.entity.ProductEntity;
import okhttp3.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class PaymentService {
    private final DatabaseReference paymentRef;
    private final DatabaseReference orderRef;
    private final DatabaseReference productRef;

    @Value("${paymongo.secret.key}")
    private String secretKey;

    public PaymentService() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.paymentRef = database.getReference("payments");
        this.orderRef = database.getReference("orders");
        this.productRef = database.getReference("products");
    }

    public void createPayment(String orderId, PaymentEntity payment) {
        String paymentId = paymentRef.push().getKey();
        if (paymentId != null) {
            payment.setId(paymentId);
            payment.setOrderId(orderId);

            // Call PayMongo API to generate the payment link
            try {
                OkHttpClient client = new OkHttpClient();
                MediaType mediaType = MediaType.parse("application/json");
                JSONObject payload = new JSONObject();
                JSONObject attributes = new JSONObject();
                attributes.put("amount", payment.getAmount().intValue() * 100); // Convert to cents
                attributes.put("description", payment.getDescription());
                payload.put("data", new JSONObject().put("attributes", attributes));

                RequestBody body = RequestBody.create(mediaType, payload.toString());
                Request request = new Request.Builder()
                        .url("https://api.paymongo.com/v1/links")
                        .post(body)
                        .addHeader("accept", "application/json")
                        .addHeader("content-type", "application/json")
                        .addHeader("authorization", getAuthorizationHeader())
                        .build();

                Response response = client.newCall(request).execute();
                if (response.isSuccessful() && response.body() != null) {
                    JSONObject responseBody = new JSONObject(response.body().string());
                    String checkoutUrl = responseBody.getJSONObject("data").getJSONObject("attributes").getString("checkout_url");
                    payment.setLink(checkoutUrl);
                } else {
                    String errorBody = response.body() != null ? response.body().string() : "No response body";
                    throw new RuntimeException("Failed to create payment link: " + response.message() + " - " + errorBody);
                }
            } catch (Exception e) {
                throw new RuntimeException("Error while calling PayMongo API", e);
            }

            // Save the payment to Firebase
            paymentRef.child(paymentId).setValueAsync(payment);
        }
    }

    public CompletableFuture<Optional<PaymentEntity>> getPaymentByOrderId(String orderId) {
        CompletableFuture<Optional<PaymentEntity>> future = new CompletableFuture<>();
        paymentRef.orderByChild("orderId").equalTo(orderId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot child : snapshot.getChildren()) {
                    PaymentEntity payment = child.getValue(PaymentEntity.class);
                    if (payment != null) {
                        payment.setId(child.getKey());
                        future.complete(Optional.of(payment));
                        return;
                    }
                }
                future.complete(Optional.empty());
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        return future;
    }

    private String getAuthorizationHeader() {
        String credentials = secretKey + ":";
        return "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes());
    }

    public void deletePayment(String paymentId) {
        paymentRef.child(paymentId).removeValueAsync();
    }
}