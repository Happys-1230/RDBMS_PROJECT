import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/common/config/db.js";

const PORT = process.env.PORT || 4001;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`StockWise backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed.");
    process.exit(1);
  }
}

startServer();


