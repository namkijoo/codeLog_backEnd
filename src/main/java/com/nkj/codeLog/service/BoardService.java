package com.nkj.codeLog.service;

import com.nkj.codeLog.domain.board.Board;
import com.nkj.codeLog.domain.user.User;
import com.nkj.codeLog.dto.BoardRequest;
import com.nkj.codeLog.dto.BoardResponse;
import com.nkj.codeLog.repository.BoardRepository;
import com.nkj.codeLog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    public BoardResponse create(BoardRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        Board board = Board.builder()
                .user(user)
                .problemNumber(request.getProblemNumber())
                .problemUrl(request.getProblemUrl())
                .platformName(request.getPlatformName())
                .tags(request.getTags())
                .difficulty(request.getDifficulty())
                .title(request.getTitle())
                .memo(request.getMemo())
                .language(request.getLanguage())
                .code(request.getCode())
                .build();

        return new BoardResponse(boardRepository.save(board));
    }

    public List<BoardResponse> getMyBoards(String username) {
        return boardRepository.findByUserUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(BoardResponse::new)
                .collect(Collectors.toList());
    }
}
