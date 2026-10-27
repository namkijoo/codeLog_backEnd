// src/services/RecommendService.ts
import { RouteError } from '#src/common/classes/route-errors.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import BoardService from '#src/services/BoardService.ts';
import Llm from '#src/services/llm/openai.client.ts';

export type RecommendationItem = {
  title: string;
  problemNumber: number;
  platform: 'Programmers';
  difficulty: string;
  reason: string;
  problemUrl: string;
};

export type DailyRecommendResponse = {
  date: string;
  recommendations: RecommendationItem[];
};

type LlmRecommendItem = {
  title: string;
  problemNumber: number;
  difficulty: string;
  reason: string;
};

const SYSTEM_PROMPT = `
당신은 프로그래머스 코딩테스트 학습 코치입니다.
사용자 풀이 기록을 보고 아래 JSON만 반환하세요. 다른 텍스트 금지.

{
  "recommendations": [
    {
      "title": "문제명",
      "problemNumber": 42576,
      "difficulty": "Lv.2",
      "reason": "추천 이유"
    },
    {
      "title": "문제명",
      "problemNumber": 1845,
      "difficulty": "Lv.1",
      "reason": "추천 이유"
    },
    {
      "title": "문제명",
      "problemNumber": 43165,
      "difficulty": "Lv.2",
      "reason": "추천 이유"
    }
  ]
}

규칙:
- 프로그래머스 문제만 추천
- recommendations는 정확히 3개
- problemNumber는 실제 프로그래머스 문제 번호(숫자)
- 사용자가 이미 푼 problemNumber는 제외
- problemUrl, platform, feedback 필드는 만들지 말 것
- 약한 태그/난이도를 우선 보완
- 한국어로 작성
`.trim();

function buildProgrammersUrl(problemNumber: number): string {
  return `https://school.programmers.co.kr/learn/courses/30/lessons/${problemNumber}`;
}

function isProgrammers(platformName: string): boolean {
  const p = platformName.toLowerCase();
  return p.includes('programmers') || platformName.includes('프로그래머스');
}

function summarizeBoards(
  boards: Awaited<ReturnType<typeof BoardService.getAllBoardsByUserId>>,
): string {
  const programmers = boards.filter((b) => isProgrammers(b.platformName));
  const recent = programmers.slice(0, 30).map((b) => ({
    problemNumber: b.problemNumber,
    title: b.title,
    difficulty: b.difficulty,
    tags: b.tags,
    language: b.language,
    memo: b.memo?.slice(0, 120) ?? '',
    createdAt: b.createdAt,
  }));

  return JSON.stringify(
    {
      totalCount: programmers.length,
      solvedProblemNumbers: programmers.map((b) => b.problemNumber),
      recentProblems: recent,
    },
    null,
    2,
  );
}

function normalizeRecommendItem(item: unknown): LlmRecommendItem | null {
  if (!item || typeof item !== 'object') return null;
  const row = item as Record<string, unknown>;

  const title = typeof row.title === 'string' ? row.title.trim() : '';
  const difficulty =
    typeof row.difficulty === 'string' ? row.difficulty.trim() : '';
  const reason = typeof row.reason === 'string' ? row.reason.trim() : '';
  const problemNumber = Number(row.problemNumber);

  if (
    !title ||
    !difficulty ||
    !reason ||
    !Number.isFinite(problemNumber) ||
    problemNumber <= 0
  ) {
    return null;
  }

  return {
    title,
    problemNumber,
    difficulty,
    reason,
  };
}

function parseRecommendations(data: unknown): LlmRecommendItem[] {
  if (!data || typeof data !== 'object') {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      'AI 응답 형식이 올바르지 않습니다.',
    );
  }

  const obj = data as Record<string, unknown>;
  const rawList = Array.isArray(obj.recommendations)
    ? obj.recommendations
    : Array.isArray(obj.recommendation)
      ? obj.recommendation
      : null;

  if (!rawList || rawList.length === 0) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      'AI 응답 형식이 올바르지 않습니다.',
    );
  }

  const recommendations = rawList
    .map(normalizeRecommendItem)
    .filter((item): item is LlmRecommendItem => item !== null)
    .slice(0, 3);

  if (recommendations.length !== 3) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      'AI 추천이 3개가 아닙니다. 다시 시도해주세요.',
    );
  }

  return recommendations;
}

async function getDailyRecommend(
  userId: number,
): Promise<DailyRecommendResponse> {
  const boards = await BoardService.getAllBoardsByUserId(userId);
  const programmers = boards.filter((b) => isProgrammers(b.platformName));

  if (programmers.length === 0) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      '프로그래머스 문제 기록이 없습니다. 먼저 문제를 등록해주세요.',
    );
  }

  const solved = new Set(programmers.map((b) => b.problemNumber));

  const userPrompt = `
아래는 사용자의 프로그래머스 풀이 기록 요약입니다.
이미 푼 문제 번호는 추천에서 제외하세요.
반드시 recommendations 3개만 포함하세요. feedback은 넣지 마세요.

${summarizeBoards(boards)}
`.trim();

  const raw = await Llm.chatJson(SYSTEM_PROMPT, userPrompt);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      'AI 응답 JSON 파싱에 실패했습니다.',
    );
  }

  const recommendations = parseRecommendations(parsed).filter(
    (item) => !solved.has(item.problemNumber),
  );

  if (recommendations.length !== 3) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      '이미 푼 문제가 포함되었거나 추천이 3개가 아닙니다. 다시 시도해주세요.',
    );
  }

  return {
    date: new Date().toISOString().slice(0, 10),
    recommendations: recommendations.map((item) => ({
      title: item.title,
      problemNumber: item.problemNumber,
      platform: 'Programmers',
      difficulty: item.difficulty,
      reason: item.reason,
      problemUrl: buildProgrammersUrl(item.problemNumber),
    })),
  };
}

export default {
  getDailyRecommend,
};
