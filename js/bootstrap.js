const BOOTSTRAP_STAGE_STATES = {
  UNINITIALIZED: 0,
  RUNNING: 1,
  COMPLETE: 2,
};

class BootstrapStage {
  constructor(name) {
    this.name = name;
    this.tasks = new Set();
    this.taskLog = new Set();
    this.state = BOOTSTRAP_STAGE_STATES.UNINITIALIZED; 
    // In Gecko we can make the Bootstrap register for the
    // next mozAfterPaint after this stage is completed
    // and record it here.
    this.paintTime = null;
  }

  async run() {
    const stageName = `bootstrap-stage-${this.name}`;
    performance.mark(`${stageName}-start`);
    this.state = BOOTSTRAP_STAGE_STATES.RUNNING;
    // Parallel execution of all scheduled tasks,
    // with ability for new tasks to be scheduled
    // from within of the current batch.
    while (this.tasks.size) {
      let currentTasks = Array.from(this.tasks);
      this.tasks.clear();
      await Promise.all(currentTasks.map(async item => {
        const taskName = `${stageName}-${item.name}`;
        this.taskLog.add(taskName);
        performance.mark(`${taskName}-start`);
        await item.call(null);
        performance.mark(`${taskName}-end`);
        performance.measure(taskName, `${taskName}-start`, `${taskName}-end`);
      }));
    }
    performance.mark(`${stageName}-end`);
    performance.measure(stageName, `${stageName}-start`, `${stageName}-end`);
    this.state = BOOTSTRAP_STAGE_STATES.COMPLETE;
  }
}

class Bootstrap {
  constructor(stages) {
    this.stageOrder = Array.from(stages).map(stage => stage.name);
    this.stages = new Map(Array.from(stages).map(stage => [stage.name, stage]));
    this.currentStage = null;
  }

  async init(initPerfMarkName) {
    for (let stage of this.stageOrder) {
      this.currentStage = this.stages.get(stage);
      await this.currentStage.run();
    }
    performance.mark("bootstrap-end");
    this.currentStage = null;
    performance.measure("bootstrap", initPerfMarkName, "bootstrap-end");
  }

  schedule(name, callback) {
    const stage = this.stages.get(name);
    if (stage.state === BOOTSTRAP_STAGE_STATES.COMPLETE) {
      console.warn("Stage completed at the time of registering.");
      if (this.currentStage !== null) {
        this.currentStage.tasks.add(callback);
      } else {
        // We could enforce async here as well.
        callback.call(null);
      }
    } else {
      // Here we could warn/throw if the cb is registered
      // multiple times.
      this.stages.get(name).tasks.add(callback);
    }
  }
}
