import fs from "fs"
import path from "path"
import crypto from "crypto"
import { getPayload } from "payload"
import configPromise from "@payload-config"

const SQL_FILE = process.env.GNUBOARD_SQL || "./scripts/imports/gnuboard.sql"
const GNUBOARD_DATA_DIR =
  process.env.GNUBOARD_DATA_DIR || "./scripts/imports/gnuboard/data"

const RESET = process.argv.includes("--reset")
const VERIFY = process.argv.includes("--verify")
const DRY_RUN = process.argv.includes("--dry-run")

const TEMP_PASSWORD = crypto.randomBytes(16).toString('base64url')

const DEFAULT_ADMIN_EMAIL =
  process.env.GNUBOARD_ADMIN_EMAIL || "admin@mod-b.local"
const MAX_FIND_LIMIT = Number(process.env.GNUBOARD_FIND_LIMIT || 10000)

const BOARD_TYPE_MAP: Record<
  string,
  "list" | "card" | "gallery" | "notice" | "qna"
> = {
  notice: "notice",
  qa: "qna",
  qna: "qna",
}

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
  ".avif",
])

function decodeSQLString(value: string) {
  if (value === "NULL") return null

  if (value.startsWith("'") && value.endsWith("'")) {
    const inner = value.slice(1, -1)
    return inner
      .replace(/\\0/g, "\0")
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\b/g, "\b")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\Z/g, "\x1a")
      .replace(/\\\\/g, "\\")
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  return value
}

function findInsertStatements(sql: string) {
  const inserts: { table: string; values: string }[] = []
  let pos = 0

  while (true) {
    const start = sql.indexOf("INSERT INTO `", pos)
    if (start === -1) break

    const tableStart = start + "INSERT INTO `".length
    const tableEnd = sql.indexOf("`", tableStart)
    const table = sql.slice(tableStart, tableEnd)

    const valuesKeyword = sql.indexOf(" VALUES ", tableEnd)
    if (valuesKeyword === -1) break

    let i = valuesKeyword + " VALUES ".length
    let inString = false
    let escaped = false

    for (; i < sql.length; i++) {
      const ch = sql[i]

      if (escaped) {
        escaped = false
        continue
      }

      if (ch === "\\" && inString) {
        escaped = true
        continue
      }

      if (ch === "'") {
        inString = !inString
        continue
      }

      if (ch === ";" && !inString) break
    }

    inserts.push({
      table,
      values: sql.slice(valuesKeyword + " VALUES ".length, i),
    })
    pos = i + 1
  }

  return inserts
}

function splitRows(values: string) {
  const rows: string[] = []
  let start = -1
  let depth = 0
  let inString = false
  let escaped = false

  for (let i = 0; i < values.length; i++) {
    const ch = values[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (ch === "\\" && inString) {
      escaped = true
      continue
    }

    if (ch === "'") {
      inString = !inString
      continue
    }

    if (!inString) {
      if (ch === "(") {
        if (depth === 0) start = i + 1
        depth++
      } else if (ch === ")") {
        depth--
        if (depth === 0 && start >= 0) rows.push(values.slice(start, i))
      }
    }
  }

  return rows
}

function splitValues(row: string) {
  const values: string[] = []
  let start = 0
  let inString = false
  let escaped = false

  for (let i = 0; i < row.length; i++) {
    const ch = row[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (ch === "\\" && inString) {
      escaped = true
      continue
    }

    if (ch === "'") {
      inString = !inString
      continue
    }

    if (ch === "," && !inString) {
      values.push(row.slice(start, i).trim())
      start = i + 1
    }
  }

  values.push(row.slice(start).trim())
  return values.map(decodeSQLString)
}

function getTableColumns(sql: string, table: string) {
  const start = sql.indexOf(`CREATE TABLE \`${table}\``)
  if (start === -1) return []

  const end = sql.indexOf(") ENGINE=", start)
  const block = sql.slice(start, end === -1 ? undefined : end)

  return block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("`"))
    .map((line) => line.match(/^`([^`]+)`/)?.[1])
    .filter(Boolean) as string[]
}

function parseTable(sql: string, table: string) {
  const columns = getTableColumns(sql, table)
  if (!columns.length) return []

  const inserts = findInsertStatements(sql).filter(
    (insert) => insert.table === table,
  )
  const records: any[] = []

  for (const insert of inserts) {
    for (const row of splitRows(insert.values)) {
      const values = splitValues(row)
      const record: any = {}

      columns.forEach((column, index) => {
        record[column] = values[index]
      })

      records.push(record)
    }
  }

  return records
}

function getWriteTables(sql: string) {
  const tables = new Set<string>()
  const matches = sql.matchAll(/CREATE TABLE `g5_write_([^`]+)`/g)
  for (const match of matches) tables.add(match[1])
  return [...tables]
}

function stripHtml(html: string) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function lexicalFromText(text: string) {
  const paragraphs = String(text || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: (paragraphs.length ? paragraphs : [""]).map((paragraph) => ({
        type: "paragraph",
        format: "" as const,
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text: paragraph,
            format: 0,
            style: "",
            mode: "normal",
            detail: 0,
            version: 1,
          },
        ],
      })),
    },
  }
}

function validDate(value: any) {
  if (!value || value === "0000-00-00 00:00:00" || value === "0000-00-00")
    return undefined
  const date = new Date(String(value).replace(" ", "T"))
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function slugify(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function hasField(payload: any, collection: string, name: string) {
  const fields = payload.collections?.[collection]?.config?.fields || []
  return fields.some((field: any) => field?.name === name)
}

async function findAll(
  payload: any,
  collection: string,
  where: any,
  depth = 0,
) {
  const docs: any[] = []
  let page = 1

  while (true) {
    const result = await payload.find({
      collection,
      where,
      depth,
      page,
      limit: MAX_FIND_LIMIT,
      overrideAccess: true,
    })

    docs.push(...result.docs)
    if (!result.hasNextPage) break
    page++
  }

  return docs
}

async function deleteWhere(payload: any, collection: string, where: any) {
  try {
    await payload.delete({ collection, where, overrideAccess: true })
  } catch (error: any) {
    console.log(`Skip delete ${collection}:`, error?.message || error)
  }
}

async function upsertUser(payload: any, userData: any) {
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: userData.email } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    if (DRY_RUN) return existing.docs[0]

    return payload.update({
      collection: "users",
      id: existing.docs[0].id,
      data: userData,
      overrideAccess: true,
    })
  }

  if (DRY_RUN) return { id: `dry-user-${userData.email}`, ...userData }

  return payload.create({
    collection: "users",
    data: userData,
    overrideAccess: true,
  })
}

async function upsertBoard(payload: any, data: any) {
  const existing = await payload.find({
    collection: "boards",
    where: { slug: { equals: data.slug } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    if (DRY_RUN) return existing.docs[0]
    return payload.update({
      collection: "boards",
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    })
  }

  if (DRY_RUN) return { id: `dry-board-${data.slug}`, ...data }
  return payload.create({ collection: "boards", data, overrideAccess: true })
}

function guessBoardType(
  board: any,
): "list" | "card" | "gallery" | "notice" | "qna" {
  const table = String(board.bo_table || "").toLowerCase()
  const subject = String(board.bo_subject || "").toLowerCase()
  const skin = String(board.bo_skin || "").toLowerCase()

  if (BOARD_TYPE_MAP[table]) return BOARD_TYPE_MAP[table]
  if (
    table.includes("notice") ||
    subject.includes("notice") ||
    subject.includes("공지")
  )
    return "notice"
  if (
    table.includes("qa") ||
    table.includes("qna") ||
    subject.includes("q&a") ||
    subject.includes("질문")
  )
    return "qna"
  if (
    skin.includes("gallery") ||
    table.includes("gallery") ||
    Number(board.bo_gallery_cols || 0) > 0
  )
    return "gallery"
  return "list"
}

function normalizeUrlValue(value: string) {
  return String(value || "")
    .trim()
    .replace(/&amp;/g, "&")
}

function decodeUrlPathname(urlValue: string) {
  try {
    return decodeURIComponent(urlValue)
  } catch {
    return urlValue
  }
}

function isExternalButNotDataUrl(urlValue: string) {
  const value = normalizeUrlValue(urlValue)
  if (!/^https?:\/\//i.test(value)) return false

  try {
    const parsed = new URL(value)
    return !parsed.pathname.includes("/data/")
  } catch {
    return false
  }
}

function extractDataRelativePath(urlValue: string) {
  let value = normalizeUrlValue(urlValue)
  if (
    !value ||
    value.startsWith("data:") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  )
    return null
  if (isExternalButNotDataUrl(value)) return null

  try {
    if (/^https?:\/\//i.test(value)) {
      const parsed = new URL(value)
      value = parsed.pathname
    }
  } catch {
    // keep original value
  }

  value = value.split("?")[0].split("#")[0]
  value = decodeUrlPathname(value)
  value = value.replace(/\\/g, "/")

  const dataIndex = value.indexOf("/data/")
  if (dataIndex >= 0) value = value.slice(dataIndex + "/data/".length)
  else if (value.startsWith("data/")) value = value.slice("data/".length)
  else if (value.startsWith("/data/")) value = value.slice("/data/".length)
  else return null

  value = value.replace(/^\/+/, "")
  if (!value || value.includes("..")) return null

  return value
}

function candidatePathsForDataRelativePath(dataRelativePath: string) {
  const base = path.resolve(GNUBOARD_DATA_DIR)
  const clean = dataRelativePath.replace(/^\/+/, "")

  const candidates = [
    path.join(base, clean),
    path.join(process.cwd(), "data", clean),
  ]

  return [...new Set(candidates)]
}

function findLocalFileFromUrl(urlValue: string) {
  const relative = extractDataRelativePath(urlValue)
  if (!relative) return null

  for (const candidate of candidatePathsForDataRelativePath(relative)) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return { filePath: candidate, relative }
    }
  }

  return { filePath: null, relative }
}

function fileHash(filePath: string) {
  const stat = fs.statSync(filePath)
  return `${path.resolve(filePath)}:${stat.size}:${stat.mtimeMs}`
}

function isImageFile(filePathOrUrl: string) {
  const ext = path
    .extname(filePathOrUrl.split("?")[0].split("#")[0])
    .toLowerCase()
  return IMAGE_EXTENSIONS.has(ext)
}

function extractDataUrlsFromHtml(html: string) {
  const urls = new Set<string>()
  const attrRegex = /\b(src|href)=(['"])(.*?)\2/gi
  for (const match of html.matchAll(attrRegex)) {
    const url = match[3]
    if (extractDataRelativePath(url)) urls.add(url)
  }
  return [...urls]
}

function extractPayloadMediaUrlsFromHtml(html: string) {
  const urls = new Set<string>()
  const attrRegex = /\b(src|href)=(['"])(.*?)\2/gi
  for (const match of html.matchAll(attrRegex)) {
    const url = normalizeUrlValue(match[3])
    if (url.includes("/api/media/file/") || url.includes("/media/"))
      urls.add(url.split("?")[0].split("#")[0])
  }
  return [...urls]
}

const uploadedMediaCache = new Map<string, any>()
const missingFileWarnings = new Set<string>()
let uploadedMediaCount = 0
let reusedMediaCount = 0
let replacedUrlCount = 0
let missingFileCount = 0

async function findExistingMediaForFile(
  payload: any,
  filePath: string,
  relative?: string,
) {
  const filename = path.basename(filePath)
  const alt = relative ? `[gnuboard] ${relative}` : undefined

  if (alt) {
    const byAlt = await payload.find({
      collection: "media",
      where: { alt: { equals: alt } },
      limit: 1,
      overrideAccess: true,
    })
    if (byAlt.docs[0]) return byAlt.docs[0]
  }

  const byFilename = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })

  return byFilename.docs[0] || null
}

async function uploadLocalFileToMedia(
  payload: any,
  filePath: string,
  relative?: string,
) {
  const key = fileHash(filePath)
  const cached = uploadedMediaCache.get(key)
  if (cached) return cached

  if (DRY_RUN) {
    const fake = {
      id: `dry-media-${crypto.createHash("md5").update(filePath).digest("hex").slice(0, 10)}`,
      url: `/media/dry-run/${path.basename(filePath)}`,
      filename: path.basename(filePath),
    }
    uploadedMediaCache.set(key, fake)
    return fake
  }

  const existing = await findExistingMediaForFile(payload, filePath, relative)
  if (existing) {
    uploadedMediaCache.set(key, existing)
    reusedMediaCount++
    return existing
  }

  const media = await payload.create({
    collection: "media",
    data: {
      alt: relative ? `[gnuboard] ${relative}` : path.basename(filePath),
    },
    filePath,
    overrideAccess: true,
  })

  uploadedMediaCache.set(key, media)
  uploadedMediaCount++
  return media
}

async function convertHtmlDataUrlsToMedia(payload: any, html: string) {
  if (!html) {
    return {
      html,
      media: [] as any[],
      firstImage: null as any | null,
    }
  }

  const foundMedia: any[] = []
  let firstImage: any | null = null
  const replacements = new Map<string, string>()

  const attrRegex = /\b(src|href)=(['"])(.*?)\2/gi
  const matches = [...html.matchAll(attrRegex)]

  for (const match of matches) {
    const attr = match[1]
    const originalUrl = match[3]
    if (!originalUrl) continue
    if (replacements.has(originalUrl)) continue

    const local = findLocalFileFromUrl(originalUrl)
    if (!local?.filePath) {
      if (local?.relative && !missingFileWarnings.has(local.relative)) {
        missingFileWarnings.add(local.relative)
        missingFileCount++
        console.warn(`Missing file for ${attr}: ${local.relative}`)
      }
      continue
    }

    const media = await uploadLocalFileToMedia(
      payload,
      local.filePath,
      local.relative,
    )
    if (media?.url) {
      replacements.set(originalUrl, media.url)
      foundMedia.push(media)
      replacedUrlCount++

      if (!firstImage && isImageFile(local.filePath)) {
        firstImage = media
      }
    }
  }

  let convertedHtml = html
  for (const [from, to] of replacements) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    convertedHtml = convertedHtml.replace(new RegExp(escaped, "g"), to)
  }

  return {
    html: convertedHtml,
    media: foundMedia,
    firstImage,
  }
}

async function uploadGnuboardAttachment(payload: any, fileRecord: any) {
  const table = String(fileRecord.bo_table || "")
  const storedFileName = String(fileRecord.bf_file || "").trim()
  if (!table || !storedFileName) return null

  const candidates = [
    path.join(path.resolve(GNUBOARD_DATA_DIR), "file", table, storedFileName),
    path.join(
      path.resolve(GNUBOARD_DATA_DIR),
      "file",
      slugify(table),
      storedFileName,
    ),
  ]

  const localFile = candidates.find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  )
  if (!localFile) {
    const key = `file/${table}/${storedFileName}`
    if (!missingFileWarnings.has(key)) {
      missingFileWarnings.add(key)
      missingFileCount++
      console.warn(`Missing attachment: ${key}`)
    }
    return null
  }

  return uploadLocalFileToMedia(
    payload,
    localFile,
    `file/${table}/${storedFileName}`,
  )
}

function groupBoardFiles(boardFiles: any[]) {
  const map = new Map<string, any[]>()

  for (const file of boardFiles) {
    const table = String(file.bo_table || "")
    const wrId = String(file.wr_id || "")
    if (!table || !wrId || !file.bf_file) continue

    const key = `${table}:${wrId}`
    const list = map.get(key) || []
    list.push(file)
    map.set(key, list)
  }

  return map
}

function getPostAttachmentArray(mediaList: any[]) {
  return mediaList
    .filter((media) => media?.id)
    .map((media) => ({ file: media.id }))
}

async function findExistingPost(
  payload: any,
  boardId: any,
  row: any,
  legacyKey: string,
  canUseLegacyId: boolean,
) {
  if (canUseLegacyId) {
    const byLegacy = await payload.find({
      collection: "posts",
      where: { legacyId: { equals: legacyKey } },
      limit: 1,
      overrideAccess: true,
    })
    if (byLegacy.docs[0]) return byLegacy.docs[0]
  }

  const byFallback = await payload.find({
    collection: "posts",
    where: {
      and: [
        { board: { equals: boardId } },
        { title: { equals: row.wr_subject || "(Untitled)" } },
        ...(validDate(row.wr_datetime)
          ? [{ createdAt: { equals: validDate(row.wr_datetime) } }]
          : []),
      ],
    },
    limit: 1,
    overrideAccess: true,
  })

  return byFallback.docs[0] || null
}

async function upsertPost(
  payload: any,
  data: any,
  boardId: any,
  row: any,
  legacyKey: string,
  canUseLegacyId: boolean,
) {
  const existing = await findExistingPost(
    payload,
    boardId,
    row,
    legacyKey,
    canUseLegacyId,
  )

  if (existing) {
    if (DRY_RUN) return existing

    return payload.update({
      collection: "posts",
      id: existing.id,
      data,
      overrideAccess: true,
    })
  }

  if (DRY_RUN) return { id: `dry-post-${legacyKey}`, ...data }

  return payload.create({
    collection: "posts",
    data,
    overrideAccess: true,
  })
}

function getImportData(sql: string) {
  const g5Boards = parseTable(sql, "g5_board")
  const g5Members = parseTable(sql, "g5_member")
  const g5BoardFiles = parseTable(sql, "g5_board_file")
  const writeTables = getWriteTables(sql)
  const boardFilesByPost = groupBoardFiles(g5BoardFiles)

  return { g5Boards, g5Members, g5BoardFiles, writeTables, boardFilesByPost }
}

async function resetImportedData(payload: any, importedSlugs: string[]) {
  console.log("Resetting imported data...")

  const existingBoards = await findAll(payload, "boards", {
    slug: { in: importedSlugs },
  })
  const boardIds = existingBoards.map((board: any) => board.id)

  if (!boardIds.length) {
    console.log("No imported boards found to reset.")
    return
  }

  if (DRY_RUN) {
    console.log(
      `[dry-run] Would delete posts/comments/boards for ${boardIds.length} boards.`,
    )
    return
  }

  await deleteWhere(payload, "comments", {
    content: { contains: "[gnuboard]" },
  })
  await deleteWhere(payload, "posts", { board: { in: boardIds } })
  await deleteWhere(payload, "boards", { id: { in: boardIds } })
}

async function runImport() {
  const sqlPath = path.resolve(SQL_FILE)
  const dataDir = path.resolve(GNUBOARD_DATA_DIR)

  if (!fs.existsSync(sqlPath))
    throw new Error(`SQL file not found: ${sqlPath}`)

  const sql = fs.readFileSync(sqlPath, "utf8")
  const payload = await getPayload({ config: configPromise })
  const { g5Boards, g5Members, g5BoardFiles, writeTables, boardFilesByPost } =
    getImportData(sql)

  console.log("Gnuboard SQL:", sqlPath)
  console.log("Gnuboard data dir:", dataDir)
  console.log("Mode:", RESET ? "reset + import" : "incremental import")
  console.log("Dry run:", DRY_RUN)

  if (!fs.existsSync(dataDir)) {
    console.warn(
      `⚠️ Data directory not found. HTML will be imported, but images/files cannot be copied: ${dataDir}`,
    )
  }

  console.log(
    `Found ${g5Boards.length} boards, ${g5Members.length} members, ${writeTables.length} write tables, ${g5BoardFiles.length} file records.`,
  )

  const importedSlugs = writeTables.map((table) => slugify(table))
  if (RESET) await resetImportedData(payload, importedSlugs)

  const userByMbId = new Map<string, any>()

  const adminUser = await upsertUser(payload, {
    email: DEFAULT_ADMIN_EMAIL,
    password: TEMP_PASSWORD,
    name: "Gnuboard Import Admin",
    nickname: "gnuboardAdmin",
    role: "admin",
    isActive: true,
    emailVerified: true,
    termsAccepted: true,
    profileCompleted: true,
  })

  for (const member of g5Members) {
    const mbId = String(member.mb_id || "").trim()
    if (!mbId) continue

    const email = String(member.mb_email || "").includes("@")
      ? String(member.mb_email).trim()
      : `${mbId}@gnuboard.local`

    const role =
      Number(member.mb_level || 0) >= 10
        ? "admin"
        : Number(member.mb_level || 0) >= 8
          ? "manager"
          : "member"

    const user = await upsertUser(payload, {
      email,
      password: TEMP_PASSWORD,
      name: member.mb_name || member.mb_nick || mbId,
      nickname: member.mb_nick || mbId,
      role,
      isActive: !member.mb_leave_date && !member.mb_intercept_date,
      emailVerified: true,
      termsAccepted: true,
      profileCompleted: true,
      bio: member.mb_profile || undefined,
      createdAt: validDate(member.mb_datetime),
    })

    userByMbId.set(mbId, user)
  }

  const boardByTable = new Map<string, any>()

  for (const g5Board of g5Boards) {
    const table = String(g5Board.bo_table || "").trim()
    if (!table || !writeTables.includes(table)) continue

    const boardType = guessBoardType(g5Board)
    const slug = slugify(table)

    const board = await upsertBoard(payload, {
      name: g5Board.bo_subject || table,
      slug,
      description: stripHtml(g5Board.bo_content_head || ""),
      boardType,
      order: Number(g5Board.bo_order || 0),
      isActive: true,
      listSettings: {
        postsPerPage: Number(g5Board.bo_page_rows || 20) || 20,
        showThumbnail: boardType === "gallery",
        showAuthor: true,
        showViewCount: true,
      },
      writeSettings: {
        allowWrite:
          Number(g5Board.bo_write_level || 0) >= 10 ? "admin" : "member",
        allowComment: boardType !== "notice",
        allowCommentWrite:
          Number(g5Board.bo_comment_level || 0) >= 10 ? "admin" : "member",
        allowAnonymous: false,
        allowAttachment: Number(g5Board.bo_upload_count || 0) > 0,
        maxAttachments: Number(g5Board.bo_upload_count || 0) || 5,
      },
      skinSettings: {
        gridColumns: String(g5Board.bo_gallery_cols || 3),
      },
      managerEnabled: true,
    })

    boardByTable.set(table, board)
    console.log(`Board: ${table} -> ${board.slug} (${boardType})`)
  }

  const postHasContentHtml = hasField(payload, "posts", "contentHtml")
  const postHasUseHtmlContent = hasField(payload, "posts", "useHtmlContent")
  const postHasLegacySource = hasField(payload, "posts", "legacySource")
  const postHasLegacyId = hasField(payload, "posts", "legacyId")
  const postHasCategory = hasField(payload, "posts", "category")
  const postHasLikeCount = hasField(payload, "posts", "likeCount")
  const postHasDislikeCount = hasField(payload, "posts", "dislikeCount")
  const postHasAttachments = hasField(payload, "posts", "attachments")
  const postHasThumbnail = hasField(payload, "posts", "thumbnail")

  const postByLegacyKey = new Map<string, any>()
  let postCount = 0
  let createdPostCount = 0
  let updatedPostCount = 0
  let commentCount = 0
  let attachmentCount = 0

  for (const table of writeTables) {
    const board = boardByTable.get(table)
    if (!board) continue

    const rows = parseTable(sql, `g5_write_${table}`)
    const posts = rows.filter((row) => Number(row.wr_is_comment || 0) === 0)
    const comments = rows.filter((row) => Number(row.wr_is_comment || 0) > 0)

    for (const row of posts) {
      const legacyKey = `${table}:${row.wr_id}`
      const mbId = String(row.mb_id || "").trim()
      const author = userByMbId.get(mbId) || adminUser
      const originalHtml = String(row.wr_content || "")
      const converted = await convertHtmlDataUrlsToMedia(payload, originalHtml)
      const html = converted.html
      const text = stripHtml(html)

      const attachedFiles = boardFilesByPost.get(`${table}:${row.wr_id}`) || []
      const uploadedAttachments: any[] = []

      for (const fileRecord of attachedFiles) {
        const media = await uploadGnuboardAttachment(payload, fileRecord)
        if (media) {
          uploadedAttachments.push(media)
          attachmentCount++
        }
      }

      const thumbnail =
        converted.firstImage ||
        uploadedAttachments.find(
          (media) => media?.url && isImageFile(media.url),
        ) ||
        null

      const data: any = {
        title: row.wr_subject || "(Untitled)",
        content: lexicalFromText(text),
        board: board.id,
        author: author.id,
        anonymousAuthor: row.wr_name || undefined,
        status: "published",
        viewCount: Number(row.wr_hit || 0),
        isNotice: board.boardType === "notice",
        isAnswered:
          board.boardType === "qna"
            ? Number(row.wr_comment || 0) > 0
            : undefined,
        createdAt: validDate(row.wr_datetime),
        updatedAt: validDate(row.wr_last) || validDate(row.wr_datetime),
      }

      if (postHasContentHtml) data.contentHtml = html
      if (postHasUseHtmlContent) data.useHtmlContent = true
      if (postHasLegacySource) data.legacySource = "gnuboard5"
      if (postHasLegacyId) data.legacyId = legacyKey
      if (postHasCategory && row.ca_name) data.category = row.ca_name
      if (postHasLikeCount) data.likeCount = Number(row.wr_good || 0)
      if (postHasDislikeCount) data.dislikeCount = Number(row.wr_nogood || 0)
      if (postHasThumbnail && thumbnail?.id) data.thumbnail = thumbnail.id
      if (postHasAttachments && uploadedAttachments.length > 0)
        data.attachments = getPostAttachmentArray(uploadedAttachments)

      const existing = await findExistingPost(
        payload,
        board.id,
        row,
        legacyKey,
        postHasLegacyId,
      )
      const saved = await upsertPost(
        payload,
        data,
        board.id,
        row,
        legacyKey,
        postHasLegacyId,
      )

      if (existing) updatedPostCount++
      else createdPostCount++

      postByLegacyKey.set(legacyKey, saved)
      postCount++

      if (!DRY_RUN && saved?.id) {
        await deleteWhere(payload, "comments", {
          and: [
            { post: { equals: saved.id } },
            { content: { contains: "[gnuboard]" } },
          ],
        })
      }
    }

    for (const row of comments) {
      const parent = postByLegacyKey.get(`${table}:${row.wr_parent}`)
      if (!parent) continue

      const mbId = String(row.mb_id || "").trim()
      const author = userByMbId.get(mbId) || adminUser
      const html = String(row.wr_content || "")
      const text = stripHtml(html)

      if (!DRY_RUN) {
        await payload.create({
          collection: "comments",
          data: {
            post: parent.id,
            author: author.id,
            anonymousAuthor: row.wr_name || undefined,
            content: `[gnuboard] ${text}`,
            createdAt: validDate(row.wr_datetime),
            updatedAt: validDate(row.wr_datetime),
          },
          overrideAccess: true,
        })
      }

      commentCount++
    }

    console.log(
      `Imported ${table}: ${posts.length} posts, ${comments.length} comments`,
    )
  }

  console.log("✅ Gnuboard import complete")
  console.log(`Boards: ${boardByTable.size}`)
  console.log(`Users: ${userByMbId.size}`)
  console.log(`Posts processed: ${postCount}`)
  console.log(`Posts created: ${createdPostCount}`)
  console.log(`Posts updated: ${updatedPostCount}`)
  console.log(`Comments recreated: ${commentCount}`)
  console.log(`Uploaded media: ${uploadedMediaCount}`)
  console.log(`Reused media: ${reusedMediaCount}`)
  console.log(`Uploaded attachments: ${attachmentCount}`)
  console.log(`Replaced HTML URLs: ${replacedUrlCount}`)
  console.log(`Missing files: ${missingFileCount}`)
  console.log(`Temporary password for imported users: ${TEMP_PASSWORD}`)
}

async function runVerify() {
  const sqlPath = path.resolve(SQL_FILE)
  const dataDir = path.resolve(GNUBOARD_DATA_DIR)

  if (!fs.existsSync(sqlPath))
    throw new Error(`SQL file not found: ${sqlPath}`)

  const sql = fs.readFileSync(sqlPath, "utf8")
  const payload = await getPayload({ config: configPromise })
  const { g5Boards, g5BoardFiles, writeTables } = getImportData(sql)

  console.log("🔎 Gnuboard migration verification")
  console.log("Gnuboard SQL:", sqlPath)
  console.log("Gnuboard data dir:", dataDir)

  const expectedBoardSlugs = writeTables.map((table) => slugify(table))
  const expectedPostCountByTable = new Map<string, number>()
  const expectedCommentCountByTable = new Map<string, number>()
  const missingLocalFiles: string[] = []
  const htmlDataRefs: { table: string; wrId: any; relative: string }[] = []

  for (const table of writeTables) {
    const rows = parseTable(sql, `g5_write_${table}`)
    const posts = rows.filter((row) => Number(row.wr_is_comment || 0) === 0)
    const comments = rows.filter((row) => Number(row.wr_is_comment || 0) > 0)

    expectedPostCountByTable.set(table, posts.length)
    expectedCommentCountByTable.set(table, comments.length)

    for (const row of posts) {
      const html = String(row.wr_content || "")
      for (const url of extractDataUrlsFromHtml(html)) {
        const local = findLocalFileFromUrl(url)
        if (local?.relative) {
          htmlDataRefs.push({
            table,
            wrId: row.wr_id,
            relative: local.relative,
          })
          if (!local.filePath)
            missingLocalFiles.push(
              `${table}:${row.wr_id} -> ${local.relative}`,
            )
        }
      }
    }
  }

  for (const file of g5BoardFiles) {
    const table = String(file.bo_table || "")
    const storedFileName = String(file.bf_file || "").trim()
    if (!table || !storedFileName) continue

    const candidates = [
      path.join(path.resolve(GNUBOARD_DATA_DIR), "file", table, storedFileName),
      path.join(
        path.resolve(GNUBOARD_DATA_DIR),
        "file",
        slugify(table),
        storedFileName,
      ),
    ]

    const exists = candidates.some(
      (candidate) =>
        fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
    )
    if (!exists)
      missingLocalFiles.push(
        `attachment ${table}:${file.wr_id} -> file/${table}/${storedFileName}`,
      )
  }

  const boards = await findAll(payload, "boards", {
    slug: { in: expectedBoardSlugs },
  })
  const boardBySlug = new Map(boards.map((board: any) => [board.slug, board]))
  const missingBoards = expectedBoardSlugs.filter(
    (slug) => !boardBySlug.has(slug),
  )

  const postHasLegacyId = hasField(payload, "posts", "legacyId")
  const postHasLegacySource = hasField(payload, "posts", "legacySource")
  const postHasContentHtml = hasField(payload, "posts", "contentHtml")
  const postHasAttachments = hasField(payload, "posts", "attachments")
  const postHasThumbnail = hasField(payload, "posts", "thumbnail")

  const boardIds = boards.map((board: any) => board.id)
  const importedPosts = boardIds.length
    ? await findAll(
        payload,
        "posts",
        postHasLegacySource
          ? { legacySource: { equals: "gnuboard5" } }
          : { board: { in: boardIds } },
        2,
      )
    : []

  const expectedTotalPosts = [...expectedPostCountByTable.values()].reduce(
    (a, b) => a + b,
    0,
  )
  const expectedTotalComments = [
    ...expectedCommentCountByTable.values(),
  ].reduce((a, b) => a + b, 0)

  const postsByLegacy = new Map<string, any[]>()
  const duplicateLegacyIds: string[] = []
  const missingPosts: string[] = []
  const unconvertedHtmlLinks: string[] = []
  const referencedMediaUrls = new Set<string>()
  const referencedMediaIds = new Set<string>()

  if (postHasLegacyId) {
    for (const post of importedPosts) {
      if (!post.legacyId) continue
      const list = postsByLegacy.get(post.legacyId) || []
      list.push(post)
      postsByLegacy.set(post.legacyId, list)
    }

    for (const [legacyId, list] of postsByLegacy.entries()) {
      if (list.length > 1)
        duplicateLegacyIds.push(`${legacyId} (${list.length})`)
    }

    for (const table of writeTables) {
      const rows = parseTable(sql, `g5_write_${table}`)
      const posts = rows.filter((row) => Number(row.wr_is_comment || 0) === 0)
      for (const row of posts) {
        const legacyId = `${table}:${row.wr_id}`
        if (!postsByLegacy.has(legacyId)) missingPosts.push(legacyId)
      }
    }
  }

  for (const post of importedPosts) {
    const html = postHasContentHtml ? String(post.contentHtml || "") : ""
    if (
      html.includes("/data/") ||
      html.includes("data/editor") ||
      html.includes("data/file")
    ) {
      unconvertedHtmlLinks.push(`${post.id}: ${post.title}`)
    }

    for (const url of extractPayloadMediaUrlsFromHtml(html))
      referencedMediaUrls.add(url)

    if (postHasAttachments && Array.isArray(post.attachments)) {
      for (const item of post.attachments) {
        const file = item?.file
        if (typeof file === "object" && file?.id)
          referencedMediaIds.add(String(file.id))
        else if (file) referencedMediaIds.add(String(file))
      }
    }

    if (postHasThumbnail && post.thumbnail) {
      const thumbnail = post.thumbnail
      if (typeof thumbnail === "object" && thumbnail?.id)
        referencedMediaIds.add(String(thumbnail.id))
      else referencedMediaIds.add(String(thumbnail))
    }
  }

  const mediaDocs = await findAll(payload, "media", {}, 0)
  const mediaUrlSet = new Set(
    mediaDocs.map((media: any) => media.url).filter(Boolean),
  )
  const brokenMediaUrls = [...referencedMediaUrls].filter(
    (url) => !mediaUrlSet.has(url),
  )

  const possibleOrphanGnuboardMedia = mediaDocs.filter((media: any) => {
    const id = String(media.id)
    const alt = String(media.alt || "")
    const url = String(media.url || "")
    const isGnuboard = alt.startsWith("[gnuboard]")
    if (!isGnuboard) return false
    return !referencedMediaIds.has(id) && !referencedMediaUrls.has(url)
  })

  const importedComments = await findAll(payload, "comments", {
    content: { contains: "[gnuboard]" },
  })

  console.log("")
  console.log("===== VERIFY SUMMARY =====")
  console.log(
    `Expected boards: ${g5Boards.filter((b: any) => writeTables.includes(String(b.bo_table))).length}`,
  )
  console.log(`Imported boards found: ${boards.length}`)
  console.log(`Missing boards: ${missingBoards.length}`)
  console.log(`Expected posts: ${expectedTotalPosts}`)
  console.log(`Imported posts found: ${importedPosts.length}`)
  console.log(
    `Missing posts by legacyId: ${postHasLegacyId ? missingPosts.length : "legacyId field not available"}`,
  )
  console.log(
    `Duplicate legacyId posts: ${postHasLegacyId ? duplicateLegacyIds.length : "legacyId field not available"}`,
  )
  console.log(`Expected comments: ${expectedTotalComments}`)
  console.log(`Imported [gnuboard] comments found: ${importedComments.length}`)
  console.log(`HTML /data/ references in SQL: ${htmlDataRefs.length}`)
  console.log(`Missing local files before import: ${missingLocalFiles.length}`)
  console.log(
    `Unconverted /data/ links in Mod-B posts: ${unconvertedHtmlLinks.length}`,
  )
  console.log(`Broken referenced media URLs: ${brokenMediaUrls.length}`)
  console.log(
    `Possible orphan [gnuboard] media: ${possibleOrphanGnuboardMedia.length}`,
  )

  const showList = (title: string, list: any[], limit = 20) => {
    if (!list.length) return
    console.log("")
    console.log(`--- ${title} (${list.length}) ---`)
    for (const item of list.slice(0, limit)) console.log(item)
    if (list.length > limit) console.log(`...and ${list.length - limit} more`)
  }

  showList("Missing boards", missingBoards)
  showList("Missing local files", missingLocalFiles)
  showList("Missing posts", missingPosts)
  showList("Duplicate legacy IDs", duplicateLegacyIds)
  showList("Unconverted HTML links", unconvertedHtmlLinks)
  showList("Broken referenced media URLs", brokenMediaUrls)
  showList(
    "Possible orphan [gnuboard] media",
    possibleOrphanGnuboardMedia.map(
      (media: any) => `${media.id}: ${media.filename || media.url}`,
    ),
  )

  const hasProblems =
    missingBoards.length > 0 ||
    missingLocalFiles.length > 0 ||
    (postHasLegacyId && missingPosts.length > 0) ||
    (postHasLegacyId && duplicateLegacyIds.length > 0) ||
    unconvertedHtmlLinks.length > 0 ||
    brokenMediaUrls.length > 0

  if (hasProblems) {
    console.log("")
    console.log("⚠️ Verification completed with issues.")
    process.exitCode = 1
  } else {
    console.log("")
    console.log("✅ Verification completed without critical issues.")
  }
}

async function main() {
  if (VERIFY) await runVerify()
  else await runImport()
}

main().catch((error) => {
  console.error("❌ Gnuboard migration failed:", error)
  process.exit(1)
})
