How to run the application:

Prerequisites: Make sure MySQL (e.g., XAMPP) is running on port 3306.

1. Run the Backend API Server: Navigate to the backend folder, create a .env file with DATABASE_URL="mysql://root:@localhost:3306/store_rating" and JWT_SECRET="super-secret-key-12345", then run:

  npm install
  
  npx prisma migrate dev --name init
  
  npm run dev (Runs on http://localhost:5000)

2. Run the Frontend Client: Navigate to the frontend folder and run:

npm install
npm run dev (Runs on http://localhost:5173)


Test Accounts (Pre-seeded):

Admin: admin@example.com / AdminPass123!

Normal User: user@example.com / UserPass123!

Store Owner: owner@example.com / OwnerPass123!
