package com.nkj.codeLog.controller;

import com.nkj.codeLog.dto.BoardRequest;
import com.nkj.codeLog.dto.BoardResponse;
import com.nkj.codeLog.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @PostMapping
    public ResponseEntity<BoardResponse> create(
            @RequestBody BoardRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        return ResponseEntity.ok(
                boardService.create(request, username)
        );
    }

    @GetMapping
    public ResponseEntity<List<BoardResponse>> getMyBoards(
            Authentication authentication) {

        String username = authentication.getName();

        return ResponseEntity.ok(boardService.getMyBoards(username));
    }
}
