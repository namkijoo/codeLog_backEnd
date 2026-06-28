package com.nkj.codeLog.repository;

import com.nkj.codeLog.domain.board.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByUserUsernameOrderByCreatedAtDesc(String username);
}
