require("./app")(8080, function(err) {
  if (err) {
    console.error("starting app failed");
    process.exit(1);
  }
});
