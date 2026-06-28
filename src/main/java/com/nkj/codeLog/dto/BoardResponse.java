package com.nkj.codeLog.dto;

import com.nkj.codeLog.domain.board.Board;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class BoardResponse {
    private final Long id;
    private final String username;
    private final Integer problemNumber;
    private final String problemUrl;
    private final String platformName;
    private final List<String> tags;
    private final String difficulty;
    private final String title;
    private final String memo;
    private final String language;
    private final String code;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public BoardResponse(Board board) {
        this.id = board.getId();
        this.username = board.getUser().getUsername();
        this.problemNumber = board.getProblemNumber();
        this.problemUrl = board.getProblemUrl();
        this.platformName = board.getPlatformName();
        this.tags = board.getTags();
        this.difficulty = board.getDifficulty();
        this.title = board.getTitle();
        this.memo = board.getMemo();
        this.language = board.getLanguage();
        this.code = board.getCode();
        this.createdAt = board.getCreatedAt();
        this.updatedAt = board.getUpdatedAt();
    }
}
