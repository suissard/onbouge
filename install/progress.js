class ProgressBar {
  constructor(total, description = 'Progress') {
    this.total = total;
    this.current = 0;
    this.description = description;
    this.barLength = 30;
  }

  update(current, message = '') {
    this.current = current;
    const percentage = Math.min(Math.max(this.current / this.total, 0), 1);
    const filledLength = Math.round(this.barLength * percentage);
    const emptyLength = this.barLength - filledLength;
    
    const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
    const percentStr = (percentage * 100).toFixed(0);
    
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${this.description} [${bar}] ${percentStr}% | ${message}`);
  }

  increment(message = '') {
    this.update(this.current + 1, message);
  }

  finish(message = 'Done!') {
    this.update(this.total, message);
    process.stdout.write('\n');
  }
}

module.exports = ProgressBar;
