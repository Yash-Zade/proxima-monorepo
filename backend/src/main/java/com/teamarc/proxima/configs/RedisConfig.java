package com.teamarc.proxima.configs;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.activateDefaultTyping(
                mapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        SimpleModule module = new SimpleModule();
        module.addDeserializer(PageImpl.class, new PageImplDeserializer());
        mapper.registerModule(module);

        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10)) // Default TTL: 10 mins
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GzipRedisSerializer<>(new GenericJackson2JsonRedisSerializer(mapper))));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
    }

    @Bean
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
            }
        };
    }

    public static class PageImplDeserializer extends JsonDeserializer<PageImpl<?>> {
        @Override
        public PageImpl<?> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            ObjectMapper mapper = (ObjectMapper) p.getCodec();
            JsonNode node = mapper.readTree(p);

            JsonNode contentNode = unpack(node.get("content"));
            List<Object> content = new ArrayList<>();
            if (contentNode != null && contentNode.isArray()) {
                for (JsonNode item : contentNode) {
                    content.add(mapper.readValue(item.traverse(mapper), Object.class));
                }
            }

            long totalElements = node.has("totalElements") ? node.get("totalElements").asLong() : content.size();

            Pageable pageable = Pageable.unpaged();
            JsonNode pageableNode = unpack(node.get("pageable"));
            if (pageableNode != null && !pageableNode.isNull() && pageableNode.has("pageNumber")) {
                int pageNumber = pageableNode.get("pageNumber").asInt();
                int pageSize = pageableNode.has("pageSize") ? pageableNode.get("pageSize").asInt() : 10;
                pageable = PageRequest.of(pageNumber, pageSize);
            }

            return new PageImpl<>(content, pageable, totalElements);
        }

        private JsonNode unpack(JsonNode node) {
            if (node != null && node.isArray() && node.size() == 2 && node.get(0).isTextual()) {
                String typeName = node.get(0).asText();
                if (typeName.contains(".") || typeName.startsWith("[")) {
                    return node.get(1);
                }
            }
            return node;
        }
    }
}

