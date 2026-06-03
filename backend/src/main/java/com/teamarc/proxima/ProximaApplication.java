package com.teamarc.proxima;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
@SpringBootApplication
public class ProximaApplication {

    /**
     * Strips surrounding double-quotes from an environment variable value,
     * then replaces literal \n sequences with actual newlines.
     */
    private static String preprocessEnvValue(String value) {
        if (value == null) return null;
        // Strip surrounding double-quotes added by some env managers (e.g. Koyeb, .env files)
        if (value.startsWith("\"") && value.endsWith("\"") && value.length() > 1) {
            value = value.substring(1, value.length() - 1);
        }
        // Replace literal \n with real newlines (for PEM certificates)
        value = value.replace("\\n", "\n");
        return value.trim();
    }

    public static void main(String[] args) {
        // ── SSL Truststore (CA Certificate) ─────────────────────────────────────
        String truststoreCert = preprocessEnvValue(System.getenv("KAFKA_SSL_TRUSTSTORE_CERTIFICATES"));
        if (truststoreCert != null && !truststoreCert.isEmpty()) {
            System.setProperty("spring.kafka.properties.ssl.truststore.type", "PEM");
            System.setProperty("spring.kafka.properties.ssl.truststore.certificates", truststoreCert);
        }

        // ── SSL Keystore (only present for mTLS, not needed for SASL_SSL) ───────
        String keystoreKey = preprocessEnvValue(System.getenv("KAFKA_SSL_KEYSTORE_KEY"));
        if (keystoreKey != null && !keystoreKey.isEmpty()) {
            System.setProperty("spring.kafka.properties.ssl.keystore.type", "PEM");
            System.setProperty("spring.kafka.properties.ssl.keystore.key", keystoreKey);

            String keystoreCert = preprocessEnvValue(System.getenv("KAFKA_SSL_KEYSTORE_CERTIFICATE_CHAIN"));
            if (keystoreCert != null && !keystoreCert.isEmpty()) {
                System.setProperty("spring.kafka.properties.ssl.keystore.certificate.chain", keystoreCert);
            }
        }

        // ── SSL Key Password (optional, strip quotes only) ───────────────────────
        String keyPassword = preprocessEnvValue(System.getenv("KAFKA_SSL_KEY_PASSWORD"));
        if (keyPassword != null && !keyPassword.isEmpty()) {
            System.setProperty("spring.kafka.properties.ssl.key.password", keyPassword);
        }

        // ── SASL JAAS Config ─────────────────────────────────────────────────────
        // Koyeb/Docker env vars can wrap the value in outer quotes and escape inner ones.
        // e.g. "org.apache.kafka...required username=\"avnadmin\" password=\"xxx\";"
        // We strip the outer quotes and un-escape the inner ones.
        String jaasConfig = System.getenv("KAFKA_SASL_JAAS_CONFIG");
        if (jaasConfig != null && !jaasConfig.trim().isEmpty()) {
            // Strip surrounding double-quotes
            if (jaasConfig.startsWith("\"") && jaasConfig.endsWith("\"") && jaasConfig.length() > 1) {
                jaasConfig = jaasConfig.substring(1, jaasConfig.length() - 1);
            }
            // Un-escape inner double-quotes: \" → "
            jaasConfig = jaasConfig.replace("\\\"", "\"");
            System.setProperty("spring.kafka.properties.sasl.jaas.config", jaasConfig);
        }

        // ── Security Protocol & SASL Mechanism (strip any accidental quotes) ─────
        String securityProtocol = preprocessEnvValue(System.getenv("KAFKA_SECURITY_PROTOCOL"));
        if (securityProtocol != null && !securityProtocol.isEmpty()) {
            System.setProperty("spring.kafka.properties.security.protocol", securityProtocol);
        }

        String saslMechanism = preprocessEnvValue(System.getenv("KAFKA_SASL_MECHANISM"));
        if (saslMechanism != null && !saslMechanism.isEmpty()) {
            System.setProperty("spring.kafka.properties.sasl.mechanism", saslMechanism);
        }

        SpringApplication.run(ProximaApplication.class, args);
    }

}
