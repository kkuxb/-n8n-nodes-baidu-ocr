import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BaiduOcrApi implements ICredentialType {
	name = 'baiduOcrApi';
	displayName = 'Baidu OCR API';
	documentationUrl = 'https://cloud.baidu.com/doc/OCR/index.html';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
			description: 'The API Key from Baidu Cloud Console',
		},
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Secret Key from Baidu Cloud Console',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://aip.baidubce.com',
			url: '=/oauth/2.0/token?grant_type=client_credentials&client_id={{$credentials.apiKey}}&client_secret={{$credentials.secretKey}}',
			method: 'POST',
		},
	};
}
