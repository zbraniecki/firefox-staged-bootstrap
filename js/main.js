performance.mark("bootstrap-start");

async function delay(ts) {
  await new Promise((resolve, reject) => {
    setTimeout(resolve, ts);
  });
}

const stages = new Set([
  new BootstrapStage("started"),
  new BootstrapStage("initialized"),
  new BootstrapStage("fully-loaded")
]);

const bootstrap = new Bootstrap(stages);

function callAfterStarted() {
  console.log("callAfterStarted");
}

// and injecting after the stage is completed?
async function callAfterStarted2() {
  await delay(1000);
  console.log("callAfterStarted2");
}

function callAfterStarted3() {
  console.log("callAfterStarted3");
}

async function callAfterInitialized() {
  await delay(300);
  console.log("callAfterInitialized");
  bootstrap.schedule("started", callAfterStarted3);
}

bootstrap.schedule("started", callAfterStarted);
bootstrap.schedule("started", callAfterStarted2);
bootstrap.schedule("initialized", callAfterInitialized);

bootstrap.init("bootstrap-start");

bootstrap.schedule("fully-loaded", async function() {
  delay(100).then(generateMeasurements.bind(null, bootstrap));
});
