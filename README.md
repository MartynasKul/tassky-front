# tassky-front
To test socket functionality (that is slightly outdated at this point of project, will need to update), will need to uncomment ws code section and add this to your .env file:
```
NEXT_PUBLIC_SOCKET_URL=yourBackendWebsocketUrl;
```

To run in development mode be sure to have backend running or just hope that my backend is running on vercel.
```
#to run in localhost:
cd tassky-frontend
npm install
npm run dev
```

To test project in action:
[tassky.vercel.app](https://tassky.vercel.app/)

# Things that i would like to do to move this project further:
- [ ] Move all types and interfaces to types.ts file. For Code cleanup
- [ ] Change up auth methods for cleaner and more secure ways of storing auth data and securing said data
- [ ] Make webpages load faster with differenet skeletons and loading checks
- [ ] Add API for task creation from other tools such as github, machines that run certain tasks.
- [ ] Add AI bot to create tasks with natural language instead of going and manually adding the tasks myself.
- [x] Make my project more swift and mobile friendly. (Currently not that mobile friendly as seen from some modals/pages)
