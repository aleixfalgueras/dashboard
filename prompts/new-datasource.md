New datasource addition is separated in 2 prompts for better testing and AI planning

1. Data propagation

Let's integrate new datasource: YOUTUBE
- Create required models in schema.prisma file.
- Create function processYoutubeUpload in the new youtube-service file. Add database methods used by the service in new youtube-repository file. Don't add unused or extra methods.
- Create required new zod types in youtube-types.ts file.
- Update function processUpload from upload-service to handle new datasource.
- Update appropriately datasource dropdown, datasource data clean dialog, and function getDataSourceFromFilename from the admin page.
- Forgot about the dashboard service for now.

Example of json data for this datasource can be found in samples/dico.youtube.json.

2. Dashboard Update

Update dashboard service to handle youtube service data and create new component YoutubeSection to show data in the slug page.
