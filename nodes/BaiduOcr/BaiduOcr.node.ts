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
		description: 'Use Baidu Cloud OCR API to recognize text from images and documents',
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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'General Basic',
						value: 'generalBasic',
						description: 'General text recognition (standard)',
						action: 'General text recognition standard',
					},
					{
						name: 'General Accurate',
						value: 'accurateBasic',
						description: 'General text recognition (high accuracy)',
						action: 'General text recognition high accuracy',
					},
					{
						name: 'Table Recognition',
						value: 'table',
						description: 'Recognize table structure and content',
						action: 'Recognize table structure and content',
					},
					{
						name: 'ID Card',
						value: 'idcard',
						description: 'Recognize Chinese ID card',
						action: 'Recognize chinese id card',
					},
					{
						name: 'Bank Card',
						value: 'bankcard',
						description: 'Recognize bank card',
						action: 'Recognize bank card',
					},
					{
						name: 'Business License',
						value: 'businessLicense',
						description: 'Recognize business license',
						action: 'Recognize business license',
					},
				],
				default: 'generalBasic',
			},
			// Input type selection
			{
				displayName: 'Input Type',
				name: 'inputType',
				type: 'options',
				options: [
					{
						name: 'Binary Data',
						value: 'binaryData',
						description: 'Use binary data from previous node',
					},
					{
						name: 'URL',
						value: 'url',
						description: 'Use image URL',
					},
				],
				default: 'binaryData',
			},
			// Binary property name
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						inputType: ['binaryData'],
					},
				},
				description: 'Name of the binary property containing the image',
			},
			// Image URL
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						inputType: ['url'],
					},
				},
				description: 'URL of the image to recognize',
			},
			// ID Card side selection
			{
				displayName: 'ID Card Side',
				name: 'idCardSide',
				type: 'options',
				options: [
					{
						name: 'Front (Photo Side)',
						value: 'front',
						description: 'Front side with photo and basic info',
					},
					{
						name: 'Back (National Emblem Side)',
						value: 'back',
						description: 'Back side with validity period',
					},
				],
				default: 'front',
				displayOptions: {
					show: {
						operation: ['idcard'],
					},
				},
				description: 'Which side of the ID card to recognize',
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

				let imageData: string;
				let requestBody: IDataObject = {};

				if (inputType === 'binaryData') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
					imageData = buffer.toString('base64');
					requestBody.image = imageData;
				} else {
					const imageUrl = this.getNodeParameter('imageUrl', i) as string;
					requestBody.url = imageUrl;
				}

				// Add ID card side parameter if operation is idcard
				if (operation === 'idcard') {
					const idCardSide = this.getNodeParameter('idCardSide', i) as string;
					requestBody.id_card_side = idCardSide;
				}

				const endpoint = getEndpoint(operation);
				const response = await callBaiduOcrApi.call(this, endpoint, accessToken, requestBody);

				returnData.push({
					json: response as IDataObject,
					pairedItem: { item: i },
				});
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
