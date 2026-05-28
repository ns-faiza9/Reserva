package mth.services;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Lightweight text embedding for semantic search (no external API).
 * Uses a fixed vocabulary bag-of-words vector normalized for cosine similarity.
 */
@Service
public class EmbeddingService {

    private static final List<String> VOCAB = Arrays.asList(
            "meeting", "room", "conference", "board", "projector", "display", "presentation",
            "lab", "laboratory", "gpu", "graphics", "compute", "workstation", "research",
            "equipment", "tools", "hardware", "available", "capacity", "building", "floor",
            "training", "workshop", "seminar", "collaboration", "quiet", "large", "small",
            "video", "call", "hybrid", "studio", "creative", "server", "network", "campus"
    );

    private static final int DIMENSION = VOCAB.size();

    public List<Double> embed(String text) {
        String normalized = text == null ? "" : text.toLowerCase(Locale.ROOT);
        double[] vector = new double[DIMENSION];

        for (int i = 0; i < VOCAB.size(); i++) {
            String term = VOCAB.get(i);
            if (normalized.contains(term)) {
                vector[i] += 1.0;
            }
        }

        // Character n-gram hashing for terms not in vocabulary
        String[] tokens = normalized.replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        for (String token : tokens) {
            if (token.length() < 3) continue;
            int index = Math.floorMod(token.hashCode(), DIMENSION);
            vector[index] += 0.5;
        }

        return normalize(vector);
    }

    public double cosineSimilarity(List<Double> a, List<Double> b) {
        if (a == null || b == null || a.size() != b.size()) return 0.0;
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.size(); i++) {
            dot += a.get(i) * b.get(i);
            normA += a.get(i) * a.get(i);
            normB += b.get(i) * b.get(i);
        }
        if (normA == 0 || normB == 0) return 0.0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    public String buildResourceText(String name, String type, String location, String description,
                                    Boolean hasProjector, Boolean hasGpu, Integer capacity) {
        StringBuilder sb = new StringBuilder();
        sb.append(name).append(' ').append(type).append(' ').append(location).append(' ');
        if (description != null) sb.append(description).append(' ');
        if (Boolean.TRUE.equals(hasProjector)) sb.append("projector meeting presentation ");
        if (Boolean.TRUE.equals(hasGpu)) sb.append("gpu lab compute graphics workstation ");
        if (capacity != null) sb.append("capacity ").append(capacity);
        return sb.toString();
    }

    private List<Double> normalize(double[] vector) {
        double norm = 0;
        for (double v : vector) norm += v * v;
        norm = Math.sqrt(norm);
        List<Double> result = new ArrayList<>(vector.length);
        for (double v : vector) {
            result.add(norm == 0 ? 0.0 : v / norm);
        }
        return result;
    }
}
