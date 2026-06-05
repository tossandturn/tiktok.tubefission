# Apify TikTok Scraper 配置指南

## 概述

Apify TikTok Scraper 是主要的数据抓取方案，提供免费额度（10,000 compute units/月）。

- **Actor**: [curious_coder/tiktok-scraper](https://apify.com/curious_coder/tiktok-scraper)
- **免费额度**: 约 2-3 小时运行时间/月
- **数据存储**: Neon PostgreSQL
- **调度**: GitHub Actions

## 配置步骤

### 1. 注册 Apify 账户

1. 访问 https://apify.com
2. 使用 GitHub/Google 账号注册
3. 进入 Console → Settings → Integrations
4. 复制 **API Token**

### 2. 配置环境变量

在 Vercel Dashboard → Settings → Environment Variables 中添加：

```
APIFY_API_TOKEN=your-apify-token-here
APIFY_TIKTOK_SCRAPER_ACTOR=curious_coder/tiktok-scraper
```

同时在 GitHub Secrets 中添加：
- Settings → Secrets → Actions → `APIFY_API_TOKEN`

### 3. 本地开发

在 `.env` 文件中添加：

```env
# Apify TikTok Scraper (主要数据源)
APIFY_API_TOKEN=your-apify-token-here
APIFY_TIKTOK_SCRAPER_ACTOR=curious_coder/tiktok-scraper
```

## 使用方法

### API 端点

**触发同步**:
```bash
curl "https://tiktok.tubefission.com/api/cron/apify-sync?key=YOUR_CRON_KEY&country=US&mode=hashtags&limit=50"
```

参数：
- `country`: US, JP, KR, GB, HK, TW (默认 US)
- `mode`: hashtags, profiles, search (默认 hashtags)
- `limit`: 1-100 (默认 50)

### 支持的抓取模式

1. **hashtags** - 按热门 hashtag 抓取视频
   - fyp, viral, trending, foryou
   - 按国家配置不同 hashtags

2. **profiles** - 抓取指定创作者的视频
   - charlidamelio, khaby.lame 等

3. **search** - 按关键词搜索
   - "trending", "viral" 等

## 数据流向

```
Apify Scraper → 抓取视频 → 转换数据 → Neon 数据库 → Vercel 前端
     ↑                                              ↓
GitHub Actions (每6小时触发) ← 定时任务调度
```

## 配额管理

- **免费额度**: 10,000 CU/月
- **典型用量**:
  - 抓取 50 个视频: ~50-100 CU
  - 抓取 100 个视频: ~100-200 CU
  - 每天运行 4 次: ~400-800 CU/天
  - 每月用量: ~12,000-24,000 CU (超出免费额度)

### 节省配额建议

1. 每天运行 2 次（每12小时）
2. 每次限制 30-50 个视频
3. 使用 `datacenter` proxy（比 `residential` 便宜）
4. 只对重点国家启用（US, JP）

## 监控

### 查看配额使用

```bash
curl "https://api.apify.com/v2/users/me/usage" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 查看运行日志

1. Vercel Dashboard → Functions → `/api/cron/apify-sync`
2. 或 GitHub Actions → TikTok Scraper workflow

## 故障排查

### "API quota exceeded"

- 检查配额使用: `getAccountUsage()`
- 减少抓取频率或数量
- 考虑升级到付费计划

### "Run timeout"

- 默认等待 5 分钟
- 增加超时时间: `waitForRunCompletion(runId, 10)`
- 或减少每次抓取数量

### "Actor not found"

- 确认 `APIFY_TIKTOK_SCRAPER_ACTOR` 配置正确
- 默认: `curious_coder/tiktok-scraper`

## 与 PrimeApi 对比

| 特性 | Apify | PrimeApi |
|------|-------|----------|
| 免费额度 | 10,000 CU/月 | 50 requests |
| 稳定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 数据完整性 | 完整视频+创作者 | Hashtag 趋势 |
| 速度 | 慢（需等待运行）| 快（直接 API）|
| 推荐用途 | 主要数据源 | 备用/补充 |

## 迁移到 Apify

项目已支持双数据源：

1. **主要**: Apify (完整数据)
2. **备用**: PrimeApi (快速趋势)

运行顺序：
1. Apify 抓取完整视频数据
2. PrimeApi 补充 hashtag 趋势

这样即使 Apify 额度用完，仍有 PrimeApi 作为备份。

## 相关文件

- `src/lib/apify.ts` - Apify 服务
- `src/app/api/cron/apify-sync/route.ts` - 同步 API
- `.github/workflows/scraper.yml` - GitHub Actions 调度
