const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const options = {
  runScripts: "dangerously",
  resources: "usable"
};

JSDOM.fromURL("http://localhost:4200/", options).then(dom => {
  dom.window.console.log = (...args) => console.log('LOG:', ...args);
  dom.window.console.warn = (...args) => console.warn('WARN:', ...args);
  dom.window.console.error = (...args) => console.error('ERROR:', ...args);
  dom.window.onerror = function(message, source, lineno, colno, error) {
    console.error("WINDOW ERROR:", message, error);
  };
  dom.window.addEventListener("unhandledrejection", event => {
    console.error("PROMISE REJECTION:", event.reason);
  });
  
  // Wait a bit for scripts to load and run
  setTimeout(() => {
    console.log("Done waiting.");
    process.exit(0);
  }, 10000);
}).catch(err => {
  console.error("JSDOM error:", err);
});
