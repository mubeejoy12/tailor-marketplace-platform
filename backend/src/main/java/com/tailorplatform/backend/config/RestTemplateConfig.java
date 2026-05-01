package com.tailorplatform.backend.config;

import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.io.HttpClientConnectionManager;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.core5.util.Timeout;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * Replaces the default SimpleClientHttpRequestFactory with Apache HttpClient 5.
 *
 * Why: RestTemplate's default factory (SimpleClientHttpRequestFactory) uses
 * java.net.HttpURLConnection which on some JVM / OS configurations throws
 *   "I/O error ... [hostname]"  →  java.net.UnknownHostException
 * even when the host is reachable.  Apache HttpClient 5 uses its own resolver
 * stack and handles TLS + DNS correctly on Java 21+/25+.
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        // Connection pool with TLS support
        HttpClientConnectionManager connectionManager =
                PoolingHttpClientConnectionManagerBuilder.create()
                        .setSSLSocketFactory(
                                SSLConnectionSocketFactoryBuilder.create()
                                        .build()
                        )
                        .setMaxConnTotal(50)
                        .setMaxConnPerRoute(20)
                        .build();

        // Per-request timeouts
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(Timeout.ofSeconds(10))  // time to get conn from pool
                .setResponseTimeout(Timeout.ofSeconds(30))            // time to read response
                .build();

        HttpClient httpClient = HttpClients.custom()
                .setConnectionManager(connectionManager)
                .setDefaultRequestConfig(requestConfig)
                .build();

        HttpComponentsClientHttpRequestFactory factory =
                new HttpComponentsClientHttpRequestFactory(httpClient);
        factory.setConnectTimeout(10_000);  // socket connect timeout (ms)

        return new RestTemplate(factory);
    }
}
