export default {
	title: 'Form',
	description: 'Project documentation',
	themeConfig: {
		nav: [
			{text: 'Guide', link: '/guides/getting-started'},
			{text: 'Reference', link: '/reference/'},
		],
		sidebar: [
			{text: 'Overview', items: [{text: 'Introduction', link: '/'}]},
			{
				text: 'Architecture',
				items: [
					{text: 'System Overview', link: '/architecture/overview'},
					{text: 'PRD', link: '/architecture/prd'},
					{
						text: 'Acceptance Criteria',
						link: '/architecture/acceptance-criteria',
					},
					{text: 'Node Graph Editor', link: '/architecture/node-graph-editor'},
					{
						text: 'Project File & State',
						link: '/architecture/project-file-and-state',
					},
					{
						text: 'Realtime Collaboration',
						link: '/architecture/realtime-collaboration',
					},
					{text: 'API Layer', link: '/architecture/api-layer'},
					{text: 'ADRs', link: '/adr/0001-initial-decision'},
				],
			},
			{
				text: 'Process',
				items: [
					{text: 'Increment Method', link: '/process/increment-method'},
					{text: 'PI-1 Charter', link: '/increments/pi-1/charter'},
					{text: 'PI-1 Log', link: '/increments/pi-1/log'},
				],
			},
			{
				text: 'Guides',
				items: [
					{text: 'Getting Started', link: '/guides/getting-started'},
					{text: 'Building an Adapter', link: '/guides/building-an-adapter'},
				],
			},
			{
				text: 'How-To',
				items: [{text: 'Run Locally', link: '/how-to/run-locally'}],
			},
			{
				text: 'Reference',
				items: [{text: 'API (TypeDoc)', link: '/reference/api/'}],
			},
		],
	},
} as const;
