import type { Payload, Where } from "payload";
import type { Post } from "@/types/payload";

type BoardFilter = number | { id: number };

type BaseOptions = {
  payload: Payload;
  depth?: number;
};

type PostStatus = "published" | "draft" | "deleted";

function normalizeNumericId(value: number | string, fieldName: string): number {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return numericValue;
}

function normalizeBoardIds(filterBoards: BoardFilter[] = []): number[] {
  return filterBoards.map((board) =>
    typeof board === "number" ? board : board.id,
  );
}

function getBoardId(board: Post["board"]): number | undefined {
  if (typeof board === "number") {
    return board;
  }

  if (board && typeof board === "object") {
    return board.id;
  }

  return undefined;
}

function publishedPostWhere(extraConditions: Where[] = []): Where {
  const conditions: Where[] = [
    {
      status: {
        equals: "published",
      },
    },
    {
      isDeleted: {
        not_equals: true,
      },
    },
    ...extraConditions,
  ];

  return {
    and: conditions,
  };
}

/**
 * Single post.
 */
export async function getPostById({
  payload,
  id,
  depth = 1,
  overrideAccess = false,
}: BaseOptions & {
  id: number | string;
  overrideAccess?: boolean;
}): Promise<Post | null> {
  try {
    const post = await payload.findByID({
      collection: "posts",
      id,
      depth,
      overrideAccess,
    });

    if (!post) return null;
    if (post.status === "deleted") return null;
    if (post.isDeleted === true) return null;

    return post;
  } catch {
    return null;
  }
}

/**
 * Latest published, non-secret posts.
 */
export async function getLatestPosts({
  payload,
  postCount = 10,
  filterBoards = [],
  depth = 2,
}: BaseOptions & {
  postCount?: number;
  filterBoards?: BoardFilter[];
}) {
  const boardIds = normalizeBoardIds(filterBoards);
  const conditions: Where[] = [
    {
      isSecret: {
        not_equals: true,
      },
    },
  ];

  if (boardIds.length > 0) {
    conditions.push({
      board: {
        in: boardIds,
      },
    });
  }

  return payload.find({
    collection: "posts",
    where: publishedPostWhere(conditions),
    sort: "-createdAt",
    limit: postCount,
    depth,
  });
}

/**
 * Popular posts: all-time most viewed posts.
 */
export async function getPopularPosts({
  payload,
  postCount = 10,
  filterBoards = [],
  depth = 2,
}: BaseOptions & {
  postCount?: number;
  filterBoards?: BoardFilter[];
}) {
  const boardIds = normalizeBoardIds(filterBoards);
  const conditions: Where[] = [
    {
      isSecret: {
        not_equals: true,
      },
    },
  ];

  if (boardIds.length > 0) {
    conditions.push({
      board: {
        in: boardIds,
      },
    });
  }

  return payload.find({
    collection: "posts",
    where: publishedPostWhere(conditions),
    sort: "-viewCount",
    limit: postCount,
    depth,
  });
}

/**
 * Trending posts: most viewed posts within recent N days.
 */
export async function getTrendingPosts({
  payload,
  postCount = 10,
  periodDays = 7,
  filterBoards = [],
  depth = 2,
}: BaseOptions & {
  postCount?: number;
  periodDays?: number;
  filterBoards?: BoardFilter[];
}) {
  const since = new Date();
  since.setDate(since.getDate() - periodDays);

  const boardIds = normalizeBoardIds(filterBoards);
  const conditions: Where[] = [
    {
      isSecret: {
        not_equals: true,
      },
    },
    {
      createdAt: {
        greater_than: since.toISOString(),
      },
    },
  ];

  if (boardIds.length > 0) {
    conditions.push({
      board: {
        in: boardIds,
      },
    });
  }

  return payload.find({
    collection: "posts",
    where: publishedPostWhere(conditions),
    sort: "-viewCount",
    limit: postCount,
    depth,
  });
}

/**
 * Board posts.
 * Used for board pages, single-board blocks, and board-grid blocks.
 */
export async function getPostsByBoard({
  payload,
  boardId,
  page = 1,
  limit = 20,
  search,
  includeNotices = false,
  depth = 2,
}: BaseOptions & {
  boardId: number;
  page?: number;
  limit?: number;
  search?: string;
  includeNotices?: boolean;
}) {
  const conditions: Where[] = [
    {
      board: {
        equals: boardId,
      },
    },
  ];

  if (!includeNotices) {
    conditions.push({
      isNotice: {
        equals: false,
      },
    });
  }

  const normalizedSearch = search?.trim();

  if (normalizedSearch) {
    conditions.push({
      title: {
        like: normalizedSearch,
      },
    });
  }

  return payload.find({
    collection: "posts",
    where: publishedPostWhere(conditions),
    sort: "-createdAt",
    page,
    limit,
    depth,
  });
}

/**
 * Notice posts for normal list boards.
 */
export async function getNoticePosts({
  payload,
  boardId,
  limit = 5,
  depth = 2,
}: BaseOptions & {
  boardId: number;
  limit?: number;
}) {
  return payload.find({
    collection: "posts",
    where: publishedPostWhere([
      {
        board: {
          equals: boardId,
        },
      },
      {
        isNotice: {
          equals: true,
        },
      },
    ]),
    sort: "-createdAt",
    limit,
    depth,
  });
}

/**
 * Search posts.
 */
export async function searchPosts({
  payload,
  keyword,
  board,
  page = 1,
  limit = 20,
  depth = 2,
}: BaseOptions & {
  keyword: string;
  board?: string;
  page?: number;
  limit?: number;
}) {
  const normalizedKeyword = keyword.trim();

  const conditions: Where[] = [
    {
      isSecret: {
        not_equals: true,
      },
    },
    {
      or: [
        {
          title: {
            like: normalizedKeyword,
          },
        },
        {
          contentHtml: {
            like: normalizedKeyword,
          },
        },
        {
          "tags.tag": {
            like: normalizedKeyword,
          },
        },
      ],
    },
  ];

  if (board) {
    const boardId = Number.parseInt(board, 10);

    if (Number.isInteger(boardId) && boardId > 0) {
      conditions.push({
        board: {
          equals: boardId,
        },
      });
    }
  }

  return payload.find({
    collection: "posts",
    where: publishedPostWhere(conditions),
    sort: "-createdAt",
    page,
    limit,
    depth,
  });
}

/**
 * Posts by author.
 */
export async function getPostsByAuthor({
  payload,
  authorId,
  page = 1,
  limit = 20,
  status = "published",
  includeDeleted = false,
  depth = 2,
}: BaseOptions & {
  authorId: number | string;
  page?: number;
  limit?: number;
  status?: PostStatus;
  includeDeleted?: boolean;
}) {
  const numericAuthorId = normalizeNumericId(authorId, "author ID");

  const conditions: Where[] = [
    {
      author: {
        equals: numericAuthorId,
      },
    },
    {
      status: {
        equals: status,
      },
    },
  ];

  if (status !== "deleted" && !includeDeleted) {
    conditions.push({
      isDeleted: {
        not_equals: true,
      },
    });
  }

  return payload.find({
    collection: "posts",
    where: {
      and: conditions,
    },
    sort: "-updatedAt",
    page,
    limit,
    depth,
  });
}

/**
 * Posts by tag.
 */
export async function getPostsByTag({
  payload,
  tag,
  page = 1,
  limit = 20,
  depth = 2,
}: BaseOptions & {
  tag: string;
  page?: number;
  limit?: number;
}) {
  return payload.find({
    collection: "posts",
    where: publishedPostWhere([
      {
        "tags.tag": {
          equals: tag,
        },
      },
    ]),
    sort: "-createdAt",
    page,
    limit,
    depth,
  });
}

/**
 * Related posts.
 * Priority:
 * 1. Same tag
 * 2. Same board
 */
export async function getRelatedPosts({
  payload,
  post,
  limit = 5,
  depth = 2,
}: BaseOptions & {
  post: Post;
  limit?: number;
}) {
  const boardId = getBoardId(post.board);

  const tags =
    post.tags
      ?.map((item) => item.tag)
      .filter(
        (tag): tag is string => typeof tag === "string" && tag.length > 0,
      ) ?? [];

  if (tags.length > 0) {
    const relatedByTags = await payload.find({
      collection: "posts",
      where: publishedPostWhere([
        {
          isSecret: {
            not_equals: true,
          },
        },
        {
          id: {
            not_equals: post.id,
          },
        },
        {
          "tags.tag": {
            in: tags,
          },
        },
      ]),
      sort: "-createdAt",
      limit,
      depth,
    });

    if (relatedByTags.docs.length >= limit || boardId === undefined) {
      return relatedByTags;
    }

    const existingIds = relatedByTags.docs.map((item) => item.id);

    const remaining = limit - relatedByTags.docs.length;

    const relatedByBoard = await payload.find({
      collection: "posts",
      where: publishedPostWhere([
        {
          isSecret: {
            not_equals: true,
          },
        },
        {
          id: {
            not_in: [post.id, ...existingIds],
          },
        },
        {
          board: {
            equals: boardId,
          },
        },
      ]),
      sort: "-createdAt",
      limit: remaining,
      depth,
    });

    return {
      ...relatedByTags,
      docs: [...relatedByTags.docs, ...relatedByBoard.docs],
      totalDocs: relatedByTags.docs.length + relatedByBoard.docs.length,
    };
  }

  if (boardId === undefined) {
    return {
      docs: [],
      totalDocs: 0,
      totalPages: 0,
      page: 1,
      limit,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
      pagingCounter: 1,
    };
  }

  return payload.find({
    collection: "posts",
    where: publishedPostWhere([
      {
        isSecret: {
          not_equals: true,
        },
      },
      {
        id: {
          not_equals: post.id,
        },
      },
      {
        board: {
          equals: boardId,
        },
      },
    ]),
    sort: "-createdAt",
    limit,
    depth,
  });
}
