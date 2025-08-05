var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
/**
 * Social Media Posts API Route
 *
 * Handles CRUD operations for social media posts
 * Supports scheduling, publishing, and content management
 *
 * Research-backed implementation following:
 * - Instagram Content Publishing API guidelines
 * - Facebook Pages API posting patterns
 * - Content scheduling best practices
 * - Media handling and validation standards
 */
// Validation schemas
var createPostSchema = zod_1.z.object({
  account_id: zod_1.z.string().uuid(),
  post_type: zod_1.z.enum(["post", "story", "reel", "video", "carousel", "live"]),
  content_text: zod_1.z.string().max(2200).optional(), // Instagram caption limit
  media_urls: zod_1.z.array(zod_1.z.string().url()).default([]),
  hashtags: zod_1.z.array(zod_1.z.string()).default([]),
  mentions: zod_1.z.array(zod_1.z.string()).default([]),
  post_settings: zod_1.z.record(zod_1.z.any()).default({}),
  scheduled_time: zod_1.z.string().datetime().optional(),
  targeting_settings: zod_1.z.record(zod_1.z.any()).default({}),
  campaign_tag: zod_1.z.string().max(255).optional(),
});
var updatePostSchema = zod_1.z.object({
  content_text: zod_1.z.string().max(2200).optional(),
  media_urls: zod_1.z.array(zod_1.z.string().url()).optional(),
  hashtags: zod_1.z.array(zod_1.z.string()).optional(),
  mentions: zod_1.z.array(zod_1.z.string()).optional(),
  post_settings: zod_1.z.record(zod_1.z.any()).optional(),
  scheduled_time: zod_1.z.string().datetime().optional(),
  targeting_settings: zod_1.z.record(zod_1.z.any()).optional(),
  campaign_tag: zod_1.z.string().max(255).optional(),
  status: zod_1.z.enum(["draft", "scheduled", "published", "failed", "deleted"]).optional(),
});
/**
 * GET /api/social-media/posts
 *
 * Retrieves social media posts for the user's clinic
 * Supports filtering by account, status, date range, and campaign
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      profile,
      searchParams,
      accountId,
      status_1,
      postType,
      campaignTag,
      fromDate,
      toDate,
      limit,
      offset,
      query,
      _a,
      posts,
      error,
      count,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _b.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _b.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic access required" }, { status: 403 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          accountId = searchParams.get("account_id");
          status_1 = searchParams.get("status");
          postType = searchParams.get("post_type");
          campaignTag = searchParams.get("campaign_tag");
          fromDate = searchParams.get("from_date");
          toDate = searchParams.get("to_date");
          limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
          offset = parseInt(searchParams.get("offset") || "0");
          query = supabase
            .from("social_media_posts")
            .select(
              "\n        id,\n        account_id,\n        post_type,\n        content_text,\n        media_urls,\n        hashtags,\n        mentions,\n        post_settings,\n        scheduled_time,\n        published_time,\n        status,\n        platform_post_id,\n        platform_post_url,\n        engagement_stats,\n        targeting_settings,\n        campaign_tag,\n        error_message,\n        created_at,\n        updated_at,\n        created_by,\n        published_by,\n        social_media_accounts!inner(\n          id,\n          platform_name,\n          account_name,\n          account_handle,\n          social_media_platforms!inner(\n            platform_display_name,\n            platform_icon_url\n          )\n        ),\n        profiles!social_media_posts_created_by_fkey(\n          first_name,\n          last_name\n        )\n      ",
            )
            .eq("clinic_id", profile.clinic_id);
          // Apply filters
          if (accountId) {
            query = query.eq("account_id", accountId);
          }
          if (status_1) {
            query = query.eq("status", status_1);
          }
          if (postType) {
            query = query.eq("post_type", postType);
          }
          if (campaignTag) {
            query = query.eq("campaign_tag", campaignTag);
          }
          if (fromDate) {
            query = query.gte("created_at", fromDate);
          }
          if (toDate) {
            query = query.lte("created_at", toDate);
          }
          return [
            4 /*yield*/,
            query.order("created_at", { ascending: false }).range(offset, offset + limit - 1),
          ];
        case 4:
          (_a = _b.sent()), (posts = _a.data), (error = _a.error), (count = _a.count);
          if (error) {
            console.error("Error fetching social media posts:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: posts,
              total: count || (posts === null || posts === void 0 ? void 0 : posts.length) || 0,
              limit: limit,
              offset: offset,
            }),
          ];
        case 5:
          error_1 = _b.sent();
          console.error("Social media posts GET error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/social-media/posts
 *
 * Creates a new social media post
 * Supports both immediate publishing and scheduling
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      profile,
      body,
      validatedData,
      account,
      contentValidation,
      postStatus,
      scheduledDate,
      postData,
      _a,
      newPost,
      error,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 7, , 8]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _b.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _b.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic access required" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          validatedData = createPostSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .select("id, platform_name, status, sync_status")
              .eq("id", validatedData.account_id)
              .eq("clinic_id", profile.clinic_id)
              .single(),
          ];
        case 5:
          account = _b.sent().data;
          if (!account) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid social media account" },
                { status: 400 },
              ),
            ];
          }
          if (account.status !== "active" || account.sync_status !== "active") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Social media account is not active or synchronized" },
                { status: 400 },
              ),
            ];
          }
          contentValidation = validatePostContent(
            account.platform_name,
            validatedData.post_type,
            validatedData.content_text || "",
            validatedData.media_urls,
          );
          if (!contentValidation.valid) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Post content validation failed", details: contentValidation.errors },
                { status: 400 },
              ),
            ];
          }
          postStatus = "draft";
          if (validatedData.scheduled_time) {
            scheduledDate = new Date(validatedData.scheduled_time);
            if (scheduledDate > new Date()) {
              postStatus = "scheduled";
            } else {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Scheduled time must be in the future" },
                  { status: 400 },
                ),
              ];
            }
          }
          postData = __assign(__assign({}, validatedData), {
            clinic_id: profile.clinic_id,
            status: postStatus,
            created_by: session.user.id,
          });
          return [
            4 /*yield*/,
            supabase
              .from("social_media_posts")
              .insert([postData])
              .select(
                "\n        id,\n        account_id,\n        post_type,\n        content_text,\n        media_urls,\n        hashtags,\n        mentions,\n        scheduled_time,\n        status,\n        campaign_tag,\n        created_at,\n        social_media_accounts!inner(\n          platform_name,\n          account_name,\n          social_media_platforms!inner(\n            platform_display_name\n          )\n        )\n      ",
              )
              .single(),
          ];
        case 6:
          (_a = _b.sent()), (newPost = _a.data), (error = _a.error);
          if (error) {
            console.error("Error creating social media post:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to create post" }, { status: 500 }),
            ];
          }
          // TODO: If not scheduled, trigger immediate publishing logic
          // TODO: If scheduled, add to background job queue
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: newPost,
                message:
                  postStatus === "scheduled"
                    ? "Post scheduled successfully"
                    : "Post created successfully",
              },
              { status: 201 },
            ),
          ];
        case 7:
          error_2 = _b.sent();
          console.error("Social media posts POST error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Validates post content based on platform requirements
 */
function validatePostContent(platform, postType, content, mediaUrls) {
  var errors = [];
  switch (platform) {
    case "instagram":
      // Instagram specific validation
      if (postType === "post" && mediaUrls.length === 0) {
        errors.push("Instagram posts require at least one media file");
      }
      if (content.length > 2200) {
        errors.push("Instagram caption cannot exceed 2200 characters");
      }
      if (postType === "carousel" && mediaUrls.length < 2) {
        errors.push("Instagram carousel posts require at least 2 media files");
      }
      if (postType === "carousel" && mediaUrls.length > 10) {
        errors.push("Instagram carousel posts cannot exceed 10 media files");
      }
      break;
    case "facebook":
      // Facebook specific validation
      if (content.length > 63206) {
        errors.push("Facebook post content cannot exceed 63,206 characters");
      }
      break;
    case "whatsapp_business":
      // WhatsApp Business specific validation
      if (postType !== "post") {
        errors.push("WhatsApp Business only supports regular posts");
      }
      if (content.length > 4096) {
        errors.push("WhatsApp message cannot exceed 4096 characters");
      }
      break;
    case "tiktok":
      // TikTok specific validation
      if (postType === "post" && mediaUrls.length === 0) {
        errors.push("TikTok posts require video content");
      }
      if (content.length > 300) {
        errors.push("TikTok caption cannot exceed 300 characters");
      }
      break;
    case "linkedin":
      // LinkedIn specific validation
      if (content.length > 3000) {
        errors.push("LinkedIn post content cannot exceed 3000 characters");
      }
      break;
  }
  return {
    valid: errors.length === 0,
    errors: errors,
  };
}
