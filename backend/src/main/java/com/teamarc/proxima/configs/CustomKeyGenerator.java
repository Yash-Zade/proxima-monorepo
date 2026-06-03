package com.teamarc.proxima.configs;

import com.teamarc.proxima.entity.JobApplication;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;

import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;

@Component("customKeyGenerator")
public class CustomKeyGenerator implements KeyGenerator {

    @Override
    public Object generate(Object target, Method method, Object... params) {
        StringBuilder sb = new StringBuilder();
        sb.append(target.getClass().getSimpleName());
        sb.append("_");
        sb.append(method.getName());
        sb.append("_");
        
        for (Object param : params) {
            if (param != null) {
                if (param instanceof JobApplication) {
                    JobApplication ja = (JobApplication) param;
                    if (ja.getJob() != null) {
                        sb.append(ja.getJob().getDescription());
                    }
                    sb.append("_");
                    if (ja.getApplicant() != null) {
                        sb.append(ja.getApplicant().getResume());
                        sb.append("_");
                        if (ja.getApplicant().getCertifiedSkills() != null) {
                            sb.append(ja.getApplicant().getCertifiedSkills().toString());
                        }
                    }
                } else {
                    sb.append(param.toString());
                }
                sb.append("_");
            }
        }
        
        String keyString = sb.toString();
        // MD5 hash the key to ensure it stays a short, stable, fixed-length string in Redis
        return DigestUtils.md5DigestAsHex(keyString.getBytes(StandardCharsets.UTF_8));
    }
}
