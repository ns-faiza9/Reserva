package mth.services;

import mth.dto.ResourceDto;
import mth.entity.Booking;
import mth.entity.Resource;
import mth.repository.BookingRepository;
import mth.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private SemanticSearchService semanticSearchService;

    @Transactional(readOnly = true)
    public List<ResourceDto> recommendForUser(String userId, LocalDate date) {
        List<Booking> history = bookingRepository.findByUserId(userId).stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .collect(Collectors.toList());

        if (history.isEmpty()) {
            return resourceRepository.findAll().stream()
                    .limit(5)
                    .map(r -> resourceService.toDto(r, date))
                    .collect(Collectors.toList());
        }

        Set<String> preferredTypes = history.stream()
                .map(b -> b.getResource().getType())
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<ResourceDto> recommendations = new ArrayList<>();
        for (String type : preferredTypes) {
            resourceRepository.findByType(type).stream()
                    .filter(r -> recommendations.stream().noneMatch(d -> d.getId().equals(r.getId())))
                    .map(r -> resourceService.toDto(r, date))
                    .filter(ResourceDto::isAvailable)
                    .limit(3)
                    .forEach(recommendations::add);
        }

        if (recommendations.size() < 5) {
            String query = "available " + String.join(" ", preferredTypes) + " resources";
            semanticSearchService.semanticSearch(query, date, true).stream()
                    .filter(d -> recommendations.stream().noneMatch(r -> r.getId().equals(d.getId())))
                    .limit(5 - recommendations.size())
                    .forEach(recommendations::add);
        }

        return recommendations.stream().limit(6).collect(Collectors.toList());
    }
}
