const path = require("path");

module.exports = {
  entry: {
    firebaseClient: "./src/firebaseClient.js",
    customCalendar: "./src/custom_calendar.js",
    pmiEvent: "./src/pmi_event.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js" // Creates separate bundles for each file
  },
  resolve: {
    extensions: [".js"]
  },
  mode: "development" // Change to "production" for production builds
};