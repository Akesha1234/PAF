package com.smartcampus.repository;

import com.smartcampus.domain.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, String>,
        JpaSpecificationExecutor<Resource> {

    List<Resource> findByType(Resource.ResourceType type);

    List<Resource> findByStatus(Resource.ResourceStatus status);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer minCapacity);

    List<Resource> findByTypeAndStatus(Resource.ResourceType type, Resource.ResourceStatus status);
}
