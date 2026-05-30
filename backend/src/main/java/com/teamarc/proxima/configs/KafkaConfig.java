package com.teamarc.proxima.configs;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic directChatTopic() {
        return TopicBuilder.name("direct-chat-topic")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic forumChatTopic() {
        return TopicBuilder.name("forum-chat-topic")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
