import { FocusEngine } from '../index';
import '@testing-library/jest-dom';

describe('FocusEngine', () => {
  let focusEngine: FocusEngine;

  beforeEach(() => {
    focusEngine = new FocusEngine();
  });

  test('should create an instance with default options', () => {
    expect(focusEngine).toBeInstanceOf(FocusEngine);
  });
});
