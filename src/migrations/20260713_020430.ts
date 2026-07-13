import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'manager', 'member');
  CREATE TYPE "public"."enum_users_social_provider" AS ENUM('google', 'naver', 'kakao', 'facebook');
  CREATE TYPE "public"."enum_boards_board_type" AS ENUM('list', 'card', 'gallery', 'compact', 'notice', 'qna');
  CREATE TYPE "public"."enum_boards_write_settings_allow_write" AS ENUM('member', 'manager', 'admin');
  CREATE TYPE "public"."enum_boards_write_settings_allow_comment_write" AS ENUM('member', 'manager', 'admin');
  CREATE TYPE "public"."enum_boards_skin_settings_grid_columns" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('published', 'draft', 'deleted');
  CREATE TYPE "public"."enum_advertisements_positions" AS ENUM('board-top', 'board-middle', 'board-bottom', 'post-top', 'post-bottom', 'sidebar', 'home');
  CREATE TYPE "public"."enum_advertisements_ad_type" AS ENUM('slide', 'grid', 'banner', 'adsense');
  CREATE TYPE "public"."enum_advertisements_link_target" AS ENUM('_blank', '_self');
  CREATE TYPE "public"."enum_advertisements_width_type" AS ENUM('full', 'content', 'custom');
  CREATE TYPE "public"."enum_advertisements_object_fit" AS ENUM('cover', 'contain', 'fill');
  CREATE TYPE "public"."enum_advertisements_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_hero_slider_slides_link_target" AS ENUM('_self', '_blank');
  CREATE TYPE "public"."enum_pages_blocks_hero_slider_height_type" AS ENUM('small', 'medium', 'large', 'full', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_board_grid_boards_display_type" AS ENUM('list', 'card', 'gallery', 'compact');
  CREATE TYPE "public"."enum_pages_blocks_board_grid_columns" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_latest_posts_display_type" AS ENUM('list', 'card', 'gallery', 'compact');
  CREATE TYPE "public"."enum_pages_blocks_latest_posts_grid_columns" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_trending_posts_display_type" AS ENUM('list', 'card', 'gallery', 'compact');
  CREATE TYPE "public"."enum_pages_blocks_trending_posts_grid_columns" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_popular_posts_display_type" AS ENUM('list', 'card', 'gallery', 'compact');
  CREATE TYPE "public"."enum_pages_blocks_popular_posts_grid_columns" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_single_board_display_type" AS ENUM('list', 'card', 'gallery', 'compact');
  CREATE TYPE "public"."enum_pages_blocks_single_board_grid_columns" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_advertisement_block_ad_type" AS ENUM('single', 'slide', 'grid', 'adsense');
  CREATE TYPE "public"."enum_pages_blocks_advertisement_block_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_advertisement_block_width_type" AS ENUM('full', 'content');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_block_width_type" AS ENUM('full', 'content', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_block_alignment" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_banner_block_link_target" AS ENUM('_self', '_blank');
  CREATE TYPE "public"."enum_pages_blocks_banner_block_width_type" AS ENUM('full', 'content', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_banner_block_object_fit" AS ENUM('cover', 'contain', 'fill');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('published', 'draft');
  CREATE TYPE "public"."enum_announcements_link_type" AS ENUM('none', 'custom', 'page', 'board');
  CREATE TYPE "public"."enum_announcements_display_type" AS ENUM('ticker', 'bar');
  CREATE TYPE "public"."enum_login_logs_event_type" AS ENUM('login', 'logout');
  CREATE TYPE "public"."enum_login_logs_login_method" AS ENUM('password', 'google', 'naver', 'kakao', 'facebook');
  CREATE TYPE "public"."enum_audit_logs_action" AS ENUM('create', 'update', 'delete', 'restore', 'verify', 'report', 'moderate');
  CREATE TYPE "public"."enum_audit_logs_resource_type" AS ENUM('post', 'comment', 'user', 'board', 'report');
  CREATE TYPE "public"."enum_audit_logs_actor_type" AS ENUM('user', 'anonymous', 'system');
  CREATE TYPE "public"."enum_reports_target_type" AS ENUM('post', 'comment');
  CREATE TYPE "public"."enum_reports_reason" AS ENUM('spam', 'abuse', 'inappropriate', 'personal_info', 'other');
  CREATE TYPE "public"."enum_reports_status" AS ENUM('open', 'reviewing', 'resolved', 'dismissed');
  CREATE TYPE "public"."enum_notifications_type" AS ENUM('comment', 'reply', 'qna_answer', 'qna_accepted', 'moderation', 'mention');
  CREATE TYPE "public"."hero_link_target" AS ENUM('_self', '_blank');
  CREATE TYPE "public"."enum_gb_sections_section_type" AS ENUM('board', 'latest', 'trending', 'popular', 'recentComments', 'page', 'custom', 'advertisement');
  CREATE TYPE "public"."gb_display_type" AS ENUM('ticker', 'list', 'card', 'gallery');
  CREATE TYPE "public"."enum_gb_sections_grid_columns" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."hero_width" AS ENUM('content', 'full');
  CREATE TYPE "public"."hero_height_type" AS ENUM('small', 'medium', 'large', 'full', 'custom');
  CREATE TYPE "public"."enum_site_settings_home_settings_global_board_settings_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_site_settings_design_typography_font_family" AS ENUM('system', 'inter', 'noto-sans-kr', 'pretendard', 'roboto', 'open-sans', 'custom');
  CREATE TYPE "public"."enum_site_settings_design_typography_base_font_size" AS ENUM('14px', '15px', '16px', '17px', '18px');
  CREATE TYPE "public"."enum_site_settings_design_typography_heading_weight" AS ENUM('400', '500', '600', '700', '800');
  CREATE TYPE "public"."enum_site_settings_design_layout_max_width" AS ENUM('1024px', '1280px', '1440px', '100%');
  CREATE TYPE "public"."enum_site_settings_design_layout_border_radius" AS ENUM('0px', '4px', '8px', '12px', '16px');
  CREATE TYPE "public"."enum_site_settings_design_layout_header_height" AS ENUM('56px', '64px', '72px', '80px');
  CREATE TYPE "public"."enum_site_settings_design_layout_header_width" AS ENUM('content', 'full');
  CREATE TYPE "public"."enum_site_settings_design_layout_nav_width" AS ENUM('content', 'full');
  CREATE TYPE "public"."enum_site_settings_design_layout_announcement_width" AS ENUM('content', 'full');
  CREATE TYPE "public"."enum_site_settings_design_layout_main_width" AS ENUM('content', 'full');
  CREATE TYPE "public"."enum_site_settings_design_layout_footer_width" AS ENUM('content', 'full');
  CREATE TYPE "public"."enum_navigation_items_children_type" AS ENUM('board', 'url', 'page');
  CREATE TYPE "public"."enum_navigation_items_type" AS ENUM('board', 'dropdown', 'url', 'page');
  CREATE TYPE "public"."enum_navigation_items_dropdown_link_type" AS ENUM('none', 'page', 'url');
  CREATE TYPE "public"."enum_navigation_footer_column_items_links_type" AS ENUM('page', 'board', 'url');
  CREATE TYPE "public"."enum_navigation_footer_bottom_bar_bottom_links_type" AS ENUM('page', 'board', 'url', 'email');
  CREATE TYPE "public"."enum_navigation_footer_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_date_time_settings_display_mode" AS ENUM('rolling', 'inline');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"nickname" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'member' NOT NULL,
  	"level" numeric DEFAULT 1,
  	"is_active" boolean DEFAULT false,
  	"avatar_id" integer,
  	"social_avatar_url" varchar,
  	"bio" varchar,
  	"email_verified" boolean DEFAULT false,
  	"email_verification_token" varchar,
  	"email_verification_expires" timestamp(3) with time zone,
  	"social_provider" "enum_users_social_provider",
  	"social_provider_account_id" varchar,
  	"terms_accepted" boolean DEFAULT false,
  	"profile_completed" boolean DEFAULT false,
  	"is_deleted" boolean DEFAULT false,
  	"deleted_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"category_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar
  );
  
  CREATE TABLE "boards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"board_type" "enum_boards_board_type" DEFAULT 'list' NOT NULL,
  	"list_settings_posts_per_page" numeric DEFAULT 20,
  	"list_settings_show_author" boolean DEFAULT true,
  	"list_settings_show_date" boolean DEFAULT true,
  	"list_settings_show_view_count" boolean DEFAULT true,
  	"announcement_settings_enable_pinned_notices" boolean DEFAULT true,
  	"announcement_settings_max_pinned_notices" numeric DEFAULT 5,
  	"write_settings_allow_write" "enum_boards_write_settings_allow_write" DEFAULT 'member',
  	"write_settings_allow_comment_write" "enum_boards_write_settings_allow_comment_write" DEFAULT 'member',
  	"write_settings_allow_comment" boolean DEFAULT true,
  	"write_settings_allow_anonymous" boolean DEFAULT false,
  	"write_settings_allow_anonymous_comment" boolean DEFAULT false,
  	"write_settings_allow_attachment" boolean DEFAULT true,
  	"write_settings_max_attachments" numeric DEFAULT 5,
  	"skin_settings_grid_columns" "enum_boards_skin_settings_grid_columns" DEFAULT '3',
  	"order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"manager_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "boards_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "posts_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"board_id" integer NOT NULL,
  	"author_id" integer,
  	"use_html_content" boolean DEFAULT false,
  	"content_html" varchar,
  	"content" jsonb,
  	"thumbnail_id" integer,
  	"view_count" numeric DEFAULT 0,
  	"like_count" numeric DEFAULT 0,
  	"is_notice" boolean DEFAULT false,
  	"is_secret" boolean DEFAULT false,
  	"is_answered" boolean DEFAULT false,
  	"accepted_comment_id" numeric,
  	"status" "enum_posts_status" DEFAULT 'published',
  	"anonymous_author" varchar,
  	"anonymous_ip" varchar,
  	"anonymous_password_hash" varchar,
  	"anonymous_user_agent" varchar,
  	"is_deleted" boolean DEFAULT false,
  	"deleted_at" timestamp(3) with time zone,
  	"deleted_by_id" integer,
  	"restored_at" timestamp(3) with time zone,
  	"restored_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"post_id" integer NOT NULL,
  	"author_id" integer,
  	"anonymous_author" varchar,
  	"anonymous_ip" varchar,
  	"anonymous_password_hash" varchar,
  	"anonymous_user_agent" varchar,
  	"content" varchar NOT NULL,
  	"parent_comment_id" integer,
  	"like_count" numeric DEFAULT 0,
  	"is_deleted" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "advertisements_positions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_advertisements_positions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "advertisements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"ad_type" "enum_advertisements_ad_type" DEFAULT 'banner' NOT NULL,
  	"image_id" integer,
  	"link_url" varchar,
  	"link_target" "enum_advertisements_link_target" DEFAULT '_blank',
  	"alt_text" varchar,
  	"width_type" "enum_advertisements_width_type" DEFAULT 'content',
  	"custom_width" varchar,
  	"custom_height" varchar,
  	"object_fit" "enum_advertisements_object_fit" DEFAULT 'cover',
  	"slide_group" varchar,
  	"slide_order" numeric DEFAULT 0,
  	"grid_group" varchar,
  	"grid_columns" "enum_advertisements_grid_columns" DEFAULT '3',
  	"grid_order" numeric DEFAULT 0,
  	"adsense_code" varchar,
  	"middle_position" numeric DEFAULT 5,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"is_active" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "advertisements_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"boards_id" integer
  );
  
  CREATE TABLE "pages_blocks_hero_slider_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_target" "enum_pages_blocks_hero_slider_slides_link_target" DEFAULT '_self'
  );
  
  CREATE TABLE "pages_blocks_hero_slider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"height_type" "enum_pages_blocks_hero_slider_height_type" DEFAULT 'medium',
  	"custom_height" varchar,
  	"auto_play" boolean DEFAULT true,
  	"auto_play_interval" numeric DEFAULT 4000,
  	"show_dots" boolean DEFAULT true,
  	"show_arrows" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_board_grid_boards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"board_id" integer NOT NULL,
  	"custom_title" varchar,
  	"post_count" numeric DEFAULT 5,
  	"display_type" "enum_pages_blocks_board_grid_boards_display_type" DEFAULT 'list'
  );
  
  CREATE TABLE "pages_blocks_board_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_title" varchar,
  	"columns" "enum_pages_blocks_board_grid_columns" DEFAULT '2',
  	"show_more_link" boolean DEFAULT true,
  	"show_author" boolean DEFAULT true,
  	"show_date" boolean DEFAULT true,
  	"show_view_count" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_latest_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_title" varchar DEFAULT 'Latest Posts',
  	"post_count" numeric DEFAULT 10,
  	"display_type" "enum_pages_blocks_latest_posts_display_type" DEFAULT 'list',
  	"grid_columns" "enum_pages_blocks_latest_posts_grid_columns" DEFAULT '3',
  	"show_board_name" boolean DEFAULT true,
  	"show_author" boolean DEFAULT true,
  	"show_date" boolean DEFAULT true,
  	"show_view_count" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_trending_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_title" varchar DEFAULT 'Trending Posts',
  	"post_count" numeric DEFAULT 10,
  	"period_days" numeric DEFAULT 7,
  	"display_type" "enum_pages_blocks_trending_posts_display_type" DEFAULT 'list',
  	"grid_columns" "enum_pages_blocks_trending_posts_grid_columns" DEFAULT '3',
  	"show_ranking" boolean DEFAULT true,
  	"show_board_name" boolean DEFAULT true,
  	"show_author" boolean DEFAULT true,
  	"show_date" boolean DEFAULT true,
  	"show_view_count" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_popular_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_title" varchar DEFAULT 'Popular Posts',
  	"post_count" numeric DEFAULT 5,
  	"display_type" "enum_pages_blocks_popular_posts_display_type" DEFAULT 'list',
  	"grid_columns" "enum_pages_blocks_popular_posts_grid_columns" DEFAULT '3',
  	"show_ranking" boolean DEFAULT true,
  	"show_board_name" boolean DEFAULT true,
  	"show_author" boolean DEFAULT true,
  	"show_date" boolean DEFAULT true,
  	"show_view_count" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_single_board" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"board_id" integer NOT NULL,
  	"custom_title" varchar,
  	"post_count" numeric DEFAULT 5,
  	"display_type" "enum_pages_blocks_single_board_display_type" DEFAULT 'list',
  	"grid_columns" "enum_pages_blocks_single_board_grid_columns" DEFAULT '3',
  	"show_author" boolean DEFAULT true,
  	"show_date" boolean DEFAULT true,
  	"show_view_count" boolean DEFAULT true,
  	"show_more_link" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_advertisement_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ad_type" "enum_pages_blocks_advertisement_block_ad_type" DEFAULT 'single' NOT NULL,
  	"slide_group" varchar,
  	"grid_group" varchar,
  	"grid_columns" "enum_pages_blocks_advertisement_block_grid_columns" DEFAULT '3',
  	"single_ad_id" integer,
  	"adsense_slot" varchar,
  	"width_type" "enum_pages_blocks_advertisement_block_width_type" DEFAULT 'content',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"use_html_content" boolean DEFAULT false,
  	"content_html" varchar,
  	"content" jsonb,
  	"width_type" "enum_pages_blocks_rich_text_block_width_type" DEFAULT 'content',
  	"alignment" "enum_pages_blocks_rich_text_block_alignment" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_banner_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"alt_text" varchar,
  	"link_url" varchar,
  	"link_target" "enum_pages_blocks_banner_block_link_target" DEFAULT '_self',
  	"width_type" "enum_pages_blocks_banner_block_width_type" DEFAULT 'content',
  	"custom_width" varchar,
  	"custom_height" varchar,
  	"object_fit" "enum_pages_blocks_banner_block_object_fit" DEFAULT 'cover',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_recent_comments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_title" varchar DEFAULT 'Recent Comments',
  	"comment_count" numeric DEFAULT 5,
  	"show_board_name" boolean DEFAULT true,
  	"show_author" boolean DEFAULT true,
  	"show_date" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_pages_status" DEFAULT 'published',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"boards_id" integer
  );
  
  CREATE TABLE "announcements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"message" varchar,
  	"link_type" "enum_announcements_link_type" DEFAULT 'custom',
  	"custom_url" varchar,
  	"page_link_id" integer,
  	"board_link_id" integer,
  	"display_type" "enum_announcements_display_type" DEFAULT 'ticker',
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"is_active" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "login_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_type" "enum_login_logs_event_type" DEFAULT 'login' NOT NULL,
  	"user_id" integer NOT NULL,
  	"email" varchar NOT NULL,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"login_method" "enum_login_logs_login_method" DEFAULT 'password',
  	"success" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" "enum_audit_logs_action" NOT NULL,
  	"resource_type" "enum_audit_logs_resource_type" NOT NULL,
  	"resource_id" varchar NOT NULL,
  	"actor_type" "enum_audit_logs_actor_type" NOT NULL,
  	"actor_id" integer,
  	"anonymous_author" varchar,
  	"ip" varchar,
  	"user_agent" varchar,
  	"message" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"target_type" "enum_reports_target_type" NOT NULL,
  	"target_id" varchar NOT NULL,
  	"reason" "enum_reports_reason" NOT NULL,
  	"details" varchar,
  	"status" "enum_reports_status" DEFAULT 'open',
  	"reporter_id" integer,
  	"reporter_ip" varchar,
  	"user_agent" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"recipient_id" integer NOT NULL,
  	"type" "enum_notifications_type" NOT NULL,
  	"title" varchar NOT NULL,
  	"message" varchar,
  	"href" varchar,
  	"is_read" boolean DEFAULT false,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookmark_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"name" varchar DEFAULT 'Default' NOT NULL,
  	"description" varchar,
  	"is_default" boolean DEFAULT false,
  	"is_public" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookmark_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"folder_id" integer NOT NULL,
  	"post_id" integer NOT NULL,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"boards_id" integer,
  	"posts_id" integer,
  	"comments_id" integer,
  	"advertisements_id" integer,
  	"pages_id" integer,
  	"announcements_id" integer,
  	"login_logs_id" integer,
  	"audit_logs_id" integer,
  	"reports_id" integer,
  	"notifications_id" integer,
  	"bookmark_folders_id" integer,
  	"bookmark_items_id" integer,
  	"media_categories_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"subtitle" varchar,
  	"link_url" varchar,
  	"link_label" varchar DEFAULT 'Learn More',
  	"link_target" "hero_link_target" DEFAULT '_self',
  	"order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true
  );
  
  CREATE TABLE "gb_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_type" "enum_gb_sections_section_type" DEFAULT 'board',
  	"advertisement_id" integer,
  	"board_id" integer,
  	"section_title" varchar,
  	"post_count" numeric DEFAULT 5,
  	"display_type" "gb_display_type" DEFAULT 'ticker',
  	"grid_columns" "enum_gb_sections_grid_columns" DEFAULT '3',
  	"order" numeric DEFAULT 0
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Mod-B',
  	"site_description" varchar,
  	"site_logo_id" integer,
  	"favicon_id" integer,
  	"home_settings_hero_settings_enabled" boolean DEFAULT false,
  	"home_settings_hero_settings_slider_settings_auto_play" boolean DEFAULT true,
  	"home_settings_hero_settings_slider_settings_auto_play_interval" numeric DEFAULT 4000,
  	"home_settings_hero_settings_slider_settings_show_dots" boolean DEFAULT true,
  	"home_settings_hero_settings_slider_settings_show_arrows" boolean DEFAULT true,
  	"home_settings_hero_settings_slider_settings_width" "hero_width" DEFAULT 'content',
  	"home_settings_hero_settings_slider_settings_height_type" "hero_height_type" DEFAULT 'medium',
  	"home_settings_hero_settings_slider_settings_custom_height" varchar,
  	"home_settings_global_board_settings_enabled" boolean DEFAULT true,
  	"home_settings_global_board_settings_visibility_show_on_home" boolean DEFAULT true,
  	"home_settings_global_board_settings_visibility_show_on_board" boolean DEFAULT true,
  	"home_settings_global_board_settings_visibility_show_on_post" boolean DEFAULT true,
  	"home_settings_global_board_settings_visibility_show_on_search" boolean DEFAULT true,
  	"home_settings_global_board_settings_visibility_show_on_tag" boolean DEFAULT true,
  	"home_settings_global_board_settings_visibility_show_on_user" boolean DEFAULT true,
  	"home_settings_global_board_settings_visibility_show_on_my_page" boolean DEFAULT false,
  	"home_settings_global_board_settings_visibility_show_on_login" boolean DEFAULT false,
  	"home_settings_global_board_settings_enable_sidebar_ads" boolean DEFAULT true,
  	"home_settings_global_board_settings_position" "enum_site_settings_home_settings_global_board_settings_position" DEFAULT 'right',
  	"email_smtp_host" varchar DEFAULT 'sandbox.smtp.mailtrap.io',
  	"email_smtp_port" varchar DEFAULT '2525',
  	"email_smtp_user" varchar DEFAULT 'f4e989d0461774',
  	"email_from_name" varchar DEFAULT 'Mod-B',
  	"email_from_email" varchar DEFAULT 'abc101@gmail.com',
  	"email_require_email_verification" boolean DEFAULT false,
  	"social_login_google_enabled" boolean DEFAULT false,
  	"social_login_google_button_label" varchar DEFAULT 'Continue with Google',
  	"social_login_naver_enabled" boolean DEFAULT false,
  	"social_login_naver_button_label" varchar DEFAULT '네이버로 로그인',
  	"social_login_kakao_enabled" boolean DEFAULT false,
  	"social_login_kakao_button_label" varchar DEFAULT '카카오로 로그인',
  	"social_login_facebook_enabled" boolean DEFAULT false,
  	"social_login_facebook_button_label" varchar DEFAULT 'Continue with Facebook',
  	"social_login_divider_text" varchar DEFAULT 'or',
  	"design_colors_primary" varchar DEFAULT '#111827',
  	"design_colors_primary_foreground" varchar DEFAULT '#ffffff',
  	"design_colors_secondary" varchar DEFAULT '#f3f4f6',
  	"design_colors_secondary_foreground" varchar DEFAULT '#111827',
  	"design_colors_background" varchar DEFAULT '#f9fafb',
  	"design_colors_foreground" varchar DEFAULT '#111827',
  	"design_colors_header_bg" varchar DEFAULT '#ffffff',
  	"design_colors_nav_bg" varchar DEFAULT '#f3f4f6',
  	"design_colors_footer_bg" varchar DEFAULT '#111827',
  	"design_colors_footer_fg" varchar DEFAULT '#9ca3af',
  	"design_colors_link" varchar DEFAULT '#2563eb',
  	"design_typography_font_family" "enum_site_settings_design_typography_font_family" DEFAULT 'system',
  	"design_typography_base_font_size" "enum_site_settings_design_typography_base_font_size" DEFAULT '16px',
  	"design_typography_heading_weight" "enum_site_settings_design_typography_heading_weight" DEFAULT '700',
  	"design_layout_max_width" "enum_site_settings_design_layout_max_width" DEFAULT '1280px',
  	"design_layout_border_radius" "enum_site_settings_design_layout_border_radius" DEFAULT '8px',
  	"design_layout_header_height" "enum_site_settings_design_layout_header_height" DEFAULT '64px',
  	"design_layout_header_width" "enum_site_settings_design_layout_header_width" DEFAULT 'full',
  	"design_layout_nav_width" "enum_site_settings_design_layout_nav_width" DEFAULT 'full',
  	"design_layout_announcement_width" "enum_site_settings_design_layout_announcement_width" DEFAULT 'content',
  	"design_layout_main_width" "enum_site_settings_design_layout_main_width" DEFAULT 'content',
  	"design_layout_footer_width" "enum_site_settings_design_layout_footer_width" DEFAULT 'content',
  	"design_custom_css" varchar,
  	"seo_default_title" varchar,
  	"seo_default_description" varchar,
  	"seo_og_image_id" integer,
  	"seo_google_analytics_id" varchar,
  	"seo_naver_verification" varchar,
  	"seo_google_verification" varchar,
  	"google_ads_enabled" boolean DEFAULT false,
  	"google_ads_publisher_id" varchar,
  	"google_ads_auto_ads" boolean DEFAULT false,
  	"custom_scripts_head_script" varchar,
  	"custom_scripts_body_script" varchar,
  	"forbidden_words_registration" varchar,
  	"forbidden_words_content" varchar,
  	"maintenance_enabled" boolean DEFAULT false,
  	"maintenance_title" varchar DEFAULT 'Under Construction',
  	"maintenance_message" varchar DEFAULT 'We are currently working on something awesome. Please check back soon.',
  	"maintenance_estimated_date" timestamp(3) with time zone,
  	"maintenance_background_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"boards_id" integer
  );
  
  CREATE TABLE "navigation_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum_navigation_items_children_type" DEFAULT 'board',
  	"board_id" integer,
  	"url" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"page_id" integer
  );
  
  CREATE TABLE "navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_items_type" DEFAULT 'board' NOT NULL,
  	"board_id" integer,
  	"url" varchar,
  	"open_in_new_tab" boolean DEFAULT false,
  	"page_id" integer,
  	"dropdown_link_type" "enum_navigation_items_dropdown_link_type" DEFAULT 'none',
  	"dropdown_page_id" integer,
  	"dropdown_url" varchar,
  	"dropdown_open_in_new_tab" boolean DEFAULT false,
  	"is_active" boolean DEFAULT true
  );
  
  CREATE TABLE "navigation_footer_column_items_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_footer_column_items_links_type" DEFAULT 'page',
  	"page_id" integer,
  	"board_id" integer,
  	"url" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_footer_column_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "navigation_footer_bottom_bar_bottom_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_footer_bottom_bar_bottom_links_type" DEFAULT 'page',
  	"page_id" integer,
  	"board_id" integer,
  	"url" varchar,
  	"email" varchar,
  	"open_in_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"footer_columns" "enum_navigation_footer_columns" DEFAULT '3',
  	"footer_bottom_bar_copyright_name" varchar,
  	"footer_bottom_bar_show_year" boolean DEFAULT true,
  	"footer_bottom_bar_right_text" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "date_time_settings_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"icon" varchar DEFAULT '📍',
  	"time_zone" varchar DEFAULT 'Pacific/Honolulu' NOT NULL,
  	"latitude" numeric NOT NULL,
  	"longitude" numeric NOT NULL
  );
  
  CREATE TABLE "date_time_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"display_mode" "enum_date_time_settings_display_mode" DEFAULT 'rolling',
  	"show_weather" boolean DEFAULT true,
  	"show_date_time" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_category_id_media_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."media_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "boards_rels" ADD CONSTRAINT "boards_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "boards_rels" ADD CONSTRAINT "boards_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_attachments" ADD CONSTRAINT "posts_attachments_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_attachments" ADD CONSTRAINT "posts_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_tags" ADD CONSTRAINT "posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_deleted_by_id_users_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_restored_by_id_users_id_fk" FOREIGN KEY ("restored_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "advertisements_positions" ADD CONSTRAINT "advertisements_positions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."advertisements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "advertisements_rels" ADD CONSTRAINT "advertisements_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."advertisements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "advertisements_rels" ADD CONSTRAINT "advertisements_rels_boards_fk" FOREIGN KEY ("boards_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_slider_slides" ADD CONSTRAINT "pages_blocks_hero_slider_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_slider_slides" ADD CONSTRAINT "pages_blocks_hero_slider_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_slider"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_slider" ADD CONSTRAINT "pages_blocks_hero_slider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_board_grid_boards" ADD CONSTRAINT "pages_blocks_board_grid_boards_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_board_grid_boards" ADD CONSTRAINT "pages_blocks_board_grid_boards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_board_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_board_grid" ADD CONSTRAINT "pages_blocks_board_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_latest_posts" ADD CONSTRAINT "pages_blocks_latest_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trending_posts" ADD CONSTRAINT "pages_blocks_trending_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_popular_posts" ADD CONSTRAINT "pages_blocks_popular_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_single_board" ADD CONSTRAINT "pages_blocks_single_board_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_single_board" ADD CONSTRAINT "pages_blocks_single_board_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_advertisement_block" ADD CONSTRAINT "pages_blocks_advertisement_block_single_ad_id_advertisements_id_fk" FOREIGN KEY ("single_ad_id") REFERENCES "public"."advertisements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_advertisement_block" ADD CONSTRAINT "pages_blocks_advertisement_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text_block" ADD CONSTRAINT "pages_blocks_rich_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner_block" ADD CONSTRAINT "pages_blocks_banner_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner_block" ADD CONSTRAINT "pages_blocks_banner_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_recent_comments" ADD CONSTRAINT "pages_blocks_recent_comments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_boards_fk" FOREIGN KEY ("boards_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "announcements" ADD CONSTRAINT "announcements_page_link_id_pages_id_fk" FOREIGN KEY ("page_link_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "announcements" ADD CONSTRAINT "announcements_board_link_id_boards_id_fk" FOREIGN KEY ("board_link_id") REFERENCES "public"."boards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookmark_folders" ADD CONSTRAINT "bookmark_folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookmark_items" ADD CONSTRAINT "bookmark_items_folder_id_bookmark_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."bookmark_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookmark_items" ADD CONSTRAINT "bookmark_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_boards_fk" FOREIGN KEY ("boards_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comments_fk" FOREIGN KEY ("comments_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_advertisements_fk" FOREIGN KEY ("advertisements_id") REFERENCES "public"."advertisements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_announcements_fk" FOREIGN KEY ("announcements_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_login_logs_fk" FOREIGN KEY ("login_logs_id") REFERENCES "public"."login_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reports_fk" FOREIGN KEY ("reports_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookmark_folders_fk" FOREIGN KEY ("bookmark_folders_id") REFERENCES "public"."bookmark_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookmark_items_fk" FOREIGN KEY ("bookmark_items_id") REFERENCES "public"."bookmark_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_categories_fk" FOREIGN KEY ("media_categories_id") REFERENCES "public"."media_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gb_sections" ADD CONSTRAINT "gb_sections_advertisement_id_advertisements_id_fk" FOREIGN KEY ("advertisement_id") REFERENCES "public"."advertisements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gb_sections" ADD CONSTRAINT "gb_sections_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gb_sections" ADD CONSTRAINT "gb_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_site_logo_id_media_id_fk" FOREIGN KEY ("site_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_maintenance_background_image_id_media_id_fk" FOREIGN KEY ("maintenance_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_boards_fk" FOREIGN KEY ("boards_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_children" ADD CONSTRAINT "navigation_items_children_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_items_children" ADD CONSTRAINT "navigation_items_children_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_items_children" ADD CONSTRAINT "navigation_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_dropdown_page_id_pages_id_fk" FOREIGN KEY ("dropdown_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_column_items_links" ADD CONSTRAINT "navigation_footer_column_items_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_column_items_links" ADD CONSTRAINT "navigation_footer_column_items_links_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_column_items_links" ADD CONSTRAINT "navigation_footer_column_items_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_column_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_column_items" ADD CONSTRAINT "navigation_footer_column_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_bottom_bar_bottom_links" ADD CONSTRAINT "navigation_footer_bottom_bar_bottom_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_bottom_bar_bottom_links" ADD CONSTRAINT "navigation_footer_bottom_bar_bottom_links_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_bottom_bar_bottom_links" ADD CONSTRAINT "navigation_footer_bottom_bar_bottom_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "date_time_settings_locations" ADD CONSTRAINT "date_time_settings_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."date_time_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_category_idx" ON "media" USING btree ("category_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE UNIQUE INDEX "boards_slug_idx" ON "boards" USING btree ("slug");
  CREATE INDEX "boards_updated_at_idx" ON "boards" USING btree ("updated_at");
  CREATE INDEX "boards_created_at_idx" ON "boards" USING btree ("created_at");
  CREATE INDEX "boards_rels_order_idx" ON "boards_rels" USING btree ("order");
  CREATE INDEX "boards_rels_parent_idx" ON "boards_rels" USING btree ("parent_id");
  CREATE INDEX "boards_rels_path_idx" ON "boards_rels" USING btree ("path");
  CREATE INDEX "boards_rels_users_id_idx" ON "boards_rels" USING btree ("users_id");
  CREATE INDEX "posts_attachments_order_idx" ON "posts_attachments" USING btree ("_order");
  CREATE INDEX "posts_attachments_parent_id_idx" ON "posts_attachments" USING btree ("_parent_id");
  CREATE INDEX "posts_attachments_file_idx" ON "posts_attachments" USING btree ("file_id");
  CREATE INDEX "posts_tags_order_idx" ON "posts_tags" USING btree ("_order");
  CREATE INDEX "posts_tags_parent_id_idx" ON "posts_tags" USING btree ("_parent_id");
  CREATE INDEX "posts_board_idx" ON "posts" USING btree ("board_id");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_thumbnail_idx" ON "posts" USING btree ("thumbnail_id");
  CREATE INDEX "posts_deleted_by_idx" ON "posts" USING btree ("deleted_by_id");
  CREATE INDEX "posts_restored_by_idx" ON "posts" USING btree ("restored_by_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "comments_post_idx" ON "comments" USING btree ("post_id");
  CREATE INDEX "comments_author_idx" ON "comments" USING btree ("author_id");
  CREATE INDEX "comments_parent_comment_idx" ON "comments" USING btree ("parent_comment_id");
  CREATE INDEX "comments_updated_at_idx" ON "comments" USING btree ("updated_at");
  CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");
  CREATE INDEX "advertisements_positions_order_idx" ON "advertisements_positions" USING btree ("order");
  CREATE INDEX "advertisements_positions_parent_idx" ON "advertisements_positions" USING btree ("parent_id");
  CREATE INDEX "advertisements_image_idx" ON "advertisements" USING btree ("image_id");
  CREATE INDEX "advertisements_updated_at_idx" ON "advertisements" USING btree ("updated_at");
  CREATE INDEX "advertisements_created_at_idx" ON "advertisements" USING btree ("created_at");
  CREATE INDEX "advertisements_rels_order_idx" ON "advertisements_rels" USING btree ("order");
  CREATE INDEX "advertisements_rels_parent_idx" ON "advertisements_rels" USING btree ("parent_id");
  CREATE INDEX "advertisements_rels_path_idx" ON "advertisements_rels" USING btree ("path");
  CREATE INDEX "advertisements_rels_boards_id_idx" ON "advertisements_rels" USING btree ("boards_id");
  CREATE INDEX "pages_blocks_hero_slider_slides_order_idx" ON "pages_blocks_hero_slider_slides" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_slider_slides_parent_id_idx" ON "pages_blocks_hero_slider_slides" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_slider_slides_image_idx" ON "pages_blocks_hero_slider_slides" USING btree ("image_id");
  CREATE INDEX "pages_blocks_hero_slider_order_idx" ON "pages_blocks_hero_slider" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_slider_parent_id_idx" ON "pages_blocks_hero_slider" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_slider_path_idx" ON "pages_blocks_hero_slider" USING btree ("_path");
  CREATE INDEX "pages_blocks_board_grid_boards_order_idx" ON "pages_blocks_board_grid_boards" USING btree ("_order");
  CREATE INDEX "pages_blocks_board_grid_boards_parent_id_idx" ON "pages_blocks_board_grid_boards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_board_grid_boards_board_idx" ON "pages_blocks_board_grid_boards" USING btree ("board_id");
  CREATE INDEX "pages_blocks_board_grid_order_idx" ON "pages_blocks_board_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_board_grid_parent_id_idx" ON "pages_blocks_board_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_board_grid_path_idx" ON "pages_blocks_board_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_latest_posts_order_idx" ON "pages_blocks_latest_posts" USING btree ("_order");
  CREATE INDEX "pages_blocks_latest_posts_parent_id_idx" ON "pages_blocks_latest_posts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_latest_posts_path_idx" ON "pages_blocks_latest_posts" USING btree ("_path");
  CREATE INDEX "pages_blocks_trending_posts_order_idx" ON "pages_blocks_trending_posts" USING btree ("_order");
  CREATE INDEX "pages_blocks_trending_posts_parent_id_idx" ON "pages_blocks_trending_posts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trending_posts_path_idx" ON "pages_blocks_trending_posts" USING btree ("_path");
  CREATE INDEX "pages_blocks_popular_posts_order_idx" ON "pages_blocks_popular_posts" USING btree ("_order");
  CREATE INDEX "pages_blocks_popular_posts_parent_id_idx" ON "pages_blocks_popular_posts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_popular_posts_path_idx" ON "pages_blocks_popular_posts" USING btree ("_path");
  CREATE INDEX "pages_blocks_single_board_order_idx" ON "pages_blocks_single_board" USING btree ("_order");
  CREATE INDEX "pages_blocks_single_board_parent_id_idx" ON "pages_blocks_single_board" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_single_board_path_idx" ON "pages_blocks_single_board" USING btree ("_path");
  CREATE INDEX "pages_blocks_single_board_board_idx" ON "pages_blocks_single_board" USING btree ("board_id");
  CREATE INDEX "pages_blocks_advertisement_block_order_idx" ON "pages_blocks_advertisement_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_advertisement_block_parent_id_idx" ON "pages_blocks_advertisement_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_advertisement_block_path_idx" ON "pages_blocks_advertisement_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_advertisement_block_single_ad_idx" ON "pages_blocks_advertisement_block" USING btree ("single_ad_id");
  CREATE INDEX "pages_blocks_rich_text_block_order_idx" ON "pages_blocks_rich_text_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_block_parent_id_idx" ON "pages_blocks_rich_text_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_block_path_idx" ON "pages_blocks_rich_text_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_banner_block_order_idx" ON "pages_blocks_banner_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_banner_block_parent_id_idx" ON "pages_blocks_banner_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_banner_block_path_idx" ON "pages_blocks_banner_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_banner_block_image_idx" ON "pages_blocks_banner_block" USING btree ("image_id");
  CREATE INDEX "pages_blocks_recent_comments_order_idx" ON "pages_blocks_recent_comments" USING btree ("_order");
  CREATE INDEX "pages_blocks_recent_comments_parent_id_idx" ON "pages_blocks_recent_comments" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_recent_comments_path_idx" ON "pages_blocks_recent_comments" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_boards_id_idx" ON "pages_rels" USING btree ("boards_id");
  CREATE INDEX "announcements_page_link_idx" ON "announcements" USING btree ("page_link_id");
  CREATE INDEX "announcements_board_link_idx" ON "announcements" USING btree ("board_link_id");
  CREATE INDEX "announcements_updated_at_idx" ON "announcements" USING btree ("updated_at");
  CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");
  CREATE INDEX "login_logs_user_idx" ON "login_logs" USING btree ("user_id");
  CREATE INDEX "login_logs_updated_at_idx" ON "login_logs" USING btree ("updated_at");
  CREATE INDEX "login_logs_created_at_idx" ON "login_logs" USING btree ("created_at");
  CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  CREATE INDEX "reports_reporter_idx" ON "reports" USING btree ("reporter_id");
  CREATE INDEX "reports_updated_at_idx" ON "reports" USING btree ("updated_at");
  CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");
  CREATE INDEX "notifications_recipient_idx" ON "notifications" USING btree ("recipient_id");
  CREATE INDEX "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
  CREATE INDEX "bookmark_folders_user_idx" ON "bookmark_folders" USING btree ("user_id");
  CREATE INDEX "bookmark_folders_updated_at_idx" ON "bookmark_folders" USING btree ("updated_at");
  CREATE INDEX "bookmark_folders_created_at_idx" ON "bookmark_folders" USING btree ("created_at");
  CREATE INDEX "bookmark_items_folder_idx" ON "bookmark_items" USING btree ("folder_id");
  CREATE INDEX "bookmark_items_post_idx" ON "bookmark_items" USING btree ("post_id");
  CREATE INDEX "bookmark_items_updated_at_idx" ON "bookmark_items" USING btree ("updated_at");
  CREATE INDEX "bookmark_items_created_at_idx" ON "bookmark_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_categories_name_idx" ON "media_categories" USING btree ("name");
  CREATE UNIQUE INDEX "media_categories_slug_idx" ON "media_categories" USING btree ("slug");
  CREATE INDEX "media_categories_updated_at_idx" ON "media_categories" USING btree ("updated_at");
  CREATE INDEX "media_categories_created_at_idx" ON "media_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_boards_id_idx" ON "payload_locked_documents_rels" USING btree ("boards_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("comments_id");
  CREATE INDEX "payload_locked_documents_rels_advertisements_id_idx" ON "payload_locked_documents_rels" USING btree ("advertisements_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_announcements_id_idx" ON "payload_locked_documents_rels" USING btree ("announcements_id");
  CREATE INDEX "payload_locked_documents_rels_login_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("login_logs_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_locked_documents_rels_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("reports_id");
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");
  CREATE INDEX "payload_locked_documents_rels_bookmark_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("bookmark_folders_id");
  CREATE INDEX "payload_locked_documents_rels_bookmark_items_id_idx" ON "payload_locked_documents_rels" USING btree ("bookmark_items_id");
  CREATE INDEX "payload_locked_documents_rels_media_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("media_categories_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "hero_slides_order_idx" ON "hero_slides" USING btree ("_order");
  CREATE INDEX "hero_slides_parent_id_idx" ON "hero_slides" USING btree ("_parent_id");
  CREATE INDEX "hero_slides_image_idx" ON "hero_slides" USING btree ("image_id");
  CREATE INDEX "gb_sections_order_idx" ON "gb_sections" USING btree ("_order");
  CREATE INDEX "gb_sections_parent_id_idx" ON "gb_sections" USING btree ("_parent_id");
  CREATE INDEX "gb_sections_advertisement_idx" ON "gb_sections" USING btree ("advertisement_id");
  CREATE INDEX "gb_sections_board_idx" ON "gb_sections" USING btree ("board_id");
  CREATE INDEX "site_settings_site_logo_idx" ON "site_settings" USING btree ("site_logo_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "site_settings_seo_seo_og_image_idx" ON "site_settings" USING btree ("seo_og_image_id");
  CREATE INDEX "site_settings_maintenance_maintenance_background_image_idx" ON "site_settings" USING btree ("maintenance_background_image_id");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_boards_id_idx" ON "site_settings_rels" USING btree ("boards_id");
  CREATE INDEX "navigation_items_children_order_idx" ON "navigation_items_children" USING btree ("_order");
  CREATE INDEX "navigation_items_children_parent_id_idx" ON "navigation_items_children" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_children_board_idx" ON "navigation_items_children" USING btree ("board_id");
  CREATE INDEX "navigation_items_children_page_idx" ON "navigation_items_children" USING btree ("page_id");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_board_idx" ON "navigation_items" USING btree ("board_id");
  CREATE INDEX "navigation_items_page_idx" ON "navigation_items" USING btree ("page_id");
  CREATE INDEX "navigation_items_dropdown_page_idx" ON "navigation_items" USING btree ("dropdown_page_id");
  CREATE INDEX "navigation_footer_column_items_links_order_idx" ON "navigation_footer_column_items_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_column_items_links_parent_id_idx" ON "navigation_footer_column_items_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_column_items_links_page_idx" ON "navigation_footer_column_items_links" USING btree ("page_id");
  CREATE INDEX "navigation_footer_column_items_links_board_idx" ON "navigation_footer_column_items_links" USING btree ("board_id");
  CREATE INDEX "navigation_footer_column_items_order_idx" ON "navigation_footer_column_items" USING btree ("_order");
  CREATE INDEX "navigation_footer_column_items_parent_id_idx" ON "navigation_footer_column_items" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_bottom_bar_bottom_links_order_idx" ON "navigation_footer_bottom_bar_bottom_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_bottom_bar_bottom_links_parent_id_idx" ON "navigation_footer_bottom_bar_bottom_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_bottom_bar_bottom_links_page_idx" ON "navigation_footer_bottom_bar_bottom_links" USING btree ("page_id");
  CREATE INDEX "navigation_footer_bottom_bar_bottom_links_board_idx" ON "navigation_footer_bottom_bar_bottom_links" USING btree ("board_id");
  CREATE INDEX "date_time_settings_locations_order_idx" ON "date_time_settings_locations" USING btree ("_order");
  CREATE INDEX "date_time_settings_locations_parent_id_idx" ON "date_time_settings_locations" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "boards" CASCADE;
  DROP TABLE "boards_rels" CASCADE;
  DROP TABLE "posts_attachments" CASCADE;
  DROP TABLE "posts_tags" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "comments" CASCADE;
  DROP TABLE "advertisements_positions" CASCADE;
  DROP TABLE "advertisements" CASCADE;
  DROP TABLE "advertisements_rels" CASCADE;
  DROP TABLE "pages_blocks_hero_slider_slides" CASCADE;
  DROP TABLE "pages_blocks_hero_slider" CASCADE;
  DROP TABLE "pages_blocks_board_grid_boards" CASCADE;
  DROP TABLE "pages_blocks_board_grid" CASCADE;
  DROP TABLE "pages_blocks_latest_posts" CASCADE;
  DROP TABLE "pages_blocks_trending_posts" CASCADE;
  DROP TABLE "pages_blocks_popular_posts" CASCADE;
  DROP TABLE "pages_blocks_single_board" CASCADE;
  DROP TABLE "pages_blocks_advertisement_block" CASCADE;
  DROP TABLE "pages_blocks_rich_text_block" CASCADE;
  DROP TABLE "pages_blocks_banner_block" CASCADE;
  DROP TABLE "pages_blocks_recent_comments" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "announcements" CASCADE;
  DROP TABLE "login_logs" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "reports" CASCADE;
  DROP TABLE "notifications" CASCADE;
  DROP TABLE "bookmark_folders" CASCADE;
  DROP TABLE "bookmark_items" CASCADE;
  DROP TABLE "media_categories" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "hero_slides" CASCADE;
  DROP TABLE "gb_sections" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TABLE "navigation_items_children" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation_footer_column_items_links" CASCADE;
  DROP TABLE "navigation_footer_column_items" CASCADE;
  DROP TABLE "navigation_footer_bottom_bar_bottom_links" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "date_time_settings_locations" CASCADE;
  DROP TABLE "date_time_settings" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_social_provider";
  DROP TYPE "public"."enum_boards_board_type";
  DROP TYPE "public"."enum_boards_write_settings_allow_write";
  DROP TYPE "public"."enum_boards_write_settings_allow_comment_write";
  DROP TYPE "public"."enum_boards_skin_settings_grid_columns";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum_advertisements_positions";
  DROP TYPE "public"."enum_advertisements_ad_type";
  DROP TYPE "public"."enum_advertisements_link_target";
  DROP TYPE "public"."enum_advertisements_width_type";
  DROP TYPE "public"."enum_advertisements_object_fit";
  DROP TYPE "public"."enum_advertisements_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_hero_slider_slides_link_target";
  DROP TYPE "public"."enum_pages_blocks_hero_slider_height_type";
  DROP TYPE "public"."enum_pages_blocks_board_grid_boards_display_type";
  DROP TYPE "public"."enum_pages_blocks_board_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_latest_posts_display_type";
  DROP TYPE "public"."enum_pages_blocks_latest_posts_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_trending_posts_display_type";
  DROP TYPE "public"."enum_pages_blocks_trending_posts_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_popular_posts_display_type";
  DROP TYPE "public"."enum_pages_blocks_popular_posts_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_single_board_display_type";
  DROP TYPE "public"."enum_pages_blocks_single_board_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_advertisement_block_ad_type";
  DROP TYPE "public"."enum_pages_blocks_advertisement_block_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_advertisement_block_width_type";
  DROP TYPE "public"."enum_pages_blocks_rich_text_block_width_type";
  DROP TYPE "public"."enum_pages_blocks_rich_text_block_alignment";
  DROP TYPE "public"."enum_pages_blocks_banner_block_link_target";
  DROP TYPE "public"."enum_pages_blocks_banner_block_width_type";
  DROP TYPE "public"."enum_pages_blocks_banner_block_object_fit";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum_announcements_link_type";
  DROP TYPE "public"."enum_announcements_display_type";
  DROP TYPE "public"."enum_login_logs_event_type";
  DROP TYPE "public"."enum_login_logs_login_method";
  DROP TYPE "public"."enum_audit_logs_action";
  DROP TYPE "public"."enum_audit_logs_resource_type";
  DROP TYPE "public"."enum_audit_logs_actor_type";
  DROP TYPE "public"."enum_reports_target_type";
  DROP TYPE "public"."enum_reports_reason";
  DROP TYPE "public"."enum_reports_status";
  DROP TYPE "public"."enum_notifications_type";
  DROP TYPE "public"."hero_link_target";
  DROP TYPE "public"."enum_gb_sections_section_type";
  DROP TYPE "public"."gb_display_type";
  DROP TYPE "public"."enum_gb_sections_grid_columns";
  DROP TYPE "public"."hero_width";
  DROP TYPE "public"."hero_height_type";
  DROP TYPE "public"."enum_site_settings_home_settings_global_board_settings_position";
  DROP TYPE "public"."enum_site_settings_design_typography_font_family";
  DROP TYPE "public"."enum_site_settings_design_typography_base_font_size";
  DROP TYPE "public"."enum_site_settings_design_typography_heading_weight";
  DROP TYPE "public"."enum_site_settings_design_layout_max_width";
  DROP TYPE "public"."enum_site_settings_design_layout_border_radius";
  DROP TYPE "public"."enum_site_settings_design_layout_header_height";
  DROP TYPE "public"."enum_site_settings_design_layout_header_width";
  DROP TYPE "public"."enum_site_settings_design_layout_nav_width";
  DROP TYPE "public"."enum_site_settings_design_layout_announcement_width";
  DROP TYPE "public"."enum_site_settings_design_layout_main_width";
  DROP TYPE "public"."enum_site_settings_design_layout_footer_width";
  DROP TYPE "public"."enum_navigation_items_children_type";
  DROP TYPE "public"."enum_navigation_items_type";
  DROP TYPE "public"."enum_navigation_items_dropdown_link_type";
  DROP TYPE "public"."enum_navigation_footer_column_items_links_type";
  DROP TYPE "public"."enum_navigation_footer_bottom_bar_bottom_links_type";
  DROP TYPE "public"."enum_navigation_footer_columns";
  DROP TYPE "public"."enum_date_time_settings_display_mode";`)
}
