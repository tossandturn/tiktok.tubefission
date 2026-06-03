# TikTok 增强版爬虫使用指南

## 数据量提升 (10x)

| 指标 | 原版 | 增强版 |
|------|------|--------|
| 标签数量 | 20个 | 120个 |
| 视频/标签 | 10个 | 50-100个 |
| 预估总数据点 | ~200 | 6,000+ |
| 支持国家 | 1个 | 10个 |

## 新增功能

### 1. 高级反检测
- Canvas 指纹随机化
- WebGL 指纹混淆
- 字体列表伪装
- 每50请求自动重启浏览器

### 2. 多国家支持
支持以下区域配置：
- US (美国) - en-US
- GB (英国) - en-GB
- CA (加拿大) - en-CA
- AU (澳大利亚) - en-AU
- IN (印度) - en-IN
- DE (德国) - de-DE
- FR (法国) - fr-FR
- ES (西班牙) - es-ES
- JP (日本) - ja-JP
- BR (巴西) - pt-BR

### 3. 智能速率控制
- 动态延迟调整 (3-7秒基础延迟)
- 每5个请求后额外冷却
- 失败重试机制
- 速率限制检测

## API 端点

### 批量抓取标签 (100个)
```
GET /api/cron/scrape?key=SECRET&mode=bulk
```

### 抓取视频 (前10标签 × 50视频)
```
GET /api/cron/scrape?key=SECRET&mode=videos
```

### 完整流程
```
GET /api/cron/scrape?key=SECRET&mode=full
```

## 标签分类

### 娱乐类 (entertainment)
funny, comedy, meme, lol, humor, prank, viral, trending, fyp, foryou...

### 舞蹈类 (dance)
dance, dancing, dancer, choreography, dancechallenge, hiphop, ballet...

### 音乐类 (music)
music, song, singer, musician, cover, acoustic, rap, pop, guitar...

### 美食类 (food)
food, foodie, cooking, recipe, chef, homemade, foodtok, baking...

### 时尚类 (fashion)
fashion, outfit, style, ootd, beauty, makeup, skincare...

### 健身类 (fitness)
fitness, gym, workout, exercise, health, yoga, running...

### 教育类 (education)
learnontiktok, education, tutorial, howto, study, college...

### 科技类 (tech)
tech, technology, gadgets, iphone, android, coding, ai...

### 旅行类 (travel)
travel, vacation, adventure, explore, hiking, camping...

### 生活方式 (lifestyle)
lifestyle, home, diy, productivity, motivation, selfcare...

### 宠物类 (pets)
pet, dog, cat, puppy, kitten, animals...

### 汽车类 (cars)
car, auto, automotive, supercar, modified, racing...

## Vercel Cron 配置

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape?key=YOUR_SECRET_KEY&mode=bulk",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/scrape?key=YOUR_SECRET_KEY&mode=videos",
      "schedule": "0 */12 * * *"
    }
  ]
}
```

## 环境变量

```env
# CRON 安全密钥
CRON_SECRET_KEY=your-secret-key-here

# 数据库
DATABASE_URL=postgresql://...
```

## 使用代码示例

### 批量抓取标签
```typescript
import { scrapeHashtagList, ALL_HASHTAGS } from '@/lib/scraper-enhanced';

const hashtags = await scrapeHashtagList(100); // 抓取前100个标签
```

### 抓取标签视频
```typescript
import { scrapeHashtagVideos } from '@/lib/scraper-enhanced';

const videos = await scrapeHashtagVideos('dance', 50, 'US');
```

### 批量处理多个标签
```typescript
import { batchScrapeHashtags } from '@/lib/scraper-enhanced';

const results = await batchScrapeHashtags(
  ['dance', 'music', 'food'],
  30 // 每个标签30个视频
);
```

## 故障排除

### 遇到 429 Too Many Requests
- 增加延迟时间
- 减少并发数量
- 使用代理池

### 页面加载失败
- 检查网络连接
- 验证 TikTok 是否可访问
- 查看 browserless/chrome 服务状态

### 数据为空
- 检查选择器是否过期
- TikTok 可能更新了页面结构
- 尝试使用不同的 user agent

## 注意事项

1. **遵守 TikTok 服务条款**
2. **合理控制请求频率**
3. **建议使用住宅代理**
4. **定期更新 user agent 列表**
5. **监控抓取成功率**
