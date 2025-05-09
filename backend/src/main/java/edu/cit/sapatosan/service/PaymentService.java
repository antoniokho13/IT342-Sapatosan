package edu.cit.sapatosan.service;

import java.util.Base64;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import edu.cit.sapatosan.entity.OrderEntity;
import edu.cit.sapatosan.entity.PaymentEntity;
import edu.cit.sapatosan.entity.UserEntity;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

@Service
public class PaymentService {
    private final DatabaseReference paymentRef;
    private final DatabaseReference orderRef;

    @Value("${paymongo.secret.key}")
    private String secretKey;

    @Value("${paymongo.webhook.url}")
    private String webhookUrl;

    public PaymentService() {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        this.paymentRef = database.getReference("payments");
        this.orderRef = database.getReference("orders");
    }

    public void createPayment(String orderId, PaymentEntity payment, UserEntity user) {
        String paymentId = paymentRef.push().getKey();
        if (paymentId != null) {
            payment.setId(paymentId);
            payment.setOrderId(orderId);
            payment.setStatus("pending");

            try {
                OkHttpClient client = new OkHttpClient();
                MediaType mediaType = MediaType.parse("application/json");
                JSONObject payload = new JSONObject();
                JSONObject attributes = new JSONObject();
                attributes.put("amount", payment.getAmount().intValue()); // Convert to cents
                // Include user details in the description
                String description = String.format(
                        "Payment for order %s by %s %s (%s)",
                        orderId, user.getFirstName(), user.getLastName(), user.getEmail()
                );
                attributes.put("description", description);
                JSONObject metadata = new JSONObject();
                metadata.put("order_id", orderId);
                attributes.put("metadata", metadata);
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
                    String linkId = responseBody.getJSONObject("data").getString("id");
                    payment.setLink(checkoutUrl);
                    payment.setLinkId(linkId);
                } else {
                    String errorBody = response.body() != null ? response.body().string() : "No response body";
                    throw new RuntimeException("Failed to create payment link: " + response.message() + " - " + errorBody);
                }
            } catch (Exception e) {
                throw new RuntimeException("Error while calling PayMongo API", e);
            }

            paymentRef.child(paymentId).setValueAsync(payment);
            createWebhookForPayment(paymentId, orderId);
        }
    }

    public void createWebhookForPayment(String paymentId, String orderId) {
        try {
            // Skip webhook creation for localhost environments
            if (webhookUrl.contains("localhost")) {
                System.out.println("Skipping webhook creation for localhost environment");
                return;
            }
            
            OkHttpClient client = new OkHttpClient();
            MediaType mediaType = MediaType.parse("application/json");
            String bodyJson = String.format("{\"data\":{\"attributes\":{\"url\":\"%s\",\"events\":[\"link.payment.paid\"]}}}", webhookUrl);
            RequestBody body = RequestBody.create(mediaType, bodyJson);
            Request request = new Request.Builder()
                    .url("https://api.paymongo.com/v1/webhooks")
                    .post(body)
                    .addHeader("accept", "application/json")
                    .addHeader("content-type", "application/json")
                    .addHeader("authorization", getAuthorizationHeader())
                    .build();

            Response response = client.newCall(request).execute();
            if (!response.isSuccessful() || response.body() == null) {
                String errorBody = response.body() != null ? response.body().string() : "No response body";
                System.err.println("Failed to create webhook: " + response.message() + " - " + errorBody);
                // Continue without throwing exception
            }
        } catch (Exception e) {
            System.err.println("Error while creating webhook: " + e.getMessage());
            // Continue without throwing exception
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

    public CompletableFuture<Optional<PaymentEntity>> getPaymentByLinkId(String linkId) {
        CompletableFuture<Optional<PaymentEntity>> future = new CompletableFuture<>();
        paymentRef.orderByChild("linkId").equalTo(linkId).addListenerForSingleValueEvent(new ValueEventListener() {
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
    public void updatePayment(PaymentEntity payment) {
        if (payment.getId() != null) {
            paymentRef.child(payment.getId()).setValueAsync(payment);
        } else {
            throw new IllegalArgumentException("Payment ID is required to update payment");
        }
    }

    public void deletePayment(String paymentId) {
        paymentRef.child(paymentId).removeValueAsync();
    }

    public void checkPaymentStatusManually(String orderId) {
        getPaymentByOrderId(orderId).thenAccept(paymentOptional -> {
            if (paymentOptional.isPresent()) {
                PaymentEntity payment = paymentOptional.get();
                if ("pending".equals(payment.getStatus()) && payment.getLinkId() != null) {
                    try {
                        OkHttpClient client = new OkHttpClient();
                        Request request = new Request.Builder()
                                .url("https://api.paymongo.com/v1/links/" + payment.getLinkId())
                                .get()
                                .addHeader("accept", "application/json")
                                .addHeader("authorization", getAuthorizationHeader())
                                .build();

                        Response response = client.newCall(request).execute();
                        if (response.isSuccessful() && response.body() != null) {
                            JSONObject responseBody = new JSONObject(response.body().string());
                            String status = responseBody.getJSONObject("data")
                                .getJSONObject("attributes")
                                .getString("status");
                                
                            if ("paid".equalsIgnoreCase(status)) {
                                // Update the payment status
                                payment.setStatus("completed");
                                updatePayment(payment);
                                
                                // Update the order status
                                DatabaseReference orderRef = FirebaseDatabase.getInstance().getReference("orders");
                                orderRef.child(orderId).child("paymentStatus")
                                    .setValueAsync(OrderEntity.PaymentStatus.PAID);
                                
                                System.out.println("Manual payment check: Payment completed for order " + orderId);
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Error checking payment status manually: " + e.getMessage());
                    }
                }
            }
        }).exceptionally(ex -> {
            System.err.println("Exception when checking payment status: " + ex.getMessage());
            return null;
        });
    }
}