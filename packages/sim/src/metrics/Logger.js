export class Logger {
  constructor() {
    this.events = [];
  }

  push(event) {
    this.events.push(event);
  }
}
