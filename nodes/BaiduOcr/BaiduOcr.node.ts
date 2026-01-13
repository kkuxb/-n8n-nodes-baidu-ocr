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
				description: '包含图片的二进制属性名，支持多个属性名（用逗号分隔），节点会自动检测哪些属性存在文件',
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
						const buffer = await this.helpers.getBinaryDataBuffer(i, propName);
						const imageData = buffer.toString('base64');
						const requestBody: IDataObject = { image: imageData };

						// 添加额外参数
						addExtraParams(this, i, operation, requestBody);

						const response = await callBaiduOcrApi.call(this, endpoint, accessToken, requestBody);
						const processedResponse = processOcrResponse(response, operation);

						allResults.push({ propertyName: propName, ...processedResponse });
						if (processedResponse.text) {
							allTexts.push(processedResponse.text as string);
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
