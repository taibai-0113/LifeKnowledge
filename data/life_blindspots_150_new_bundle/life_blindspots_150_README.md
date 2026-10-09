# 人生常识｜扫清生活盲区 150 条初始知识库

- 数据量：170 条
- 模块：blindspot
- 状态：draft_for_editorial_review
- Schema：V3-content-schema-1.0
- 生成日期：2026-10-08

## 重要说明

这批数据用于产品扩库，不建议未经编辑审核直接全部发布。医疗、用药、食品安全、交通安全、法律/金融相关内容尤其需要按目标市场做地区化与时效核验。

选题参考两类材料：
1. 《高性价比人生指南》：作为行动型知识与“反面清单”的选题基底。
2. How Everything Works / HowStuffWorks：作为“从日常对象、现象追问工作原理”的选题方法参考；本数据为原创改写，不复制其原文。

## 字段

- `concept_id`：知识原子 ID
- `title`：卡片标题
- `one_line`：一句话结论
- `you_might_think`：用户可能的直觉/误区
- `reality`：实际情况
- `why`：机制解释
- `remember`：记忆点
- `source_ids`：来源 ID，详见 JSON 的 `source_index`
- `related_concept_ids`：相关知识 ID

## 导入建议

建议先导入 20–30 条做灰度测试，再批量导入；在 CMS 中通过 Concept/Claim/Source 去重后发布。
