const readline = require('readline');

class MultiStepLoader {
  constructor(steps) {
    this.steps = steps.map(step => ({
      ...step,
      status: 'pending', // pending, running, success, failed
      detail: ''
    }));
    this.currentIndex = 0;
    this.spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.spinnerIndex = 0;
    this.intervalId = null;
    this.startTime = Date.now();
  }

  start() {
    console.clear();
    console.log('\x1b[1m🚀 Starting Setup Process...\x1b[0m\n');
    this.render();
    this.intervalId = setInterval(() => {
      this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerFrames.length;
      this.render();
    }, 80);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.render();
  }

  render() {
    // Move cursor up to the start of the list
    // We need to move up by the number of steps
    // But first, we need to make sure we don't move up if we haven't printed anything yet
    // Actually, the easiest way is to move cursor to a specific position or just clear and redraw
    // But clearing flickers.
    // Better approach: use readline.cursorTo(process.stdout, 0, startLine)
    // But we don't know startLine easily.
    // Standard approach: move cursor up N lines.
    
    const linesToMoveUp = this.steps.length;
    if (this.renderedOnce) {
        readline.moveCursor(process.stdout, 0, -linesToMoveUp);
    }
    this.renderedOnce = true;

    this.steps.forEach((step, index) => {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      
      let icon = ' ';
      let color = '\x1b[90m'; // Gray
      let detailColor = '\x1b[90m'; // Gray

      if (step.status === 'pending') {
        icon = '☐';
        color = '\x1b[90m'; // Gray
      } else if (step.status === 'running') {
        icon = '\x1b[36m' + this.spinnerFrames[this.spinnerIndex] + '\x1b[0m'; // Cyan spinner
        color = '\x1b[36m'; // Cyan
        detailColor = '\x1b[37m'; // White
      } else if (step.status === 'success') {
        icon = '\x1b[32m✔\x1b[0m'; // Green check
        color = '\x1b[32m'; // Green
        detailColor = '\x1b[90m'; // Gray
      } else if (step.status === 'failed') {
        icon = '\x1b[31m✖\x1b[0m'; // Red X
        color = '\x1b[31m'; // Red
        detailColor = '\x1b[31m'; // Red
      }

      const name = step.name.padEnd(20);
      const detail = step.detail ? `| ${step.detail}` : '';
      
      // Limit detail length to avoid wrapping issues
      const maxDetailLen = 50;
      let truncatedDetail = detail;
      if (detail.length > maxDetailLen) {
          truncatedDetail = detail.substring(0, maxDetailLen) + '...';
      }

      process.stdout.write(`${icon} ${color}${name}\x1b[0m ${detailColor}${truncatedDetail}\x1b[0m\n`);
    });
  }

  startStep(index) {
    this.steps[index].status = 'running';
    this.currentIndex = index;
    this.render();
  }

  updateStep(index, detail) {
    this.steps[index].detail = detail;
    // We don't force render here to avoid excessive updates, the interval handles spinner
    // But if we want immediate feedback for text updates:
    // this.render(); 
    // Let's rely on the interval for smooth rendering unless we want instant text updates.
    // Actually, for "aesthetic loading", instant text update is nice.
    this.render();
  }

  succeedStep(index, message = 'Done') {
    this.steps[index].status = 'success';
    this.steps[index].detail = message;
    this.render();
  }

  failStep(index, message = 'Failed') {
    this.steps[index].status = 'failed';
    this.steps[index].detail = message;
    this.render();
  }
}

module.exports = MultiStepLoader;
