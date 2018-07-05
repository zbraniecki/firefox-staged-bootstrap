function generateMeasurements(bootstrap) {
  let totalMeasure = performance.getEntriesByName("bootstrap")[0];
  console.log(`Total bootstrap time: ${totalMeasure.duration} (start time: ${totalMeasure.startTime})`);
  for (let stage of bootstrap.stageOrder) {
    let stageMeasure = performance.getEntriesByName(`bootstrap-stage-${stage}`)[0];
    console.log(`=== Stage "${stage}": ${stageMeasure.duration} (start: time ${stageMeasure.startTime}) ===`);
    for (let taskName of bootstrap.stages.get(stage).taskLog) {
      let itemMeasure = performance.getEntriesByName(taskName)[0];

      console.log(`Item "${taskName}": ${itemMeasure.duration} (start: time ${itemMeasure.startTime})`);
    }
  }
}
