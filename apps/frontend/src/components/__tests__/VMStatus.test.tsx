import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { VMStatus } from '../VMStatus/VMStatus';

describe('VMStatus', () => {
  it('renders without crashing', () => {
    const { container } = render(() => <VMStatus status="shutoff" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders shutdown state', () => {
    const { container } = render(() => <VMStatus status="shutoff" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('status');
    expect(div.className).toContain('stopped');
  });

  it('renders running state', () => {
    const { container } = render(() => <VMStatus status="running" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('started');
  });

  it('renders paused state', () => {
    const { container } = render(() => <VMStatus status="paused" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('paused');
  });

  it('renders unknown state with default class', () => {
    const { container } = render(() => <VMStatus status={'unknown' as any} />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('unavailable');
  });
});
