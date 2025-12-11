VaultString Frontend

VaultString Frontend is a Next.js 16+ application using the App Router, modular components, onboarding wizard, authentication flows, and a protected dashboard.

Prerequisites

Before running the project, ensure you have:

Node.js
 v20.x or higher

npm
 v9.x or higher, or yarn
, or pnpm
 v8.x or higher

Git
 (for cloning the repository)

Installation

Clone the repository:

git clone https://github.com/your-username/vaultstring-frontend.git
cd vaultstring-frontend


Install dependencies:

Using npm:

npm install


Using yarn:

yarn install


Using pnpm:

pnpm install


Set up environment variables:

Copy the template .env.example:

cp .env.example .env


Then fill in all required values (API endpoints, secrets, etc.).

Running the Project
Development Mode

Run the app in development with hot reloading:

# npm
npm run dev

# yarn
yarn dev

# pnpm
pnpm dev


By default, it will run at http://localhost:3000
.

Production Mode

Build and start in production:

# npm
npm run build
npm run start

# yarn
yarn build
yarn start

# pnpm
pnpm build
pnpm start

Linting and Formatting

Lint the project:

# npm
npm run lint

# yarn
yarn lint

# pnpm
pnpm lint


Format code using Prettier:

# npm
npm run format

# yarn
yarn format

# pnpm
pnpm format

Project Structure
C:\Users\USER\Desktop\vaultstring\vaultstring-frontend> tree -L 3 -I ".vercel|.next|node_modules"
.
|-- README.md
|-- app
|   |-- (auth)
|   |   |-- login
|   |   |-- reset-password
|   |   |-- signup
|   |   `-- verification
|   |-- dashboard
|   |-- favicon.ico
|   |-- globals.css
|   |-- layout.tsx
|   |-- onboarding
|   `-- page.tsx
|-- auth-requirements.txt
|-- dashboard.txt
|-- design-requirements.txt
|-- eslint.config.mjs
|-- general.txt
|-- next-env.d.ts
|-- next.config.ts
|-- onboarding.txt
|-- package.json
|-- pnpm-lock.yaml
|-- postcss.config.mjs
|-- public
|   |-- file.svg
|   |-- fonts
|   |-- globe.svg
|   |-- icons
|   |-- images
|   |-- next.svg
|   |-- vercel.svg
|   `-- window.svg
|-- src
|   |-- components
|   |   |-- dashboard
|   |   |-- forms
|   |   |-- shared
|   |   `-- ui
|   |-- hooks
|   |-- lib
|   |   |-- api
|   |   |-- auth
|   |   `-- utils
|   |-- store
|   |-- styles
|   `-- types
`-- tsconfig.json

Notes

The app directory must be at the project root for Next.js 16+ App Router.

Make sure all environment variables are set before running.

Tailwind CSS is pre-configured in tailwind.config.ts.

Components and hooks are modular for easy reuse and maintainability.

Contribution

Feel free to fork the repo and submit pull requests. Ensure:

Code is properly linted and formatted.

Features are documented in the README.

Changes are backward compatible.