# ─── Build aşaması ─────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Önce sadece pom.xml'i kopyala → bağımlılıkları cache'le
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Sonra kaynakları kopyala ve paketle
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Runtime aşaması ───────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Sağlık kontrolü için curl
RUN apk add --no-cache curl

# Sadece jar'ı build aşamasından al — Maven, kaynak kod yok
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Container içinde Spring Boot'u başlat
ENTRYPOINT ["java", "-jar", "app.jar"]
