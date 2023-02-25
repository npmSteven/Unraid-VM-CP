# Unraid VM CP (Alpha)
Not yet released, WIP

Unraid VM CP is a project that provides additional functionality for [Unraid](https://unraid.net/). The purpose of this project is to allow Unraid users to give access to manage their VMs without requiring the recipient to have their own Unraid login credentials.

## Stack
- Overall
  - Docker
  - concurrently
  - pnpm
- Frontend
  - Solidjs
  - TypeScript
- Backend
  - Nodejs
  - TypeScript
  - Sequlize (sqlite)
  - express

## Features
- Gives you the ability to grant access and permissions to specific VMs for designated users.
- Able to control a VM without needing to login to [Unraid](https://unraid.net/).

## How does Unraid VM CP work?
The system's architecture is relatively simple, consisting of two primary components: the Frontend and the Backend. While the Frontend is straightforward, the Backend is more complex in comparison.

We call the Unraid API directly, using endpoints that were found by inspecting network requests. These endpoints are not officially supported, so if the API returns unexpected results, the backend may break. To avoid issues, please use caution after Unraid updates and stay informed about this project.

## What happens if Unraid introduces a feature to create a managed user with VM access?
If that feature becomes available and this project no longer addresses any other outstanding issues, then I will consider archiving it. It would be great if Unraid offers such functionality in the future.

## Docker
Build
```
docker build -t unraid-vm-cp .
```
Run
```
docker run -p 8000:8000 -p 3000:3000 --env-file ./.env -t unraid-vm-cp
```

## Built With

- [Node.js](https://nodejs.org/en/) - The JavaScript runtime used to run the server-side code.
- [Express](https://expressjs.com/) - The web framework used to build the REST API.

## Authors

- **Steven Rafferty** - [npmSteven](https://github.com/npmSteven)

## License

This project is licensed under the AGPL 3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Unraid](https://unraid.net/) for providing the foundation for this project.