# TikTok Intelligence - 爬虫配置

## 环境变量设置

### Vercel 环境变量

在 Vercel Dashboard → Settings → Environment Variables 中添加：

```
CRON_SECRET_KEY=your-random-secret-key-here
```

生成强密钥：
```bash
openssl rand -base64 32
```

### GitHub Secrets（必需）

在 GitHub 仓库 → Settings → Secrets and variables → Actions 中添加：

```
CRON_SECRET_KEY=your-same-secret-key-here
```

**重要**: 必须与 Vercel 中的 `CRON_SECRET_KEY` 完全相同！

## 定时任务配置

### 方案 1: GitHub Actions（推荐）- 每6小时运行

文件: `.github/workflows/scraper.yml`

**频率**: 每天运行4次 (00:00, 06:00, 12:00, 18:00 UTC)
- 扫描 TikTok Discover 页面获取热门话题 (最多15个)
- 更新数据库中热门话题的详细数据 (最多3个)
- 两次操作间隔 30 秒

**手动触发**:
1. 进入 GitHub 仓库 → Actions → TikTok Scraper
2. 点击 "Run workflow"
3. 选择模式: `discover`, `update`, 或 `full`

### 方案 2: Vercel Cron（备用）- 每天运行1次

文件: `vercel.json`

**频率**: 每天凌晨 2 点 (UTC)

**注意**: Vercel Hobby 账户限制每天只能运行一次定时任务。

## 反检测措施

爬虫已实现以下防封措施：

1. **随机延迟**
   - 页面加载前: 2-7秒随机延迟
   - 元素处理间: 0.5-3秒随机延迟
   - 话题间: 10-15秒延迟
   - 两次操作间: 30秒延迟

2. **浏览器指纹伪装**
   - 随机 User-Agent (Chrome/Firefox/Safari)
   - 随机窗口分辨率 (1920x1080, 1366x768, 1440x900, 1536x864)
   - 模拟真实浏览器插件
   - 移除 webdriver automation 标志
   - 禁用 blink automation 控制特征

3. **人性化行为**
   - 随机鼠标移动
   - 自然滚动速度 (100-400px)
   - 滚动后等待 (0.5-1.5秒)

4. **请求限速**
   - 每次运行最多处理15个新话题
   - 更新最多3个现有话题
   - 单次运行不超过5分钟 (Vercel 限制)

5. **HTTP Headers**
   - 真实 Accept-Language
   - 完整 Sec-Fetch headers
   - DNT (Do Not Track) 标志
   - Keep-Alive 连接

## 手动触发

本地测试：
```bash
# 设置环境变量
export CRON_SECRET_KEY=your-secret-key

# 触发 Discover 扫描
curl "http://localhost:3000/api/cron/scrape?key=$CRON_SECRET_KEY&mode=discover"

# 触发话题更新
curl "http://localhost:3000/api/cron/scrape?key=$CRON_SECRET_KEY&mode=update"

# 触发完整流程 (discover + update)
curl "http://localhost:3000/api/cron/scrape?key=$CRON_SECRET_KEY&mode=full"
```

生产环境手动触发：
```bash
# 获取你的 CRON_SECRET_KEY 值，替换 YOUR_SECRET_KEY
curl "https://tiktok-intelligence-eta.vercel.app/api/cron/scrape?key=YOUR_SECRET_KEY&mode=full"
```

## 查看爬虫日志

```bash
# 查看最近50条日志
curl "https://tiktok-intelligence-eta.vercel.app/api/cron/logs?key=YOUR_SECRET_KEY&limit=50"
```

日志包含：
- 每次运行的状态 (success/error)
- 抓取的项目数
- 错误信息
- 运行时间戳

## 监控

查看爬虫日志位置：
1. **GitHub Actions** → TikTok Scraper → 查看运行日志
2. **Vercel Dashboard** → Functions → `/api/cron/scrape`
3. **数据库表** `ScrapeLog` 记录每次运行状态

### GitHub Actions 监控（每小时）

自动每小时检查爬虫状态：
- 成功率统计
- 最近运行状态  
- 失败率警报（超过50%失败触发警告）

文件: `.github/workflows/scraper-status.yml`

查看方式：
1. GitHub 仓库 → Actions → Scraper Status Check
2. 点击最新运行记录查看状态
3. Artifacts 可下载详细状态 JSON

## 安全建议

1. **CRON_SECRET_KEY** 必须保密，不要提交到 Git
2. **同时更新** Vercel 和 GitHub 中的密钥（保持相同）
3. 发现 rate limit 时，可在 GitHub Actions 页面取消正在运行的工作流
4. 考虑使用代理服务（如 Bright Data）作为备用方案

### 密钥设置检查清单

- [ ] Vercel Dashboard → Environment Variables → `CRON_SECRET_KEY`
- [ ] GitHub 仓库 → Settings → Secrets → Actions → `CRON_SECRET_KEY`
- [ ] 两个地方的密钥值完全相同

## Rate Limit 应对

如果触发 TikTok 限制：

1. **短期应对**:
   - 增加 vercel.json 中的时间间隔（改为每2天或每周）
   - 减少每次抓取的数据量（修改 route.ts 中的 limit: 15 → 5）
   - 增加延迟时间（randomDelay 参数调高）

2. **长期方案**:
   - 升级到 Vercel Pro 计划（可运行更多定时任务）
   - 使用外部爬虫服务（如 ScrapingBee, Bright Data）
   - 使用 residential proxy

3. **监控指标**:
   - 日志中出现 "rate limit" 或 "403" 错误
   - 成功率低于 50%
   - 连续多次失败

## 升级建议

### 更高频率

当前配置：**每6小时运行**（每天4次）

如需更频繁，修改 `.github/workflows/scraper.yml`:
```yaml
# 每4小时
- cron: '0 */4 * * *'

# 每2小时  
- cron: '0 */2 * * *'

# 每小时（不推荐，易被封）
- cron: '0 * * * *'
```

**注意**: 更高频率增加被封风险，建议配合代理使用。

### 多账号轮询

如需大量抓取，可配置多个 TikTok 账号轮询：
1. 使用不同的 session cookies
2. 随机选择账号
3. 失败时自动切换账号

## 技术细节

- **Playwright**: 使用 Chromium 无头浏览器
- **内存限制**: Vercel Function 有 1024MB 内存限制
- **执行时间**: 最多 300 秒 (5分钟)
- **并发**: 单线程，避免触发反爬机制