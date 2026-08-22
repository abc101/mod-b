import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const SQL_FILE =
  process.env.GNUBOARD_SQL ||
  './scripts/imports/gnuboard.sql'

const OUTPUT_FILE =
  process.env.GNUBOARD_REDIRECT_OUTPUT ||
  './data/gnuboard-redirects.json'

const REPORT_FILE =
  process.env.GNUBOARD_REDIRECT_REPORT ||
  './scripts/imports/gnuboard-redirect-report.json'

function decodeSQLString(value: string) {
  if (value === 'NULL') return null

  if (value.startsWith("'") && value.endsWith("'")) {
    const inner = value.slice(1, -1)

    return inner
      .replace(/\\0/g, '\0')
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\b/g, '\b')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\Z/g, '\x1a')
      .replace(/\\\\/g, '\\')
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value)
  }

  return value
}

function findInsertStatements(sql: string) {
  const inserts: {
    table: string
    values: string
  }[] = []

  let pos = 0

  while (true) {
    const start = sql.indexOf('INSERT INTO `', pos)

    if (start === -1) {
      break
    }

    const tableStart =
      start + 'INSERT INTO `'.length

    const tableEnd =
      sql.indexOf('`', tableStart)

    const table =
      sql.slice(tableStart, tableEnd)

    const valuesKeyword =
      sql.indexOf(
        ' VALUES ',
        tableEnd,
      )

    if (valuesKeyword === -1) {
      break
    }

    let i =
      valuesKeyword +
      ' VALUES '.length

    let inString = false
    let escaped = false

    for (; i < sql.length; i++) {
      const ch = sql[i]

      if (escaped) {
        escaped = false
        continue
      }

      if (
        ch === '\\' &&
        inString
      ) {
        escaped = true
        continue
      }

      if (ch === "'") {
        inString = !inString
        continue
      }

      if (
        ch === ';' &&
        !inString
      ) {
        break
      }
    }

    inserts.push({
      table,
      values: sql.slice(
        valuesKeyword +
          ' VALUES '.length,
        i,
      ),
    })

    pos = i + 1
  }

  return inserts
}

function splitRows(
  values: string,
) {
  const rows: string[] = []

  let start = -1
  let depth = 0
  let inString = false
  let escaped = false

  for (
    let i = 0;
    i < values.length;
    i++
  ) {
    const ch = values[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (
      ch === '\\' &&
      inString
    ) {
      escaped = true
      continue
    }

    if (ch === "'") {
      inString = !inString
      continue
    }

    if (!inString) {
      if (ch === '(') {
        if (depth === 0) {
          start = i + 1
        }

        depth++
      } else if (ch === ')') {
        depth--

        if (
          depth === 0 &&
          start >= 0
        ) {
          rows.push(
            values.slice(
              start,
              i,
            ),
          )
        }
      }
    }
  }

  return rows
}

function splitValues(
  row: string,
) {
  const values: string[] = []

  let start = 0
  let inString = false
  let escaped = false

  for (
    let i = 0;
    i < row.length;
    i++
  ) {
    const ch = row[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (
      ch === '\\' &&
      inString
    ) {
      escaped = true
      continue
    }

    if (ch === "'") {
      inString = !inString
      continue
    }

    if (
      ch === ',' &&
      !inString
    ) {
      values.push(
        row
          .slice(start, i)
          .trim(),
      )

      start = i + 1
    }
  }

  values.push(
    row.slice(start).trim(),
  )

  return values.map(
    decodeSQLString,
  )
}

function getTableColumns(
  sql: string,
  table: string,
) {
  const start =
    sql.indexOf(
      `CREATE TABLE \`${table}\``,
    )

  if (start === -1) {
    return []
  }

  const end =
    sql.indexOf(
      ') ENGINE=',
      start,
    )

  const block =
    sql.slice(
      start,
      end === -1
        ? undefined
        : end,
    )

  return block
    .split('\n')
    .map((line) =>
      line.trim(),
    )
    .filter((line) =>
      line.startsWith('`'),
    )
    .map(
      (line) =>
        line.match(
          /^`([^`]+)`/,
        )?.[1],
    )
    .filter(
      Boolean,
    ) as string[]
}

function parseTable(
  sql: string,
  table: string,
) {
  const columns =
    getTableColumns(
      sql,
      table,
    )

  if (!columns.length) {
    return []
  }

  const inserts =
    findInsertStatements(
      sql,
    ).filter(
      (insert) =>
        insert.table === table,
    )

  const records: any[] = []

  for (const insert of inserts) {
    for (
      const row of splitRows(
        insert.values,
      )
    ) {
      const values =
        splitValues(row)

      const record: any = {}

      columns.forEach(
        (
          column,
          index,
        ) => {
          record[column] =
            values[index]
        },
      )

      records.push(record)
    }
  }

  return records
}

function getWriteTables(
  sql: string,
) {
  const tables =
    new Set<string>()

  const matches =
    sql.matchAll(
      /CREATE TABLE `g5_write_([^`]+)`/g,
    )

  for (const match of matches) {
    tables.add(match[1])
  }

  return [...tables]
}

function slugify(
  value: string,
) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(
      /[^a-z0-9가-힣]+/gi,
      '-',
    )
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function validDate(
  value: any,
) {
  if (
    !value ||
    value ===
      '0000-00-00 00:00:00' ||
    value === '0000-00-00'
  ) {
    return undefined
  }

  const date = new Date(
    String(value).replace(
      ' ',
      'T',
    ),
  )

  return Number.isNaN(
    date.getTime(),
  )
    ? undefined
    : date.toISOString()
}

function normalizeTitle(
  value: unknown,
) {
  return String(value || '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim()
}

function getBoardId(
  board: any,
) {
  if (
    typeof board === 'object' &&
    board?.id
  ) {
    return String(board.id)
  }

  if (board != null) {
    return String(board)
  }

  return ''
}

function buildPostUrl(
  boardSlug: string,
  post: any,
) {
  const postSlug =
    String(
      post.slug || '',
    ).trim() ||
    slugify(
      String(
        post.title || '',
      ),
    )

  const encodedSlug =
    encodeURIComponent(
      postSlug,
    )

  return (
    `/board/${encodeURIComponent(
      boardSlug,
    )}` +
    `/${encodeURIComponent(
      String(post.id),
    )}` +
    `/${encodedSlug}`
  )
}

async function findAllPosts(
  payload: any,
) {
  const docs: any[] = []
  let page = 1

  while (true) {
    const result =
      await payload.find({
        collection: 'posts',
        where: {},
        depth: 1,
        page,
        limit: 1000,
        overrideAccess: true,
      })

    docs.push(
      ...result.docs,
    )

    if (
      !result.hasNextPage
    ) {
      break
    }

    page++
  }

  return docs
}

async function findAllBoards(
  payload: any,
) {
  const docs: any[] = []
  let page = 1

  while (true) {
    const result =
      await payload.find({
        collection: 'boards',
        where: {},
        depth: 0,
        page,
        limit: 1000,
        overrideAccess: true,
      })

    docs.push(
      ...result.docs,
    )

    if (
      !result.hasNextPage
    ) {
      break
    }

    page++
  }

  return docs
}

async function main() {
  const sqlPath =
    path.resolve(
      SQL_FILE,
    )

  if (
    !fs.existsSync(sqlPath)
  ) {
    throw new Error(
      `SQL file not found: ${sqlPath}`,
    )
  }

  console.log(
    `Gnuboard SQL: ${sqlPath}`,
  )

  const sql =
    fs.readFileSync(
      sqlPath,
      'utf8',
    )

  const payload =
    await getPayload({
      config:
        configPromise,
    })

  const boards =
    await findAllBoards(
      payload,
    )

  const posts =
    await findAllPosts(
      payload,
    )

  const boardBySlug =
    new Map<
      string,
      any
    >()

  const boardSlugById =
    new Map<
      string,
      string
    >()

  for (
    const board of boards
  ) {
    const slug =
      String(
        board.slug || '',
      )

    if (!slug) {
      continue
    }

    boardBySlug.set(
      slug,
      board,
    )

    boardSlugById.set(
      String(board.id),
      slug,
    )
  }

  const postsByBoard =
    new Map<
      string,
      any[]
    >()

  for (
    const post of posts
  ) {
    const boardId =
      getBoardId(
        post.board,
      )

    if (!boardId) {
      continue
    }

    const list =
      postsByBoard.get(
        boardId,
      ) || []

    list.push(post)

    postsByBoard.set(
      boardId,
      list,
    )
  }

  const redirects:
    Record<
      string,
      string
    > = {}

  const matched: any[] = []
  const ambiguous: any[] = []
  const unmatched: any[] = []

  const writeTables =
    getWriteTables(sql)

  for (
    const table of writeTables
  ) {
    const boardSlug =
      slugify(table)

    const board =
      boardBySlug.get(
        boardSlug,
      )

    if (!board) {
      unmatched.push({
        type: 'board',
        table,
        reason:
          'Board not found',
      })

      continue
    }

    const boardPosts =
      postsByBoard.get(
        String(
          board.id,
        ),
      ) || []

    const rows =
      parseTable(
        sql,
        `g5_write_${table}`,
      )

    const sourcePosts =
      rows.filter(
        (row) =>
          Number(
            row.wr_is_comment ||
              0,
          ) === 0,
      )

    for (
      const row of sourcePosts
    ) {
      const wrId =
        String(row.wr_id)

      const title =
        normalizeTitle(
          row.wr_subject,
        )

      const sourceDate =
        validDate(
          row.wr_datetime,
        )

      const titleMatches =
        boardPosts.filter(
          (post) =>
            normalizeTitle(
              post.title,
            ) === title,
        )

      let candidates =
        titleMatches

      if (
        sourceDate &&
        titleMatches.length >
          1
      ) {
        candidates =
          titleMatches.filter(
            (post) =>
              String(
                post.createdAt ||
                  '',
              ) === sourceDate,
          )
      }

      /*
       * If exact title only
       * produces one result,
       * accept it.
       *
       * This matches the
       * fallback behavior used
       * by import-gnuboard.ts.
       */
      if (
        candidates.length ===
          1
      ) {
        const post =
          candidates[0]

        const target =
          buildPostUrl(
            boardSlug,
            post,
          )

        const key =
          `${table}:${wrId}`

        redirects[key] =
          target

        matched.push({
          key,
          title,
          target,
          postId:
            post.id,
          sourceDate,
          currentDate:
            post.createdAt,
        })

        continue
      }

      /*
       * If title matched more
       * than once, try exact
       * createdAt.
       */
      if (
        titleMatches.length >
          1 &&
        sourceDate
      ) {
        const exactDate =
          titleMatches.filter(
            (post) =>
              String(
                post.createdAt ||
                  '',
              ) === sourceDate,
          )

        if (
          exactDate.length ===
            1
        ) {
          const post =
            exactDate[0]

          const target =
            buildPostUrl(
              boardSlug,
              post,
            )

          const key =
            `${table}:${wrId}`

          redirects[key] =
            target

          matched.push({
            key,
            title,
            target,
            postId:
              post.id,
            sourceDate,
            currentDate:
              post.createdAt,
          })

          continue
        }
      }

      if (
        titleMatches.length >
          0
      ) {
        ambiguous.push({
          table,
          wrId,
          title,
          sourceDate,
          candidates:
            titleMatches.map(
              (post) => ({
                id: post.id,
                title:
                  post.title,
                createdAt:
                  post.createdAt,
              }),
            ),
        })
      } else {
        unmatched.push({
          type: 'post',
          table,
          wrId,
          title,
          sourceDate,
          reason:
            'No matching title in current board',
        })
      }
    }
  }

  const outputPath =
    path.resolve(
      OUTPUT_FILE,
    )

  fs.mkdirSync(
    path.dirname(
      outputPath,
    ),
    {
      recursive: true,
    },
  )

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      redirects,
      null,
      2,
    ) + '\n',
    'utf8',
  )

  const reportPath =
    path.resolve(
      REPORT_FILE,
    )

  fs.mkdirSync(
    path.dirname(
      reportPath,
    ),
    {
      recursive: true,
    },
  )

  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt:
          new Date()
            .toISOString(),
        summary: {
          matched:
            matched.length,
          ambiguous:
            ambiguous.length,
          unmatched:
            unmatched.length,
        },
        matched,
        ambiguous,
        unmatched,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )

  console.log('')
  console.log(
    '===== REDIRECT SUMMARY =====',
  )

  console.log(
    `Matched: ${matched.length}`,
  )

  console.log(
    `Ambiguous: ${ambiguous.length}`,
  )

  console.log(
    `Unmatched: ${unmatched.length}`,
  )

  console.log('')
  console.log(
    `Redirect map: ${outputPath}`,
  )

  console.log(
    `Report: ${reportPath}`,
  )

  if (
    ambiguous.length >
      0 ||
    unmatched.length > 0
  ) {
    console.log('')
    console.log(
      '⚠️ Review the report before enabling redirects.',
    )
  } else {
    console.log('')
    console.log(
      '✅ All legacy posts were matched.',
    )
  }
}

main().catch(
  (error) => {
    console.error(
      '❌ Failed to generate Gnuboard redirects:',
      error,
    )

    process.exit(1)
  },
)