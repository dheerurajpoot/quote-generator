This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Server-Side Auto-Posting

This application includes a server-side auto-posting feature that allows quotes to be automatically posted to social media platforms at specified intervals, even when the browser is closed or the PC is off.

### How It Works

1. The auto-posting settings are stored in the database, including:

    - Whether auto-posting is enabled
    - The posting interval (in minutes)
    - The selected platforms (Facebook, Instagram, etc.)

2. A server-side cron job runs every minute to check if it's time to post for each user.

3. When it's time to post, the cron job:
    - Fetches a random quote
    - Generates an image
    - Posts to the selected social media platforms
    - Updates the last post time

### Setting Up Server-Side Auto-Posting

1. Install the required dependencies:

    ```bash
    npm install node-cron @types/node-cron
    ```

2. Start the application (this will run both the Next.js server and the cron job):
    ```bash
    npm run dev
    ```

### Production Deployment

For production deployment, you can use a process manager like PM2 to keep the server running:

```bash
# Install PM2
npm install -g pm2

# Build the application
npm run build

# Start the server
pm2 start npm --name "quote-generator" -- start

# Save the PM2 configuration
pm2 save
```

This will ensure that the server restarts automatically if it crashes or if the server reboots.
