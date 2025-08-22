const app = require("./app");
const { init } = require("./utils/socket");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io
init(server);
