# n8n-nodes-baidu-ocr

这是一个用于 [百度智能云 OCR API](https://cloud.baidu.com/product/ocr) 的 n8n 社区节点。它可以让你使用百度强大的 OCR 服务从图片和文档中识别文字。

[n8n](https://n8n.io/) 是一个 [公平代码许可](https://docs.n8n.io/reference/license/) 的工作流自动化平台。

## 安装

请参考 n8n 社区节点文档中的 [安装指南](https://docs.n8n.io/integrations/community-nodes/installation/)。

```bash
npm install n8n-nodes-baidu-ocr
```

## 前置条件

你需要一个开通了 OCR API 的百度智能云账号：

1. 在 [百度智能云](https://cloud.baidu.com/) 注册账号
2. 进入 [OCR 控制台](https://console.bce.baidu.com/ai/#/ai/ocr/overview/index)
3. 创建应用以获取 **API Key** 和 **Secret Key**

## 支持的识别类型

| 识别类型 | 说明 | 支持格式 |
|----------|------|----------|
| 通用文字识别（标准版） | 识别图片中的文字，适用于普通场景 | 图片、PDF |
| 通用文字识别（高精度版） | 更高精度的文字识别，适用于复杂场景 | 图片、PDF |
| 表格文字识别 | 识别图片中的表格结构和内容 | 图片、PDF |
| 身份证识别 | 识别身份证正面或反面信息 | 仅图片 |
| 银行卡识别 | 识别银行卡卡号等信息 | 仅图片 |
| 营业执照识别 | 识别营业执照关键字段 | 图片、PDF |
| 增值税发票识别 | 识别增值税发票关键字段 | 图片、PDF |
| 定额发票识别 | 识别定额发票信息 | 仅图片 |
| 通用机打发票识别 | 识别通用机打发票信息 | 图片、PDF |
| 驾驶证识别 | 识别驾驶证正页或副页信息 | 仅图片 |
| 行驶证识别 | 识别行驶证正页或副页信息 | 仅图片 |
| 车牌号识别 | 识别车牌号码 | 仅图片 |
| 护照识别 | 识别护照关键信息 | 仅图片 |

## 凭证配置

在 n8n 中配置百度 OCR API 凭证：

- **API Key**: 你的百度智能云 API Key
- **Secret Key**: 你的百度智能云 Secret Key

## 使用方法

### 输入类型

- **二进制数据**: 使用上游节点传入的二进制图片或PDF数据（如 HTTP Request、Read Binary File）
- **图片URL**: 直接提供图片的网络地址

### 支持的文件格式

节点会自动检测文件格式并进行相应处理：

- **图片格式**: JPG、PNG、BMP 等常见图片格式
- **PDF文档**: 自动识别 PDF 文件并支持多页识别（部分识别类型支持）

**重要说明**：

- 百度 OCR API 是**图像识别**服务，用于识别图片或 PDF 中的文字
- **不支持**直接解析 Office 文档（Excel、Word、PowerPoint）和 CSV 文件
- 如需识别 Office 文档内容，请先将其转换为图片或 PDF 格式
- 「表格文字识别」是识别**图片中的表格**，而非解析 Excel 文件

### 多文件智能检测

当使用二进制数据输入时，节点支持同时检测多个属性名中的文件：

- 默认属性名：`data,data0,data1,data2,data3`
- 节点会自动检测哪些属性下存在文件，并对所有检测到的文件进行 OCR 识别
- 你也可以自定义属性名列表（用逗号分隔）

### PDF 页码配置

当输入文件为 PDF 时，可以通过「PDF页码范围」配置要识别的页面：

| 配置值 | 说明 |
|--------|------|
| `all` | 识别所有页面（默认） |
| `1` | 只识别第1页 |
| `1-5` | 识别第1到5页 |
| `1,3,5` | 识别第1、3、5页 |
| `1-3,5,7-9` | 组合使用 |

**注意**: PDF 每页需要单独调用 API，会产生相应的 API 调用费用。

### 输出格式

节点会自动将 OCR 识别结果拼接为完整文本，输出包含：

- `text`: 拼接后的完整识别文本（保留换行符）
- `results`: 每个文件/页面的详细识别结果数组
- `fileCount`: 处理的文件数量
- `processedProperties`: 实际处理的属性名列表

对于 PDF 文件，每页的结果还会包含：
- `fileType`: 文件类型（`pdf` 或 `image`）
- `pageNumber`: PDF 页码

### 示例工作流

1. 添加触发器节点（如 Manual Trigger）
2. 添加获取文件的节点（如 HTTP Request 下载图片/PDF）
3. 添加 Baidu OCR 节点
4. 配置识别类型和输入方式
5. 如果是 PDF，配置页码范围
6. 执行工作流

## 兼容性

- n8n 版本: 1.0.0+
- Node.js 版本: 18.0.0+

## 相关资源

- [百度 OCR API 文档](https://cloud.baidu.com/doc/OCR/index.html)
- [n8n 社区节点文档](https://docs.n8n.io/integrations/community-nodes/)

## 许可证

[MIT](LICENSE)
