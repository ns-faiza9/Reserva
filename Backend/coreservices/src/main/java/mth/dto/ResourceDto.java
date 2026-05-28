package mth.dto;

public class ResourceDto {

    private Long id;
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String description;
    private Boolean hasProjector;
    private Boolean hasGpu;
    private boolean available;
    private Double relevanceScore;

    public ResourceDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getHasProjector() { return hasProjector; }
    public void setHasProjector(Boolean hasProjector) { this.hasProjector = hasProjector; }
    public Boolean getHasGpu() { return hasGpu; }
    public void setHasGpu(Boolean hasGpu) { this.hasGpu = hasGpu; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public Double getRelevanceScore() { return relevanceScore; }
    public void setRelevanceScore(Double relevanceScore) { this.relevanceScore = relevanceScore; }
}
