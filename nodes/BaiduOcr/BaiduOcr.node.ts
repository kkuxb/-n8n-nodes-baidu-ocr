import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

export class BaiduOcr implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Baidu OCR',
		name: 'baiduOcr',
		icon: 'file:baiduOcr.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: '使用百度智能云 OCR API 识别图片和文档中的文字',
		defaults: {
			name: 'Baidu OCR',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'baiduOcrApi',
				required: true,
			},
		],
		properties: [
			// Operation selection
			{
				displayName: '识别类型',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '通用文字识别（标准版）',
						value: 'generalBasic',
						description: '识别图片中的文字，适用于普通场景',
						action: '通用文字识别（标准版）',
					},
					{
						name: '通用文字识别（高精度版）',
						value: 'accurateBasic',
						description: '更高精度的文字识别，适用于复杂场景',
						action: '通用文字识别（高精度版）',
					},
					{
						name: '表格文字识别',
						value: 'table',
						description: '识别表格结构和内容',
						action: '表格文字识别',
					},
					{
						name: '身份证识别',
						value: 'idcard',
						description: '识别身份证正面或反面信息',
						action: '身份证识别',
					},
					{
						name: '银行卡识别',
						value: 'bankcard',
						description: '识别银行卡卡号等信息',
						action: '银行卡识别',
					},
					{
						name: '营业执照识别',
						value: 'businessLicense',
						description: '识别营业执照关键字段',
						action: '营业执照识别',
					},
					{
						name: '增值税发票识别',
						value: 'vatInvoice',
						description: '识别增值税发票关键字段',
						action: '增值税发票识别',
					},
					{
						name: '定额发票识别',
						value: 'quotaInvoice',
						description: '识别定额发票信息',
						action: '定额发票识别',
					},
					{
						name: '通用机打发票识别',
						value: 'invoice',
						description: '识别通用机打发票信息',
						action: '通用机打发票识别',
					},
					{
						name: '驾驶证识别',
						value: 'drivingLicense',
						description: '识别驾驶证正页或副页信息',
						action: '驾驶证识别',
					},
					{
						name: '行驶证识别',
						value: 'vehicleLicense',
						description: '识别行驶证正页或副页信息',
						action: '行驶证识别',
					},
					{
						name: '车牌号识别',
						value: 'licensePlate',
						description: '识别车牌号码',
						action: '车牌号识别',
					},
					{
						name: '护照识别',
						value: 'passport',
						description: '识别护照关键信息',
						action: '护照识别',
					},
				],
				default: 'generalBasic',
			},
			// Input type selection
			{
				displayName: '输入类型',
				name: 'inputType',
				type: 'options',
				options: [
					{
						name: '二进制数据',
						value: 'binaryData',
						description: '使用上游节点传入的二进制图片数据',
					},
					{
						name: '图片URL',
						value: 'url',
						description: '使用图片的网络地址',
					},
				],
				default: 'binaryData',
			},
			// Binary property name
			{
				displayName: '二进制属性名',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data,data0,data1,data2,data3',
				displayOptions: {
					show: {
						inputType: ['binaryData'],
					},
				},
				description: '包含图片或PDF的二进制属性名，支持多个属性名（用逗号分隔），节点会自动检测文件格式',
			},
			// PDF page range
			{
				displayName: 'PDF页码范围',
				name: 'pdfPageRange',
				type: 'string',
				default: 'all',
				displayOptions: {
					show: {
						inputType: ['binaryData'],
					},
				},
				description: 'PDF页码范围：all=全部页面，1=第1页，1-5=第1到5页，1,3,5=第1、3、5页。图片文件会忽略此设置',
			},
			// Image URL
			{
				displayName: '图片URL',
				name: 'imageUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						inputType: ['url'],
					},
				},
				description: '要识别的图片网络地址',
			},
			// ID Card side selection
			{
				displayName: '身份证面',
				name: 'idCardSide',
				type: 'options',
				options: [
					{
						name: '正面（人像面）',
						value: 'front',
						description: '包含照片和基本信息的一面',
					},
					{
						name: '反面（国徽面）',
						value: 'back',
						description: '包含有效期的一面',
					},
				],
				default: 'front',
				displayOptions: {
					show: {
						operation: ['idcard'],
					},
				},
				description: '选择要识别身份证的哪一面',
			},
			// Driving license side selection
			{
				displayName: '驾驶证面',
				name: 'drivingLicenseSide',
				type: 'options',
				options: [
					{
						name: '正页',
						value: 'front',
						description: '驾驶证主页信息',
					},
					{
						name: '副页',
						value: 'back',
						description: '驾驶证副页信息',
					},
				],
				default: 'front',
				displayOptions: {
					show: {
						operation: ['drivingLicense'],
					},
				},
				description: '选择要识别驾驶证的哪一面',
			},
			// Vehicle license side selection
			{
				displayName: '行驶证面',
				name: 'vehicleLicenseSide',
				type: 'options',
				options: [
					{
						name: '正页',
						value: 'front',
						description: '行驶证主页信息',
					},
					{
						name: '副页',
						value: 'back',
						description: '行驶证副页信息',
					},
				],
				default: 'front',
				displayOptions: {
					show: {
						operation: ['vehicleLicense'],
					},
				},
				description: '选择要识别行驶证的哪一面',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('baiduOcrApi');

		// Get access token
		const accessToken = await getAccessToken.call(this, credentials);

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const inputType = this.getNodeParameter('inputType', i) as string;
				const endpoint = getEndpoint(operation);

				if (inputType === 'binaryData') {
					// 解析多个属性名
					const binaryPropertyNames = (this.getNodeParameter('binaryPropertyName', i) as string)
						.split(',')
						.map(name => name.trim())
						.filter(name => name);
					const pdfPageRange = this.getNodeParameter('pdfPageRange', i) as string;

					// 检测哪些属性存在二进制数据
					const validProperties: string[] = [];
					for (const propName of binaryPropertyNames) {
						if (items[i].binary && items[i].binary![propName]) {
							validProperties.push(propName);
						}
					}

					if (validProperties.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							`未找到有效的二进制数据。检查的属性名: ${binaryPropertyNames.join(', ')}`,
						);
					}

					// 对每个有效属性进行 OCR 识别
					const allResults: IDataObject[] = [];
					const allTexts: string[] = [];

					for (const propName of validProperties) {
						const binaryData = items[i].binary![propName];
						const buffer = await this.helpers.getBinaryDataBuffer(i, propName);
						const base64Data = buffer.toString('base64');

						// 检查文件格式
						const formatCheck = checkFileFormat(binaryData.mimeType, binaryData.fileName);
						if (!formatCheck.supported) {
							throw new NodeOperationError(
								this.getNode(),
								formatCheck.errorMessage || `不支持的文件格式: ${formatCheck.fileType}`,
							);
						}

						const isPdf = formatCheck.fileType === 'pdf';

						if (isPdf) {
							// 检查当前识别类型是否支持 PDF
							if (!operationSupportsPdf(operation)) {
								throw new NodeOperationError(
									this.getNode(),
									`「${getOperationDisplayName(operation)}」不支持 PDF 格式，仅支持图片格式（JPG、PNG、BMP）。请将 PDF 转换为图片后再上传。`,
								);
							}

							// PDF 文件处理
							const pageNumbers = await parsePdfPageRange(
								pdfPageRange,
								this,
								endpoint,
								accessToken,
								base64Data,
							);

							for (const pageNum of pageNumbers) {
								const requestBody: IDataObject = {
									pdf_file: base64Data,
									pdf_file_num: pageNum,
								};
								addExtraParams(this, i, operation, requestBody);

								const response = await callBaiduOcrApi.call(this, endpoint, accessToken, requestBody);
								const processedResponse = processOcrResponse(response, operation);

								allResults.push({
									propertyName: propName,
									fileType: 'pdf',
									pageNumber: pageNum,
									...processedResponse,
								});
								if (processedResponse.text) {
									allTexts.push(processedResponse.text as string);
								}
							}
						} else {
							// 图片文件处理
							const requestBody: IDataObject = { image: base64Data };
							addExtraParams(this, i, operation, requestBody);

							const response = await callBaiduOcrApi.call(this, endpoint, accessToken, requestBody);
							const processedResponse = processOcrResponse(response, operation);

							allResults.push({
								propertyName: propName,
								fileType: 'image',
								...processedResponse,
							});
							if (processedResponse.text) {
								allTexts.push(processedResponse.text as string);
							}
						}
					}

					// 合并所有结果
					const combinedResult: IDataObject = {
						text: allTexts.join('\n\n'),
						results: allResults,
						fileCount: validProperties.length,
						processedProperties: validProperties,
					};

					returnData.push({
						json: combinedResult,
						pairedItem: { item: i },
					});
				} else {
					// URL 输入方式
					const imageUrl = this.getNodeParameter('imageUrl', i) as string;
					const requestBody: IDataObject = { url: imageUrl };

					// 添加额外参数
					addExtraParams(this, i, operation, requestBody);

					const response = await callBaiduOcrApi.call(this, endpoint, accessToken, requestBody);
					const processedResponse = processOcrResponse(response, operation);

					returnData.push({
						json: processedResponse,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// Helper function to get access token
async function getAccessToken(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<string> {
	const tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';
	const response = await this.helpers.request({
		method: 'POST',
		url: tokenUrl,
		qs: {
			grant_type: 'client_credentials',
			client_id: credentials.apiKey,
			client_secret: credentials.secretKey,
		},
		json: true,
	});

	if (!response.access_token) {
		throw new NodeOperationError(
			this.getNode(),
			'Failed to get access token from Baidu API',
		);
	}

	return response.access_token;
}

// Helper function to get API endpoint
function getEndpoint(operation: string): string {
	const endpoints: { [key: string]: string } = {
		generalBasic: '/rest/2.0/ocr/v1/general_basic',
		accurateBasic: '/rest/2.0/ocr/v1/accurate_basic',
		table: '/rest/2.0/ocr/v1/table',
		idcard: '/rest/2.0/ocr/v1/idcard',
		bankcard: '/rest/2.0/ocr/v1/bankcard',
		businessLicense: '/rest/2.0/ocr/v1/business_license',
		vatInvoice: '/rest/2.0/ocr/v1/vat_invoice',
		quotaInvoice: '/rest/2.0/ocr/v1/quota_invoice',
		invoice: '/rest/2.0/ocr/v1/invoice',
		drivingLicense: '/rest/2.0/ocr/v1/driving_license',
		vehicleLicense: '/rest/2.0/ocr/v1/vehicle_license',
		licensePlate: '/rest/2.0/ocr/v1/license_plate',
		passport: '/rest/2.0/ocr/v1/passport',
	};
	return endpoints[operation] || endpoints.generalBasic;
}

// Helper function to call Baidu OCR API
async function callBaiduOcrApi(
	this: IExecuteFunctions,
	endpoint: string,
	accessToken: string,
	body: IDataObject,
): Promise<IDataObject> {
	const baseUrl = 'https://aip.baidubce.com';
	const response = await this.helpers.request({
		method: 'POST',
		url: `${baseUrl}${endpoint}`,
		qs: { access_token: accessToken },
		form: body,
		json: true,
	});

	if (response.error_code) {
		throw new NodeOperationError(
			this.getNode(),
			`Baidu OCR API Error: ${response.error_msg} (Code: ${response.error_code})`,
		);
	}

	return response;
}

// Helper function to add extra parameters based on operation type
function addExtraParams(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: string,
	requestBody: IDataObject,
): void {
	if (operation === 'idcard') {
		const idCardSide = context.getNodeParameter('idCardSide', itemIndex) as string;
		requestBody.id_card_side = idCardSide;
	} else if (operation === 'drivingLicense') {
		const side = context.getNodeParameter('drivingLicenseSide', itemIndex) as string;
		requestBody.driving_license_side = side;
	} else if (operation === 'vehicleLicense') {
		const side = context.getNodeParameter('vehicleLicenseSide', itemIndex) as string;
		requestBody.vehicle_license_side = side;
	}
}

// Helper function to process OCR response and extract text
function processOcrResponse(response: IDataObject, operation: string): IDataObject {
	const result: IDataObject = { ...response };

	// 通用文字识别类型，拼接 words_result
	if (response.words_result && Array.isArray(response.words_result)) {
		const texts = (response.words_result as IDataObject[])
			.map((item: IDataObject) => item.words as string)
			.filter((text: string) => text);
		result.text = texts.join('\n');
	}

	// 表格识别，处理 tables_result
	if (response.tables_result && Array.isArray(response.tables_result)) {
		const tableTexts: string[] = [];
		for (const table of response.tables_result as IDataObject[]) {
			if (table.body && Array.isArray(table.body)) {
				for (const row of table.body as IDataObject[]) {
					if (row.words) {
						tableTexts.push(row.words as string);
					}
				}
			}
		}
		result.text = tableTexts.join('\n');
	}

	// 结构化识别（身份证、银行卡、营业执照、发票等），提取关键字段
	if (response.words_result && typeof response.words_result === 'object' && !Array.isArray(response.words_result)) {
		const fields = response.words_result as IDataObject;
		const texts: string[] = [];
		for (const [key, value] of Object.entries(fields)) {
			if (value && typeof value === 'object' && (value as IDataObject).words) {
				texts.push(`${key}: ${(value as IDataObject).words}`);
			}
		}
		if (texts.length > 0) {
			result.text = texts.join('\n');
		}
	}

	return result;
}

// Helper function to check if file is PDF
function isPdfFile(mimeType?: string, fileName?: string): boolean {
	if (mimeType === 'application/pdf') {
		return true;
	}
	if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
		return true;
	}
	return false;
}

// Helper function to check if file format is supported
function checkFileFormat(mimeType?: string, fileName?: string): { supported: boolean; fileType: string; errorMessage?: string } {
	const name = fileName?.toLowerCase() || '';
	const mime = mimeType?.toLowerCase() || '';

	// 不支持的办公文档格式
	const unsupportedOfficeFormats = [
		{ ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'Excel (.xlsx)' },
		{ ext: '.xls', mime: 'application/vnd.ms-excel', name: 'Excel (.xls)' },
		{ ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'Word (.docx)' },
		{ ext: '.doc', mime: 'application/msword', name: 'Word (.doc)' },
		{ ext: '.pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', name: 'PowerPoint (.pptx)' },
		{ ext: '.ppt', mime: 'application/vnd.ms-powerpoint', name: 'PowerPoint (.ppt)' },
		{ ext: '.csv', mime: 'text/csv', name: 'CSV (.csv)' },
	];

	for (const format of unsupportedOfficeFormats) {
		if (name.endsWith(format.ext) || mime.includes(format.mime)) {
			return {
				supported: false,
				fileType: format.name,
				errorMessage: `不支持 ${format.name} 格式。百度 OCR API 仅支持图片格式（JPG、PNG、BMP）和 PDF 文档。如需识别文档内容，请将其转换为图片或 PDF 后再上传。`,
			};
		}
	}

	// PDF 格式
	if (isPdfFile(mimeType, fileName)) {
		return { supported: true, fileType: 'pdf' };
	}

	// 其他格式视为图片
	return { supported: true, fileType: 'image' };
}

// Helper function to check if operation supports PDF
function operationSupportsPdf(operation: string): boolean {
	// 支持 PDF 的识别类型
	const pdfSupportedOperations = [
		'generalBasic',      // 通用文字识别（标准版）
		'accurateBasic',     // 通用文字识别（高精度版）
		'table',             // 表格文字识别
		'businessLicense',   // 营业执照识别
		'vatInvoice',        // 增值税发票识别
		'invoice',           // 通用机打发票识别
	];
	return pdfSupportedOperations.includes(operation);
}

// Helper function to get operation display name in Chinese
function getOperationDisplayName(operation: string): string {
	const names: { [key: string]: string } = {
		generalBasic: '通用文字识别（标准版）',
		accurateBasic: '通用文字识别（高精度版）',
		table: '表格文字识别',
		idcard: '身份证识别',
		bankcard: '银行卡识别',
		businessLicense: '营业执照识别',
		vatInvoice: '增值税发票识别',
		quotaInvoice: '定额发票识别',
		invoice: '通用机打发票识别',
		drivingLicense: '驾驶证识别',
		vehicleLicense: '行驶证识别',
		licensePlate: '车牌号识别',
		passport: '护照识别',
	};
	return names[operation] || operation;
}

// Helper function to parse PDF page range and return array of page numbers
async function parsePdfPageRange(
	pageRange: string,
	context: IExecuteFunctions,
	endpoint: string,
	accessToken: string,
	pdfBase64: string,
): Promise<number[]> {
	const range = pageRange.trim().toLowerCase();

	// 如果是 "all"，需要先获取 PDF 总页数
	if (range === 'all') {
		const totalPages = await getPdfTotalPages(context, endpoint, accessToken, pdfBase64);
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	// 解析页码范围
	const pageNumbers: number[] = [];
	const parts = range.split(',');

	for (const part of parts) {
		const trimmed = part.trim();
		if (trimmed.includes('-')) {
			// 范围格式: 1-5
			const [start, end] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
			if (!isNaN(start) && !isNaN(end) && start <= end) {
				for (let i = start; i <= end; i++) {
					if (!pageNumbers.includes(i)) {
						pageNumbers.push(i);
					}
				}
			}
		} else {
			// 单个页码
			const num = parseInt(trimmed, 10);
			if (!isNaN(num) && !pageNumbers.includes(num)) {
				pageNumbers.push(num);
			}
		}
	}

	return pageNumbers.length > 0 ? pageNumbers.sort((a, b) => a - b) : [1];
}

// Helper function to get PDF total pages by making a test request
async function getPdfTotalPages(
	context: IExecuteFunctions,
	endpoint: string,
	accessToken: string,
	pdfBase64: string,
): Promise<number> {
	const baseUrl = 'https://aip.baidubce.com';
	const response = await context.helpers.request({
		method: 'POST',
		url: `${baseUrl}${endpoint}`,
		qs: { access_token: accessToken },
		form: {
			pdf_file: pdfBase64,
			pdf_file_num: 1,
		},
		json: true,
	});

	// 百度 OCR API 返回中包含 pdf_file_size 字段表示总页数
	if (response.pdf_file_size) {
		return response.pdf_file_size as number;
	}

	// 如果没有返回总页数，默认返回 1
	return 1;
}
