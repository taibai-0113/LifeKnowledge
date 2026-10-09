# V4｜成年人生活常识 App

## Vibe Coding Master Prompt

**项目代号：** LifeKnowledge / 人生常识
**产品暂名：** 人生常识
**产品定位：** 成年人的生活常识补全系统
**开发方式：** Vibe Coding / AI Agent 辅助开发
**目标：** 构建一个移动端优先、内容驱动、知识图谱驱动、可持续扩展的生活常识产品。

---

# 第一部分：给 AI Agent 的最高级指令

你现在不是在自由发挥设计一个新产品。

你正在：

> **严格实现一个已经完成产品定义、知识架构和 UI/UX 设计的产品。**

产品名称：

# 人生常识

产品核心目标：

> **把没人系统教过成年人的生活常识补起来。**

产品必须包含两个核心模块：

### 模块 A：人生知识档案

回答：

> **“我应该知道什么？”**

以行动型知识为主。

### 模块 B：扫清生活盲区

回答：

> **“事情其实是怎样的？”**

以认知型知识为主。

---

# 第二部分：绝对产品原则

以下原则是硬约束。

## 1. 不要自行改变产品定位

不要把它改成：

社交 App。

新闻 App。

课程 App。

医疗 App。

百科 App。

短视频 App。

AI Chat App。

---

## 2. 不要自行扩大 MVP

除非明确要求，否则不要加入：

社区。

评论。

排行榜。

积分商城。

直播。

复杂会员系统。

广告系统。

复杂社交关系。

---

## 3. 不要硬编码知识内容

知识必须数据驱动。

必须做到：

> 新增一条知识 ≠ 修改前端代码。

---

## 4. Card 不是知识本身

底层知识模型必须遵守：

```text
Concept
↓
Claim
↓
Card

Concept ↔ Concept
Relation

Claim → Source
```

不要直接建立：

```text
Article 1
Article 2
Article 3
```

这样的扁平内容模型。

---

## 5. 不要因为相似就删除知识

系统必须区分：

```text
duplicate
same_concept_new_angle
related
new_concept
uncertain
```

相似不等于重复。

---

## 6. AI 不能自行创造“科学事实”

AI 可以：

发现候选知识。

聚类。

去重。

生成草稿。

建立关系。

改写为“说人话”。

但：

> 医疗、法律、金融、安全等内容不得仅凭模型记忆直接作为事实发布。

必须存在来源或明确标识为待审核内容。

---

# 第三部分：默认技术栈

如果当前项目环境没有强制技术要求，优先使用：

```text
Frontend:
Next.js
React
TypeScript

Styling:
Tailwind CSS

Component:
shadcn/ui 或等价可维护组件系统

Backend:
Next.js Server Actions / Route Handlers

Database:
PostgreSQL

Preferred managed backend:
Supabase

Authentication:
Supabase Auth

Vector Search:
PostgreSQL + pgvector（如果当前环境支持）

Search:
PostgreSQL Full Text Search
+
Semantic Search

Hosting:
Vercel 或等价平台

PWA:
支持移动端安装

Analytics:
先建立统一 analytics abstraction，
默认可以使用轻量方案。
```

要求：

> 使用当前项目环境可用的稳定版本，不要人为锁死非常具体的旧版本。

如果项目已经存在：

> 优先适配现有架构，而不是推倒重来。

---

# 第四部分：产品信息架构

底部导航固定为：

```text
首页
档案
盲区
随机
我的
```

---

# 页面结构

```text
App
│
├── 首页
│
├── 人生知识档案
│   ├── 推荐
│   ├── 分类
│   ├── A级
│   └── 进度
│
├── 扫清生活盲区
│   ├── 今日
│   ├── 你以为其实不是
│   ├── 为什么会这样
│   ├── 买东西前先知道
│   └── 场景
│
├── 随机
│
├── 我的
│   ├── 收藏
│   ├── 已掌握
│   ├── 待行动
│   ├── 阅读历史
│   ├── 生活状态
│   └── 设置
│
└── 全局
    ├── 搜索
    ├── 卡片详情
    ├── 来源
    ├── 相关知识
    ├── 分享
    └── 举报 / 内容纠错
```

---

# 第五部分：核心知识系统

必须实现：

# Knowledge Concept

## Concept

一个具有清晰边界、可独立成立的知识节点。

例如：

```text
Concept:
商业罐藏食品的保存机制
```

而不是：

```text
Concept:
罐头
```

---

# Claim

Concept 下的核心事实。

例如：

```text
适当热处理可以降低导致食品腐败的微生物风险。

密封包装能够减少后续污染。
```

---

# Card

用户看到的内容呈现。

同一个 Concept 可以拥有多个 Card。

例如：

```text
为什么罐头能保存很久？

罐头是不是因为防腐剂很多？

为什么未开封罐头通常不需要冷藏？

为什么罐头开封后需要冷藏？
```

这些可以属于同一个 Concept。

---

# Relation

Concept 与 Concept 之间建立关系：

```text
related_to
explains
explained_by
prerequisite
example_of
misconception_about
opposite_of
caused_by
leads_to
alternative_to
```

---

# Source

事实来源。

要求：

> Claim 与 Source 建立关系。

不要只给 Card 挂一个模糊的“来源”。

---

# 第六部分：数据库设计

至少建立以下表。

```text
concepts
claims
cards
card_versions

sources
claim_sources

relations

categories
tags
concept_tags
card_tags

contexts

users
user_profiles

user_knowledge_states
user_card_states
reading_history

collections
collection_items

action_items

concept_exposures

recommendation_events
dismiss_events
search_events

content_candidates
review_queue

reports
audit_logs
```

---

# 第七部分：Concept Schema

至少包含：

```typescript
type KnowledgeConcept = {
  id: string
  name: string
  canonicalQuestion: string
  canonicalSummary: string

  domain: string
  topic?: string
  parentConceptId?: string

  status:
    | "draft"
    | "candidate"
    | "published"
    | "review"
    | "archived"

  difficulty: 1 | 2 | 3 | 4 | 5

  origin:
    | "reference_book"
    | "editorial"
    | "user_question"
    | "research"
    | "official_source"
    | "ai_discovered"

  qualityScore?: number

  createdAt: string
  updatedAt: string
  verifiedAt?: string
  nextReviewAt?: string
}
```

---

# 第八部分：Claim Schema

```typescript
type KnowledgeClaim = {
  id: string
  conceptId: string

  claimType:
    | "fact"
    | "inference"
    | "recommendation"

  claimText: string

  canonical: boolean

  confidence?: number

  evidenceLevel:
    | "very_strong"
    | "strong"
    | "moderate"
    | "limited"
    | "uncertain"

  status:
    | "supported"
    | "mixed"
    | "uncertain"
    | "controversial"
    | "outdated"

  version: number

  createdAt: string
  updatedAt: string
}
```

---

# 第九部分：Card Schema

```typescript
type KnowledgeCard = {
  id: string

  conceptId: string
  primaryClaimId?: string

  type:
    | "action"
    | "blindspot"
    | "misconception"
    | "explanation"
    | "scenario"
    | "emergency"

  module:
    | "life_archive"
    | "blindspot"

  title: string
  subtitle?: string

  oneLine: string

  body?: string

  misconception?: string
  reality?: string

  why?: string

  actionSteps?: string[]

  cost?: string
  benefit?: string

  grade?: "A+" | "A" | "B" | "C"

  evidenceLevel?:
    | "very_strong"
    | "strong"
    | "moderate"
    | "limited"
    | "uncertain"

  riskLevel?:
    | "low"
    | "medium"
    | "high"
    | "critical"

  angle?:
    | "what"
    | "why"
    | "how"
    | "misconception"
    | "risk"
    | "action"
    | "comparison"
    | "example"
    | "scenario"
    | "cost"
    | "benefit"
    | "exception"
    | "history"
    | "mechanism"

  difficulty: 1 | 2 | 3 | 4 | 5

  region?: string[]
  audience?: string[]
  scenarios?: string[]

  tags?: string[]

  status:
    | "draft"
    | "review"
    | "published"
    | "archived"

  publishedAt?: string
  updatedAt: string
  verifiedAt?: string
}
```

---

# 第十部分：Source Schema

```typescript
type KnowledgeSource = {
  id: string

  organization?: string
  title: string
  author?: string

  url: string

  sourceType:
    | "official"
    | "guideline"
    | "systematic_review"
    | "meta_analysis"
    | "peer_reviewed"
    | "database"
    | "textbook"
    | "professional_org"
    | "other"

  publicationDate?: string

  region?: string
  language?: string

  retrievedAt: string

  status:
    | "active"
    | "broken"
    | "outdated"
    | "review"
}
```

---

# 第十一部分：知识去重机制

必须实现：

# Semantic Deduplication

新增内容进入：

```text
Candidate
↓
提取 canonical claim
↓
Embedding
↓
Vector Search
↓
Top-K 相似 Concept
↓
Similarity + Rule Engine
↓
AI Classification
↓
Editor Review
```

AI 输出必须是：

```text
duplicate
same_concept_new_angle
related
new_concept
uncertain
```

并返回：

```text
confidence
reason
candidateConceptIds
```

---

# 去重逻辑

不要简单：

```text
similarity > threshold => delete
```

应该：

```text
高度相似
→ 标记审核

同 Concept 新角度
→ 允许创建 Card

相关
→ 创建 Relation

真正全新
→ 创建 Concept
```

---

# 第十二部分：知识关系

详情页必须显示相关知识。

例如：

```text
你可能还想知道

为什么冰箱不能让食物永远不坏？

食品为什么会腐败？

冷冻和冷藏有什么区别？
```

后台 Relation：

```text
sourceConceptId
relationType
targetConceptId
confidence
```

---

# 第十三部分：用户状态

每个用户对每张 Card 至少有：

```text
unseen
seen
saved
known
mastered
acted
dismissed
```

同时记录：

```text
firstSeenAt
lastSeenAt
savedAt
masteredAt
actedAt
dismissReason
```

---

# Concept Exposure

还必须记录：

```text
conceptId
userId

timesSeen
lastSeenAt

cardsSeen
anglesSeen

mastered
```

用途：

> 防止同一个 Concept 无限重复出现。

---

# 第十四部分：推荐系统

V1 使用：

# Rule-based Recommendation

不要第一版直接训练复杂推荐模型。

推荐因素：

```text
relevance
importance
novelty
userInterest
behaviorFeedback
exploration
topicDiversity
conceptDiversity
angleDiversity
```

可以采用初始权重：

```text
relevance       30%
importance      25%
novelty         15%
interest        15%
feedback        10%
exploration      5%
```

但必须把权重配置化，而不是写死在多个文件里。

---

# 推荐必须有：

### Concept 重复惩罚

### Topic 重复惩罚

### Angle 重复惩罚

### Category 重复惩罚

### 已掌握惩罚

### 已明确“不感兴趣”惩罚

---

# 第十五部分：每日推荐配方

默认首页：

```text
1 × 人生知识档案
1 × 生活盲区
1 × 与你有关
1 × 探索
```

用户连续看到的内容必须尽量：

> 不同 Concept。

> 不同主题。

> 不同角度。

> 不同难度。

---

# 第十六部分：UI/UX 总原则

视觉：

> 极简、安静、现代、编辑感、内容优先。

不要：

玻璃拟态。

大量渐变。

游戏化。

大面积装饰。

短视频式刺激。

---

# 第十七部分：首页结构

首页必须包含：

```text
顶部问候

今天给自己补一个常识

今日核心卡

与你有关

扫清一个盲区

继续人生知识档案

随机发现

Bottom Navigation
```

首页模块不能无限增加。

---

# 第十八部分：卡片组件

必须建立统一组件：

```text
KnowledgeCard
ActionCard
BlindspotCard
EmergencyCard
```

组件必须数据驱动。

不要：

```tsx
if title === "罐头"
```

这样的业务逻辑。

---

# 第十九部分：ActionCard

重点显示：

```text
标题

A / A+ / B / C

一句话建议

成本

收益

怎么做

证据
```

CTA：

```text
收藏
已掌握
加入待行动
```

---

# 第二十部分：BlindspotCard

重点显示：

```text
你可能以为

实际上

为什么

记住
```

CTA：

```text
收藏
已知道
继续了解
```

---

# 第二十一部分：EmergencyCard

重点显示：

```text
发生了什么

第一步

第二步

不要做什么

什么时候需要专业帮助

官方渠道
```

第一屏必须能够看到：

> 第一件应该做什么。

---

# 第二十二部分：卡片详情页

必须支持渐进式阅读：

```text
第一层：
一句话结论

第二层：
为什么

第三层：
注意事项 / 例外

第四层：
证据

第五层：
相关知识
```

不要把全文一次全部铺出来。

---

# 第二十三部分：搜索

必须同时支持：

```text
Title Search
Full Text Search
Tag Search
Category Search
Semantic Search
```

用户可以输入：

```text
喝粥好不好

牙齿为什么黄

第一次租房注意什么

被骗怎么办
```

不是只匹配关键词。

---

# 第二十四部分：收藏

用户可以：

```text
收藏
已掌握
待行动
```

我的页面中显示：

```text
收藏
已掌握
待行动
阅读历史
```

---

# 第二十五部分：待行动

Action Card 才允许：

> 加入待行动。

待行动支持：

```text
pending
completed
cancelled
```

用户完成后：

> 记录为已行动。

---

# 第二十六部分：生活状态

Onboarding 支持：

```text
独居
租房
开车
养宠物
有伴侣
有孩子
经常旅行
自己做饭
自由职业
```

这些信息只用于推荐。

不要用于任何未经授权的敏感推断。

---

# 第二十七部分：Onboarding

最多三屏。

第一屏：

```text
成年人生活常识

把没人系统教过你的
生活常识补起来。

开始
```

第二屏：

> 你更想补哪些？

第三屏：

> 哪些情况与你有关？

允许跳过。

禁止强制注册墙。

用户应该无需登录即可：

> 浏览第一张卡。

需要收藏 / 同步 / 个性化时再登录。

---

# 第二十八部分：分类

一级分类：

```text
健康与身体
饮食与营养
口腔
睡眠
运动
医疗与就医
用药
家庭安全
食品与厨房
居住
交通
金钱
法律与权益
网络与数字生活
工作
家庭与关系
性与生育
出行与旅行
消费与购物
社会生活
```

分类页不要全部堆满。

默认显示重要类别。

提供：

> 查看全部。

---

# 第二十九部分：生活盲区栏目

至少支持：

```text
你以为，其实不是
为什么会这样
这些东西到底怎么工作
买东西之前先知道
身体为什么会这样
发生这种事情以后怎么办
```

---

# 第三十部分：响应式

优先：

> 375–430px 手机宽度。

同时支持：

> Tablet

> Desktop

桌面端建议：

```text
左侧导航
中央内容
右侧辅助信息
```

中央内容最大宽度约：

> 720–900px。

---

# 第三十一部分：无障碍

必须做到：

```text
足够文本对比度

按钮触控区域 >= 44px

图标有 aria-label

信息不能仅依靠颜色传递

键盘可操作

重点内容可被 Screen Reader 正确读取
```

---

# 第三十二部分：PWA

第一版支持：

```text
Installable PWA
Responsive
Offline cache for recently viewed cards
```

最低离线能力：

> 最近打开的知识卡可以继续阅读。

---

# 第三十三部分：安全要求

必须：

### Server-side secrets

任何 API Key 不得暴露在客户端。

### Supabase RLS

用户只能读取 / 修改自己的用户状态。

### Admin

内容编辑权限与普通用户权限分离。

### Audit Log

记录内容修改。

### Input Validation

所有用户输入验证。

### Rate Limit

搜索、举报等接口基本限流。

---

# 第三十四部分：后台 CMS

必须提供最基本的：

# Content Admin

功能：

```text
Concept 管理

Claim 管理

Card 管理

Source 管理

Relation 管理

Tag 管理

Review Queue

User Reports

Knowledge Candidates
```

---

# 第三十五部分：后台最重要的页面

## Concept Detail

显示：

```text
Concept

Canonical Summary

Claims

Cards

Relations

Sources

Coverage

Duplicate Candidates

Quality Score
```

---

# 第三十六部分：重复检查后台

新增内容时：

```text
新 Card

↓
系统给出：

高度相似：
Concept A 93%

相关：
Concept B 84%

相关：
Concept C 77%
```

并显示：

> 为什么判断相似。

管理员选择：

```text
合并
挂到已有 Concept
建立 Relation
创建新 Concept
返回修改
```

---

# 第三十七部分：Knowledge Coverage

后台要能看到：

```text
健康        72%
饮食        81%
口腔        64%
家庭安全    35%
法律        28%
数码        51%
```

另外显示：

> 哪些分类缺少重要 Concept。

---

# 第三十八部分：Knowledge Gap

后台自动收集：

```text
无结果搜索
高频搜索
低满意度搜索
缺少 Angle 的 Concept
用户频繁追问
内容举报
新来源
```

形成：

# Content Opportunity Queue

---

# 第三十九部分：内容生产工作流

严格按照：

```text
Candidate
↓
Research
↓
Duplicate Check
↓
Concept Decision
↓
Claim Creation
↓
Source Linking
↓
Card Draft
↓
Fact Check
↓
Editorial Review
↓
Publish
```

AI 只能辅助。

不能绕过审核流程。

---

# 第四十部分：内容导入

必须支持批量导入：

```text
JSON
CSV
```

并且设计：

# Importer

这样未来可以导入：

> 《高性价比人生指南》

以及其他已经授权的内容来源。

重要：

> 不要把外部网站内容直接写死进前端。

---

# 第四十一部分：参考知识库

第一阶段内容可以以：

> 《高性价比人生指南》

为重要底库。

但产品架构不得把它写成：

```text
bookPage
bookSection
bookCard
```

它应当成为：

```text
origin = reference_book
```

的一种内容来源。

如果没有获得完整原始数据文件：

> 不要擅自生成“670 条真实内容”。

可以先建立导入接口，并用少量已核验示例数据做演示。

---

# 第四十二部分：Demo Seed Data

首次启动必须有可体验数据。

建议：

```text
10–20 Action Cards
10–20 Blindspot Cards
3–5 Emergency Cards
```

总计：

> 25–45 个 Demo Cards。

这些 Demo Data 必须：

> 结构完整。

> 不得伪造引用。

> 如果来源暂时未提供，必须明确标记：

```text
demo / verification required
```

不能假装来源真实存在。

---

# 第四十三部分：不要为了 Demo 伪造科学数字

例如不要自行编：

> “某行为降低 37.4% 风险。”

除非来源数据已经提供。

Demo 可以使用：

> 原理型知识。

也可以使用：

> 已确认的参考内容。

---

# 第四十四部分：Analytics

建立统一事件：

```text
card_view
card_complete
card_save
card_unsave
card_mark_known
card_master
action_add
action_complete
card_dismiss
search
search_result_click
source_view
related_card_click
share
report
```

推荐系统必须能够使用这些数据。

---

# 第四十五部分：核心指标

第一版关注：

```text
First Card Completion Rate
Save Rate
Known Rate
Action Completion Rate
7-day Return
Search Success Rate
Knowledge Gap Rate
Duplicate Rate
```

不要把：

> 页面停留时间

作为唯一核心指标。

---

# 第四十六部分：开发阶段管理

不要一次生成全部系统。

严格分五阶段。

---

# Phase 1

## Project Foundation

先完成：

```text
项目初始化
技术栈
路由
Design Tokens
数据库连接
基础 Schema
Authentication
基础 App Shell
Bottom Nav
```

完成后暂停。

不要继续自动进入下一阶段。

---

# Phase 2

## Knowledge Engine

完成：

```text
Concept
Claim
Card
Source
Relation

CRUD

Search

Tags

Duplicate Detection Interface

Content Admin
```

完成后暂停。

---

# Phase 3

## User Experience

完成：

```text
Home
Life Archive
Blindspot
Random
Card Detail
Search
Favorites
Mastered
Action Items
Profile
Onboarding
```

完成后暂停。

---

# Phase 4

## Recommendation

完成：

```text
User Profile
Concept Exposure

Recommendation Scoring

Topic Diversity
Concept Diversity
Angle Diversity

Personalized Home
```

完成后暂停。

---

# Phase 5

## QA / Polish / Launch

完成：

```text
Responsive
PWA
Accessibility
Performance
Security
Error State
Loading
Empty State
Analytics
SEO
Testing
Deployment
```

---

# 第四十七部分：开发纪律

每个 Phase 开始前：

### 第一步

阅读现有项目。

### 第二步

告诉我：

```text
当前项目状态
已有结构
准备修改什么
不会修改什么
```

### 第三步

执行。

### 第四步

运行：

```text
lint
typecheck
tests
build
```

### 第五步

报告：

```text
完成
未完成
已知问题
下一步建议
```

除非我明确要求：

> 不自动进入下一 Phase。

---

# 第四十八部分：Coding Rules

必须：

```text
TypeScript strict
可维护组件
小型纯函数优先
服务端与客户端职责清楚
数据库访问封装
错误边界
loading state
empty state
error state
```

禁止：

```text
any 滥用
巨型组件
页面级重复代码
magic numbers
散落的颜色值
散落的 API URL
敏感信息进入客户端
```

---

# 第四十九部分：Component Rules

任何重复两次以上的 UI：

> 提取为组件。

任何产品逻辑：

> 不直接写在视觉组件里。

例如：

```text
RecommendationEngine
KnowledgeRepository
SearchService
DeduplicationService
```

与：

```text
KnowledgeCard
HomeSection
SearchResult
```

分离。

---

# 第五十部分：Service Layer

建议：

```text
/services
  /knowledge
  /recommendation
  /search
  /deduplication
  /analytics
  /content
```

业务逻辑不得全部塞进 React Component。

---

# 第五十一部分：Repository Layer

数据库访问与 UI 分离。

例如：

```text
getConceptById()
getCardsForConcept()
searchKnowledge()
getRecommendedCards()
saveCard()
markCardKnown()
addActionItem()
```

不要在页面组件里写大量 SQL / Supabase 查询。

---

# 第五十二部分：测试

至少建立：

### Unit Test

推荐算法。

去重判断。

评分。

状态转换。

---

### Integration Test

搜索。

收藏。

已掌握。

待行动。

---

### E2E

```text
新用户
→ onboarding
→ 首页
→ 打开卡片
→ 收藏
→ 已掌握
→ 相关知识
→ 搜索
```

至少覆盖核心流程。

---

# 第五十三部分：验收标准

项目不能因为：

> “页面看起来完成了”

就判定完成。

必须同时满足：

### UI

主要页面完成。

### Data

数据模型正常。

### Content

Cards 从数据库读取。

### State

用户状态持久化。

### Search

可以找到内容。

### Recommendation

不会严重重复。

### Evidence

可以查看来源。

### Admin

可以新增 Card，而不用改代码。

---

# 第五十四部分：最关键验收

必须现场演示：

## 场景 1

后台新增一个 Concept。

无需改前端代码。

用户端出现对应内容。

---

## 场景 2

同一 Concept 新增第二张 Card。

两个 Card 都正常显示。

---

## 场景 3

新增一个语义高度相似的 Concept。

系统提示：

> 疑似重复。

---

## 场景 4

用户看过同一个 Concept。

下一次推荐明显降低其出现概率。

---

## 场景 5

用户收藏。

刷新页面。

收藏状态仍在。

---

## 场景 6

用户加入待行动。

刷新。

状态仍在。

---

## 场景 7

搜索：

> “喝粥好不好”

能够找到相关知识，而不是只能搜索标题完全匹配。

---

# 第五十五部分：第一阶段绝对不要做的事

不要：

> 生成 5000 张假内容。

不要：

> 自动抓取大量没有授权的文章。

不要：

> 用 AI 自己编来源。

不要：

> 为了页面漂亮而增加大量动画。

不要：

> 自动添加产品功能。

不要：

> 把两个模块混成一个信息流。

不要：

> 把“生活盲区”做成普通冷知识。

---

# 第五十六部分：产品的视觉语言

整体：

> 极简 / 现代 / 安静 / 编辑感 / 高可信。

产品应该让用户觉得：

> 像一本非常现代的“成年人生活手册”。

而不是：

> 像短视频平台。

---

# 第五十七部分：内容语言

中文。

短句。

自然。

克制。

不制造焦虑。

不使用：

```text
震惊！
99%的人不知道！
转给你身边的人！
一定要注意！
```

除非内容本身确实需要风险提示。

---

# 第五十八部分：医学内容

必须：

```text
事实
解释
建议
警示
适用范围
```

分开。

不要把：

> 一般健康知识

做成：

> 诊断工具。

---

# 第五十九部分：法律 / 金融内容

必须：

```text
地区
时间
来源
有效性
```

明确。

不要把：

> 某地规则

展示成：

> 全球通用。

---

# 第六十部分：隐私

生活状态信息只能用于：

> 产品个性化。

不要推断：

疾病。

政治。

宗教。

性取向。

其他敏感属性。

---

# 第六十一部分：最终的开发目标

你最终要构建的不是一个：

> “文章阅读网站”。

而是：

# 一个可持续扩张的生活知识操作系统。

底层：

```text
Knowledge Graph
```

中层：

```text
Recommendation
Search
Personal Knowledge State
```

上层：

```text
Home
Cards
Random
Archive
Blindspots
```

---

# 第六十二部分：最终用户体验

用户打开：

```text
今天给自己补一个常识
```

↓

获得一张有价值的卡片。

↓

30 秒理解。

↓

发现：

> “原来如此。”

↓

可以：

收藏。

已知道。

加入待行动。

继续了解。

↓

逐渐形成：

# 我的生活知识档案

---

# 第六十三部分：现在开始执行

现在请不要立即生成完整项目。

先执行：

# Phase 0 — Project Audit

你必须先：

1. 检查当前工作目录。
2. 判断是否已有项目。
3. 检查 package.json。
4. 检查现有框架。
5. 检查数据库配置。
6. 检查已有 UI。
7. 检查环境变量。
8. 检查是否已有 Supabase。
9. 检查是否已有测试。
10. 检查是否已有部署配置。

然后只输出：

```text
PROJECT AUDIT

Current Stack:
...

Existing Structure:
...

Reusable Assets:
...

Missing:
...

Risks:
...

Recommended Implementation Plan:
...

Files That Will Be Created:
...

Files That Will Be Modified:
...
```

### 非常重要

完成 Audit 后：

> **不要马上写代码。**

等待下一步指令。

---

# V4 Master Rule

从现在开始，每次开发都必须优先遵守：

> **先理解现有系统，再最小范围修改；先复用，再新增；先数据模型，再 UI；先核心流程，再视觉打磨；任何不确定的产品决策都不得自行发明。**
