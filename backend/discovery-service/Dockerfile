FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Parent POM + all module pom stubs (required for Maven to validate the reactor)
COPY pom.xml ./pom.xml
COPY common-security/pom.xml   ./common-security/pom.xml
COPY discovery-service/pom.xml ./discovery-service/pom.xml
COPY api-gateway/pom.xml       ./api-gateway/pom.xml
COPY user-service/pom.xml      ./user-service/pom.xml
COPY product-service/pom.xml   ./product-service/pom.xml
COPY order-service/pom.xml     ./order-service/pom.xml
# Full sources only for what we actually build
COPY common-security/src   ./common-security/src
COPY discovery-service/src ./discovery-service/src
RUN mvn install -N -DskipTests -q
RUN mvn -pl common-security install -DskipTests -q
RUN mvn -pl discovery-service package -DskipTests -q

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/discovery-service/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
