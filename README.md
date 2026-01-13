# n8n-nodes-baidu-ocr

This is an n8n community node for [Baidu Cloud OCR API](https://cloud.baidu.com/product/ocr). It allows you to recognize text from images and documents using Baidu's powerful OCR services.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

```bash
npm install n8n-nodes-baidu-ocr
```

## Prerequisites

You need a Baidu Cloud account with OCR API access:

1. Register at [Baidu Cloud](https://cloud.baidu.com/)
2. Go to the [OCR Console](https://console.bce.baidu.com/ai/#/ai/ocr/overview/index)
3. Create an application to get your **API Key** and **Secret Key**

## Supported Operations

| Operation | Description |
|-----------|-------------|
| General Basic | Standard text recognition |
| General Accurate | High-accuracy text recognition |
| Table Recognition | Recognize table structure and content |
| ID Card | Chinese ID card recognition (front/back) |
| Bank Card | Bank card recognition |
| Business License | Business license recognition |

## Credentials

Configure the Baidu OCR API credentials in n8n:

- **API Key**: Your Baidu Cloud API Key
- **Secret Key**: Your Baidu Cloud Secret Key

## Usage

### Input Types

- **Binary Data**: Use image data from a previous node (e.g., HTTP Request, Read Binary File)
- **URL**: Provide a direct URL to the image

### Example Workflow

1. Add a trigger node (e.g., Manual Trigger)
2. Add a node to get the image (e.g., HTTP Request to download an image)
3. Add the Baidu OCR node
4. Configure the operation and input type
5. Execute the workflow

## Compatibility

- n8n version: 1.0.0+
- Node.js version: 18.0.0+

## Resources

- [Baidu OCR API Documentation](https://cloud.baidu.com/doc/OCR/index.html)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
