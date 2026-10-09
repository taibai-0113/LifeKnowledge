"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  X,
  FileUp,
  Sparkles,
} from "lucide-react";

const JSON_TEMPLATE = `[
  {
    "title": "新保温杯内胆如何清洗？",
    "oneLine": "新保温杯内胆用温水加食品级洗洁精清洗即可，不需用强酸强碱。",
    "module": "blindspot",
    "domain": "kitchen",
    "misconception": "用开水加小苏打反复煮烫才能杀菌去味",
    "reality": "多数异味源自硅胶密封圈而非不锈钢，过度沸煮会加速密封圈老化变形漏水",
    "why": "食品级304/316不锈钢在出厂前已经过酸洗钝化，中性洗涤剂完全足够",
    "grade": "A",
    "cost": "不花钱，1分钟搞定",
    "benefit": "保护保温杯密封圈寿命，防止烫伤与漏水",
    "source": "中国特种设备检验研究院日用品安全报告"
  },
  {
    "title": "经常坐长途飞机穿医用弹力袜防血栓",
    "oneLine": "飞行超过4小时，穿医用梯度压力袜可显著降低下肢深静脉血栓风险。",
    "module": "life_archive",
    "domain": "travel",
    "type": "action",
    "grade": "A+",
    "cost": "每双约50-100元",
    "benefit": "有效预防经济舱综合征（下肢深静脉血栓脱落导致肺栓塞）",
    "actionSteps": [
      "选购一级压力（15-20mmHg）膝下型医用弹力袜",
      "登机前穿好，飞行途中多喝水并做脚踝屈伸运动"
    ],
    "source": "美国胸科医师学会 (ACCP) 抗栓治疗指南"
  }
]`;

const CSV_TEMPLATE = `title,oneLine,module,domain,type,grade,misconception,reality,why,cost,benefit,actionSteps,source
"新保温杯内胆如何清洗？","新保温杯内胆用温水加食品级洗洁精清洗即可，不需用强酸强碱。","blindspot","kitchen","blindspot","A","用开水加小苏打反复煮烫才能杀菌去味","多数异味源自硅胶密封圈而非不锈钢，过度沸煮加速密封圈老化变形","食品级304/316不锈钢出厂经酸洗钝化，中性洗涤剂已足够","不花钱","保护密封圈寿命防止漏水","使用温水与中性洗洁精清洗内胆","中国特种设备检验研究院"
"长途飞行穿医用弹力袜","飞行超过4小时穿梯度压力袜可显著降低下肢深静脉血栓风险。","life_archive","travel","action","A+","","","","约50元","预防下肢深静脉血栓与肺栓塞","选购一级压力弹力袜并在登机前穿好","美国胸科医师学会 (ACCP)"`;

export function AdminDataImport() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "paste" | "template">("upload");
  const [rawText, setRawText] = useState("");
  const [format, setFormat] = useState<"auto" | "json" | "csv">("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = (type: "json" | "csv") => {
    const content = type === "json" ? JSON_TEMPLATE : CSV_TEMPLATE;
    const blob = new Blob([content], {
      type: type === "json" ? "application/json;charset=utf-8;" : "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `life_knowledge_template.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTemplate = (type: "json" | "csv") => {
    const content = type === "json" ? JSON_TEMPLATE : CSV_TEMPLATE;
    navigator.clipboard.writeText(content);
    alert("模板已复制到剪贴板！可以直接在“粘贴文本”中粘贴。");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.endsWith(".csv") || file.name.endsWith(".txt");
    const isJson = file.name.endsWith(".json");
    if (isCsv) setFormat("csv");
    else if (isJson) setFormat("json");
    else setFormat("auto");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      setActiveTab("paste");
    };
    reader.readAsText(file, "utf-8");
  };

  const handleSubmit = async () => {
    if (!rawText.trim()) {
      alert("请输入或上传待导入的数据内容");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: format === "auto" ? undefined : format,
          content: rawText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult({
          success: true,
          message: data.message,
          count: data.importedCount,
        });
        setRawText("");
        router.refresh();
      } else {
        setResult({
          success: false,
          message: data.error || "导入失败，请检查数据格式",
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: `网络异常: ${String(err)}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
      >
        <Upload className="w-4 h-4" />
        <span>批量导入知识数据 (JSON / Excel / CSV)</span>
      </button>

      {/* 导入对话框 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileUp className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  知识数据导入中心 (JSON / Excel / CSV)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setResult(null);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === "upload"
                    ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                📁 文件上传
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === "paste"
                    ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                📝 粘贴文本 / 在线编辑
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("template")}
                className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === "template"
                    ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                📥 格式说明与下载模板
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Tab 1: Upload */}
              {activeTab === "upload" && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        点击选择或将文件拖至此处
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        支持 .json、.csv、.xlsx 导出的纯文本文件
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate("json")}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-colors flex items-center space-x-3 cursor-pointer"
                    >
                      <FileJson className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="text-xs font-semibold">下载 JSON 导入模板</div>
                        <div className="text-[10px] text-zinc-400">标准结构化数组</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate("csv")}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-colors flex items-center space-x-3 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                      <div>
                        <div className="text-xs font-semibold">下载 Excel/CSV 模板</div>
                        <div className="text-[10px] text-zinc-400">表格批量编辑</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Paste */}
              {activeTab === "paste" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      数据内容 (JSON 数组 或 CSV/TSV 表格文本)
                    </label>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-zinc-400">格式检测:</span>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as "auto" | "json" | "csv")}
                        className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs"
                      >
                        <option value="auto">自动识别</option>
                        <option value="json">JSON 格式</option>
                        <option value="csv">CSV / Excel 格式</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={10}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="在此粘贴 JSON 数组，或从 Excel 复制整列粘贴..."
                    className="w-full p-3 font-mono text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-500"
                  />

                  {rawText && (
                    <div className="text-xs text-zinc-400 flex items-center justify-between">
                      <span>已输入 {rawText.length} 个字符</span>
                      <button
                        type="button"
                        onClick={() => setRawText("")}
                        className="text-red-500 hover:underline"
                      >
                        清空文本
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Template & Rules */}
              {activeTab === "template" && (
                <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>支持的导入字段规范</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>title (必填)</strong>: 常识卡片标题或生活问题</li>
                      <li><strong>oneLine (推荐)</strong>: 一句话核心结论（说人话）</li>
                      <li><strong>module</strong>: life_archive (人生档案) 或 blindspot (生活盲区)</li>
                      <li><strong>domain</strong>: 20个一级分类代码（如 health, diet, living, traffic, home_safety, money 等）</li>
                      <li><strong>misconception / reality / why</strong>: 生活盲区必填（你以为、实际上、底层原理解析）</li>
                      <li><strong>cost / benefit / actionSteps</strong>: 人生档案行动卡（成本、收益、具体怎么做）</li>
                      <li><strong>grade</strong>: A+, A, B, C 性价比评级</li>
                      <li><strong>source</strong>: 权威文献出处机构与指南</li>
                    </ul>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate("json")}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制 JSON 示例</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate("csv")}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制 CSV 示例</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate("csv")}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载 Excel/CSV 模板文件</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Result Notice */}
              {result && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start space-x-2.5 text-xs ${
                    result.success
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">{result.success ? "导入成功" : "导入失败"}</div>
                    <div className="mt-0.5">{result.message}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                导入后自动挂载 Concept、Claim、Card 与 Source 五层结构
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium cursor-pointer"
                >
                  关闭
                </button>
                <button
                  type="button"
                  disabled={loading || !rawText.trim()}
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <span>解析并存入知识库中...</span>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>确认存入知识库</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
