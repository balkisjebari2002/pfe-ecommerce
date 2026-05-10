FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
COPY common-security/pom.xml   ./common-security/pom.xml
COPY discovery-service/pom.xml ./discovery-service/pom.xml
COPY api-gateway/pom.xml       ./api-gateway/pom.xml
COPY user-service/pom.xml      ./user-service/pom.xml
COPY product-service/pom.xml   ./product-service/pom.xml
COPY order-service/pom.xml     ./order-service/pom.xml
COPY common-security/src ./common-security/src
COPY user-service/src    ./user-service/src
RUN mvn install -N -DskipTests -q
RUN mvn -pl common-security install -DskipTests -q
RUN mvn -pl user-service package -DskipTests -q

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/user-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
