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

## 支持的操作

| 操作 | 说明 |
|------|------|
| General Basic | 通用文字识别（标准版） |
| General Accurate | 通用文字识别（高精度版） |
| Table Recognition | 表格文字识别 |
| ID Card | 身份证识别（正面/反面） |
| Bank Card | 银行卡识别 |
| Business License | 营业执照识别 |

## 凭证配置

在 n8n 中配置百度 OCR API 凭证：

- **API Key**: 你的百度智能云 API Key
- **Secret Key**: 你的百度智能云 Secret Key

## 使用方法

### 输入类型

- **Binary Data**: 使用上游节点的图片二进制数据（如 HTTP Request、Read Binary File）
- **URL**: 直接提供图片的 URL 地址

### 示例工作流

1. 添加触发器节点（如 Manual Trigger）
2. 添加获取图片的节点（如 HTTP Request 下载图片）
3. 添加 Baidu OCR 节点
4. 配置操作类型和输入方式
5. 执行工作流

## 兼容性

- n8n 版本: 1.0.0+
- Node.js 版本: 18.0.0+

## 相关资源

- [百度 OCR API 文档](https://cloud.baidu.com/doc/OCR/index.html)
- [n8n 社区节点文档](https://docs.n8n.io/integrations/community-nodes/)

## 许可证

[MIT](LICENSE)
