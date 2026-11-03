import { RouteError } from '#src/common/classes/route-errors.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import BoardService from '#src/services/BoardService.ts';
import Llm from '#src/services/llm/openai.client.ts';

export type FeedbackResponse = {
  date: string;
  strengths: string[];
  improvements: string[];
  focusToday: string;
};

const SYSTEM_PROMPT = `
당신은 프로그래머스 코딩테스트 학습 코치입니다.
사용자 풀이 기록을 보고 아래 JSON만 반환하세요. 다른 텍스트 금지.

{
  "strengths": ["강점1", "강점2"],
  "improvements": ["보완점1", "보완점2"],
  "focusToday": "오늘 집중할 한 문장"
}

규칙:
- strengths, improvements는 각각 2~4개
- 태그/난이도/메모를 근거로 구체적으로
- 문제 번호나 링크는 넣지 말 것
- 한국어로 작성
`.trim();

function isProgrammers(platformName: string): boolean {
  const p = platformName.toLowerCase();
  return p.includes('programmers') || platformName.includes('프로그래머스');
}

function summarizeBoards(
  boards: Awaited<ReturnType<typeof BoardService.getAllBoardsByUserId>>,
): string {
  const list = boards.filter((b) => isProgrammers(b.platformName)).slice(0, 30);
  return JSON.stringify(
    {
      totalCount: list.length,
      recentProblems: list.map((b) => ({
        title: b.title,
        difficulty: b.difficulty,
        tags: b.tags,
        memo: b.memo?.slice(0, 120) ?? '',
      })),
    },
    null,
    2,
  );
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean);
}

async function getFeedback(userId: number): Promise<FeedbackResponse> {
  const boards = await BoardService.getAllBoardsByUserId(userId);
  const programmers = boards.filter((b) => isProgrammers(b.platformName));

  if (programmers.length === 0) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      '프로그래머스 문제 기록이 없습니다.',
    );
  }

  const raw = await Llm.chatJson(
    SYSTEM_PROMPT,
    `아래 풀이 기록으로 피드백을 주세요.\n\n${summarizeBoards(boards)}`,
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      'AI 응답 JSON 파싱에 실패했습니다.',
    );
  }

  const obj = parsed as Record<string, unknown>;
  const strengths = toStringArray(obj.strengths);
  const improvements = toStringArray(obj.improvements);
  const focusToday =
    typeof obj.focusToday === 'string' ? obj.focusToday.trim() : '';

  if (strengths.length === 0 || improvements.length === 0 || !focusToday) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      'AI 피드백 형식이 올바르지 않습니다.',
    );
  }

  return {
    date: new Date().toISOString().slice(0, 10),
    strengths,
    improvements,
    focusToday,
  };
}

export default {
  getFeedback,
};
