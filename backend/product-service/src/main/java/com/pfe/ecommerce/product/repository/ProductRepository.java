package com.pfe.ecommerce.product.repository;

import com.pfe.ecommerce.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryAndActiveTrue(String category, Pageable pageable);

    @Query("{ 'active': true, $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ] }")
    Page<Product> searchByKeyword(String keyword, Pageable pageable);

    @Query("{ 'active': true, 'category': ?0, $or: [ { 'name': { $regex: ?1, $options: 'i' } }, { 'description': { $regex: ?1, $options: 'i' } } ] }")
    Page<Product> searchByCategoryAndKeyword(String category, String keyword, Pageable pageable);

    @Query(value = "{ 'active': true }", fields = "{ 'category': 1 }")
    List<Product> findDistinctCategories();
}
