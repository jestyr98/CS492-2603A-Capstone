# NPM
[node.js/npm]https://docs.npmjs.com/downloading-and-installing-node-js-and-npm   
npm run lint to check for linter rules   
npm run dev to run locally   
npm run build to build production ready application   
npm run preview for prduction local production build to test locally before deployment   

# GIT
If you don't have a github account you will want to create one using the e-mail I invited you with.   
https://git-scm.com/install/ - Choose your platform   

## Mac
On macOS, you can use the Terminal to check and set your Git configuration. This includes your username, email, editor, and other preferences that control Git’s behavior.

-Open the Terminal application on your Mac.   
-Type git config --list and press Enter to view all current Git configuration settings.   
-To set your global username, run git config --global user.name "Your Name" replacing with your actual name.   
-To set your global email, run git config --global user.email "your@email.com" replacing with your actual email.   
-Optional - To change the default text editor, run git config --global core.editor emacs or replace emacs with your preferred editor.   
-Optional - To enable colored output in Git, run git config --global color.ui true.   
-To verify changes, run git config --list again and check that the updated values are displayed.   

If you need to update a value, rerun the corresponding git config --global command with the new information.   

To setup a ssh key [GitHubSSHKey](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)   

[VideoSetup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)   
[VideoSSHKey](https://www.youtube.com/watch?v=6U53fsMiPm0)   

## Windows
-Open Terminal/Powershell   
-Type git config --list and press Enter to view all current Git configuration settings.   
-To set your global username, run git config --global user.name "Your Name" replacing with your actual name.   
-To set your global email, run git config --global user.email "your@email.com" replacing with your actual email.   
-Optional - To change the default text editor, run git config --global core.editor emacs or replace emacs with your preferred editor.   
-Optional - To enable colored output in Git, run git config --global color.ui true.   
-To verify changes, run git config --list again and check that the updated values are displayed.   

[VideoSetup](https://www.youtube.com/watch?v=AdzKzlp66sQ&pp=ygUjc2V0dXAgYW5kIGNvbmZpZ3VyZSBnaXQgb24gIHdpbmRvd3M%3D)   
[VideoSSHKey](https://www.youtube.com/watch?v=6U53fsMiPm0)   

# React + Vite

## Database Starter

A starter SQLite database schema has been added in `database/` for employees, inventory, and customer profile capture.

- Schema: `database/schema.sql`
- Seed data: `database/seed.sql`
- Usage notes: `database/README.md`

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
