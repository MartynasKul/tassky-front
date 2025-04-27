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


# Things that i would like to do to move this project further:
- [ ] Move all types and interfaces to types.ts file
- [ ] Move auth to Clerk instead of writing the auth myself. As proven with no Google OAuth, im incapable of doing that for now. Thats why a normal, less secure JWT auth is done.
- [ ] Move to AWS instead of Vercel. (unless i figure out websockets with vercel)
- [ ] Add API for task creation from other tools such as github, machines that run certain tasks.
- [ ] Add AI bot to create tasks with natural language instead of going and manually adding the tasks myself.
- [ ] Make my project more swift and mobile friendly. (Currently not that mobile friendly as seen from some modals/pages)
