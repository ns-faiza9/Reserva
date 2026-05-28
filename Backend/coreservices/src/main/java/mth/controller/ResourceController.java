package mth.controller;

import mth.dto.CatalogResourceRequest;
import mth.dto.ResourceDto;
import mth.entity.Resource;
import mth.services.AuthHelper;
import mth.services.RecommendationService;
import mth.services.ResourceService;
import mth.services.SemanticSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    @Autowired private ResourceService resourceService;
    @Autowired private SemanticSearchService semanticSearchService;
    @Autowired private RecommendationService recommendationService;
    @Autowired private AuthHelper authHelper;

    @GetMapping
    public List<ResourceDto> getAllResources(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String type) {
        if (type != null && !type.isBlank()) return resourceService.getByType(type, date);
        return resourceService.getAllResources(date);
    }

    @GetMapping("/categories")
    public List<String> getCategories() { return resourceService.getCategories(); }

    @PostMapping("/from-catalog")
    public ResourceDto ensureFromCatalog(
            @RequestHeader("Token") String token,
            @RequestBody CatalogResourceRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        authHelper.emailFromToken(token);
        return resourceService.findOrCreateFromCatalog(request, date);
    }

    @GetMapping("/search")
    public List<ResourceDto> semanticSearch(
            @RequestParam String q,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "false") boolean availableOnly) {
        return semanticSearchService.semanticSearch(q, date, availableOnly);
    }

    @GetMapping("/recommendations")
    public List<ResourceDto> getRecommendations(
            @RequestHeader("Token") String token,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return recommendationService.recommendForUser(authHelper.emailFromToken(token), date);
    }

    @PostMapping
    public Resource createResource(@RequestHeader("Token") String token, @RequestBody Resource resource) {
        authHelper.requireAdmin(token);
        return resourceService.createResource(resource);
    }

    @PutMapping("/{id}")
    public Resource updateResource(
            @RequestHeader("Token") String token, @PathVariable Long id, @RequestBody Resource resource) {
        authHelper.requireAdmin(token);
        return resourceService.updateResource(id, resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@RequestHeader("Token") String token, @PathVariable Long id) {
        authHelper.requireAdmin(token);
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
