package mth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // e.g., "Room", "Lab", "Equipment"

    private Integer capacity;

    private String location;

    @Column(name = "has_projector")
    private Boolean hasProjector;

    @Column(name = "has_gpu")
    private Boolean hasGpu;

    @Column(length = 1000)
    private String description;

    /** ID from GitHub catalog JSON — used to sync external resources for booking */
    @Column(name = "catalog_id", unique = true)
    private Long catalogId;

    public Resource() {}

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
    public Boolean getHasProjector() { return hasProjector; }
    public void setHasProjector(Boolean hasProjector) { this.hasProjector = hasProjector; }
    public Boolean getHasGpu() { return hasGpu; }
    public void setHasGpu(Boolean hasGpu) { this.hasGpu = hasGpu; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getCatalogId() { return catalogId; }
    public void setCatalogId(Long catalogId) { this.catalogId = catalogId; }
}
