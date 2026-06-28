# TikTok Intelligence 重构方案

## 产品定位
**TikTok创作者增长智能平台** - 帮助创作者发现爆款潜力视频、分析账号价值、预测内容趋势

## 核心功能（P0）

### 1. 潜力视频雷达（Virality Radar）
**目标**: 找到还没火但即将爆的视频
- 监控10万+热门创作者的最新发布
- AI评分：基于前30分钟数据预测爆火概率
- 关键指标：互动增速、完播率、分享率
- 预警通知：当发现高潜力视频时推送

### 2. 创作者数据中心（Creator Analytics）
**目标**: 全面分析自己的视频和账号
- 视频表现对比（横向+纵向）
- 最佳发布时间推荐
- 粉丝增长追踪
- 内容类型效果分析

### 3. 账号价值评估（Account Valuation）
**目标**: 量化账号商业价值
- 综合评分算法：粉丝质量40% + 互动率30% + 成长速度20% + 内容质量10%
- 同领域排名
- 商业变现潜力估算
- 竞品对比分析

### 4. 趋势预测引擎（Trend Forecast）
**目标**: 提前3-7天发现即将流行的内容
- 音乐趋势检测
- 话题热度分析
- 挑战赛发现
- 地区/领域细分

## MVP功能列表

### Phase 1（第1-2周）
1. 潜力视频雷达 - 基础版
   - Apify抓取热门创作者视频
   - 简单增速计算
   - 列表展示

2. 创作者个人主页分析
   - 输入自己的TikTok链接
   - 展示基本数据和图表

### Phase 2（第3-4周）
3. 账号价值评分系统
4. 趋势预测基础版
5. 用户系统（登录/注册）

### Phase 3（第5-6周）
6. 高级筛选和搜索
7. 邮件/推送通知
8. 付费订阅功能

## 数据结构

### 核心模型
```
Creator（创作者）
- id, username, displayName, avatar
- followers, following, likes
- niche（领域）, country
- metrics（综合指标）
- score（账号价值分）

Video（视频）
- id, creatorId
- views, likes, comments, shares
- engagementRate（互动率）
- viralScore（爆款潜力分）
- publishedAt, scrapedAt
- isViral, isPotential（是否潜力视频）

Trend（趋势）
- id, name, type（music/hashtag/challenge）
- growthRate, velocity
- saturation（饱和度）
- predictedPeak（预测峰值时间）

UserVideo（用户自己的视频）
- userId, videoId
- 关联用户的TikTok账号
- 用于个人分析
```

## 核心算法

### 潜力视频评分算法
```
viralScore = (
  0.35 * engagementVelocity +    // 互动增速
  0.25 * viewVelocity +            // 播放量增速
  0.20 * shareRate +               // 分享率
  0.15 * commentQuality +           // 评论质量
  0.05 * timingBonus                // 发布时间 bonus
) * 100

engagementVelocity = (当前互动数 - 1小时前互动数) / 1小时前互动数

Potential阈值：viralScore > 75
```

### 账号价值评分算法
```
accountValue = (
  0.40 * followerQuality +         // 粉丝质量（活粉率）
  0.30 * engagementRate +            // 平均互动率
  0.20 * growthVelocity +          // 成长速度
  0.10 * contentConsistency        // 内容一致性
) * 100
```

## UI/UX设计

### 页面结构
```
/                    - Dashboard（数据总览）
/radar               - 潜力视频雷达
/analytics           - 我的数据分析
/valuation           - 账号价值评估
/trends              - 趋势预测
/explore             - 探索/搜索
/settings            - 设置
```

### 设计原则
1. 深色主题（#000000背景）
2. TikTok品牌色（#00f2ea青色, #ff0050粉色）
3. 卡片式布局
4. 数据可视化优先
5. 移动端优先（响应式）

## 技术栈
- Next.js 14 App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL (Neon)
- Apify API
- Vercel部署

## 数据流
1. Cron Job每天2次从Apify抓取数据
2. 数据清洗后存入Neon
3. 计算各项评分和指标
4. 前端通过API获取数据展示

## 竞品差异
vs Social Blade: 更专注于TikTok，有潜力视频预测
vs TikTok Analytics: 有竞品分析，有趋势预测
vs 其他工具: 有账号价值评估，有自动化发现
