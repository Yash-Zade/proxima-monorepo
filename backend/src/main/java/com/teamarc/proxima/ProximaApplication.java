package com.teamarc.proxima;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
@SpringBootApplication
public class ProximaApplication {

    public static void main(String[] args) {
        // Preprocess and dynamically configure Kafka SSL truststore
        String truststoreCert = System.getenv("KAFKA_SSL_TRUSTSTORE_CERTIFICATES");
        if (truststoreCert != null && !truststoreCert.trim().isEmpty()) {
            System.setProperty("spring.kafka.properties.ssl.truststore.type", "PEM");
            if (truststoreCert.startsWith("\"") && truststoreCert.endsWith("\"") && truststoreCert.length() > 1) {
                truststoreCert = truststoreCert.substring(1, truststoreCert.length() - 1);
            }
            truststoreCert = truststoreCert.replace("\\n", "\n");
            System.setProperty("spring.kafka.properties.ssl.truststore.certificates", truststoreCert);
        }

        // Preprocess and dynamically configure Kafka SSL keystore (only if client key is present)
        String keystoreKey = System.getenv("KAFKA_SSL_KEYSTORE_KEY");
        if (keystoreKey != null && !keystoreKey.trim().isEmpty()) {
            System.setProperty("spring.kafka.properties.ssl.keystore.type", "PEM");
            if (keystoreKey.startsWith("\"") && keystoreKey.endsWith("\"") && keystoreKey.length() > 1) {
                keystoreKey = keystoreKey.substring(1, keystoreKey.length() - 1);
            }
            keystoreKey = keystoreKey.replace("\\n", "\n");
            System.setProperty("spring.kafka.properties.ssl.keystore.key", keystoreKey);

            String keystoreCert = System.getenv("KAFKA_SSL_KEYSTORE_CERTIFICATE_CHAIN");
            if (keystoreCert != null) {
                if (keystoreCert.startsWith("\"") && keystoreCert.endsWith("\"") && keystoreCert.length() > 1) {
                    keystoreCert = keystoreCert.substring(1, keystoreCert.length() - 1);
                }
                keystoreCert = keystoreCert.replace("\\n", "\n");
                System.setProperty("spring.kafka.properties.ssl.keystore.certificate.chain", keystoreCert);
            }
        }
        
        // Only set ssl.key.password if it is set in the environment and is not empty
        String keyPassword = System.getenv("KAFKA_SSL_KEY_PASSWORD");
        if (keyPassword != null) {
            if (keyPassword.startsWith("\"") && keyPassword.endsWith("\"") && keyPassword.length() > 1) {
                keyPassword = keyPassword.substring(1, keyPassword.length() - 1);
            }
            if (!keyPassword.trim().isEmpty()) {
                System.setProperty("spring.kafka.properties.ssl.key.password", keyPassword);
            }
        }
        SpringApplication.run(ProximaApplication.class, args);
    }

}
