import { describe, it, expect } from 'vitest';
import { Component } from '../src/core/Component.js';

describe('Component', () => {
  it('should not allow direct instantiation', () => {
    expect(() => new Component()).toThrow('Component is an abstract class');
  });

  it('should allow subclass instantiation', () => {
    class TestComponent extends Component {
      constructor() {
        super();
        this.testValue = 123;
      }
    }

    const component = new TestComponent();
    expect(component).toBeInstanceOf(Component);
    expect(component.testValue).toBe(123);
  });

  it('should support multiple properties', () => {
    class PositionComponent extends Component {
      constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
      }
    }

    const position = new PositionComponent(10, 20, 30);
    expect(position.x).toBe(10);
    expect(position.y).toBe(20);
    expect(position.z).toBe(30);
  });
});
