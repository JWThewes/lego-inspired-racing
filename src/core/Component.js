/**
 * Component base class - Pure data container
 * Components hold data but no logic
 */
export class Component {
  constructor() {
    if (this.constructor === Component) {
      throw new Error('Component is an abstract class and cannot be instantiated directly');
    }
  }
}
