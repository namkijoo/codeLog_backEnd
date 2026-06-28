package com.nkj.codeLog.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class BoardRequest {
    private Integer problemNumber;
    private String problemUrl;
    private String platformName;
    private List<String> tags;
    private String difficulty;
    private String title;
    private String memo;
    private String language;
    private String code;
}
