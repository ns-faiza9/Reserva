package mth.services;

import mth.dto.CatalogResourceRequest;
import mth.dto.ResourceDto;
import mth.entity.Resource;
import mth.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private AvailabilityService availabilityService;

    public List<ResourceDto> getAllResources(LocalDate date) {
        return resourceRepository.findAll().stream()
                .map(r -> toDto(r, date))
                .collect(Collectors.toList());
    }

    public List<ResourceDto> getByType(String type, LocalDate date) {
        return resourceRepository.findByType(type).stream()
                .map(r -> toDto(r, date))
                .collect(Collectors.toList());
    }

    public List<String> getCategories() {
        return resourceRepository.findAll().stream()
                .map(Resource::getType)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public Optional<ResourceDto> getResourceById(Long id, LocalDate date) {
        return resourceRepository.findById(id).map(r -> toDto(r, date));
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    /** Find or create a DB resource linked to a GitHub catalog entry (for booking). */
    public ResourceDto findOrCreateFromCatalog(CatalogResourceRequest req, LocalDate date) {
        if (req.getCatalogId() == null) {
            throw new RuntimeException("Catalog id is required.");
        }
        Resource resource = resourceRepository.findByCatalogId(req.getCatalogId())
                .orElseGet(() -> {
                    Resource r = new Resource();
                    r.setCatalogId(req.getCatalogId());
                    r.setName(req.getName());
                    r.setType(req.getType() != null ? req.getType() : "Room");
                    r.setLocation(req.getLocation());
                    r.setCapacity(req.getCapacity() != null ? req.getCapacity() : 1);
                    r.setDescription("Booked from catalog.");
                    r.setHasProjector(false);
                    r.setHasGpu(false);
                    return resourceRepository.save(r);
                });
        return toDto(resource, date);
    }

    public Resource updateResource(Long id, Resource updated) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        resource.setName(updated.getName());
        resource.setType(updated.getType());
        resource.setCapacity(updated.getCapacity());
        resource.setLocation(updated.getLocation());
        resource.setDescription(updated.getDescription());
        resource.setHasProjector(updated.getHasProjector());
        resource.setHasGpu(updated.getHasGpu());
        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    public ResourceDto toDto(Resource resource, LocalDate date) {
        ResourceDto dto = new ResourceDto();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setDescription(resource.getDescription());
        dto.setHasProjector(resource.getHasProjector());
        dto.setHasGpu(resource.getHasGpu());
        LocalDate checkDate = date != null ? date : LocalDate.now();
        dto.setAvailable(availabilityService.isResourceAvailableOnDate(resource.getId(), checkDate));
        return dto;
    }
}
