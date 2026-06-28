package com.nkj.codeLog.domain.board;

import com.nkj.codeLog.domain.user.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "boards")
@Getter
@NoArgsConstructor
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "problem_number", nullable = false)
    private Integer problemNumber;

    @Column(name = "problem_url")
    private String problemUrl;

    @Column(name = "platform_name", nullable = false, length = 50)
    private String platformName;

    @ElementCollection
    @CollectionTable(name = "board_tags", joinColumns = @JoinColumn(name = "board_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @Column(nullable = false)
    private String difficulty;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(length = 50)
    private String language;

    @Column(columnDefinition = "TEXT")
    private String code;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public Board(User user, Integer problemNumber, String problemUrl, String platformName, List<String> tags,
                 String difficulty, String title, String memo, String language, String code) {
        this.user = user;
        this.problemNumber = problemNumber;
        this.problemUrl = problemUrl;
        this.platformName = platformName;
        this.tags = tags != null ? tags : new ArrayList<>();
        this.difficulty = difficulty;
        this.title = title;
        this.memo = memo;
        this.language = language;
        this.code = code;
    }
}
