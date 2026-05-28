package mth.services;

import mth.dto.ResourceDto;
import mth.entity.Resource;
import mth.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SemanticSearchService {

    private static final double MIN_SCORE = 0.15;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private AvailabilityService availabilityService;

    public List<ResourceDto> semanticSearch(String query, LocalDate date, boolean availableOnly) {
        List<Double> queryVector = embeddingService.embed(query);
        LocalDate checkDate = date != null ? date : LocalDate.now();

        return resourceRepository.findAll().stream()
                .map(resource -> {
                    String text = embeddingService.buildResourceText(
                            resource.getName(), resource.getType(), resource.getLocation(),
                            resource.getDescription(), resource.getHasProjector(), resource.getHasGpu(),
                            resource.getCapacity());
                    double score = embeddingService.cosineSimilarity(queryVector, embeddingService.embed(text));
                    ResourceDto dto = mapToDto(resource, checkDate);
                    dto.setRelevanceScore(score);
                    if (availableOnly && !dto.isAvailable()) return null;
                    return score >= MIN_SCORE ? dto : null;
                })
                .filter(dto -> dto != null)
                .sorted(Comparator.comparing(ResourceDto::getRelevanceScore).reversed())
                .collect(Collectors.toList());
    }

    private ResourceDto mapToDto(Resource resource, LocalDate date) {
        ResourceDto dto = new ResourceDto();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setDescription(resource.getDescription());
        dto.setHasProjector(resource.getHasProjector());
        dto.setHasGpu(resource.getHasGpu());
        dto.setAvailable(availabilityService.isResourceAvailableOnDate(resource.getId(), date));
        return dto;
    }
}
