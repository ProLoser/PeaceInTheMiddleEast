import {describe, it, expect} from '@jest/globals';
import {render} from '@testing-library/react';
import Dice from './Dice';
import {Color} from '../Types';

describe('Dice', () => {
  const defaultProps = {
    onPointerUp: () => {},
    values: [3, 4] as [number, number],
    used: [],
  };

  describe('snapshots', () => {
    it('should render with default values', () => {
      const {container} = render(<Dice {...defaultProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render with doubles (4 dice)', () => {
      const {container} = render(
          <Dice
            {...defaultProps}
            values={[6, 6, 6, 6] as unknown as [number, number]}
          />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render with white color', () => {
      const {container} = render(
          <Dice {...defaultProps} color={Color.White} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render with black color', () => {
      const {container} = render(
          <Dice {...defaultProps} color={Color.Black} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render with some dice used', () => {
      const {container} = render(
          <Dice
            {...defaultProps}
            values={[3, 4]}
            used={[{value: 3, label: '1/4'}]}
          />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render with all dice used', () => {
      const {container} = render(
          <Dice
            {...defaultProps}
            values={[3, 4]}
            used={[{value: 3, label: '1/4'}, {value: 4, label: '4/8'}]}
          />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render with disabled state', () => {
      const {container} = render(
          <Dice {...defaultProps} disabled={true} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render with pulsate animation', () => {
      const {container} = render(
          <Dice {...defaultProps} pulsate={true} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render doubles with some dice used', () => {
      const {container} = render(
          <Dice
            {...defaultProps}
            values={[5, 5, 5, 5] as unknown as [number, number]}
            used={[{value: 5, label: '1/6'}, {value: 5, label: '6/11'}]}
          />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render with all die values 1-6 for white', () => {
      const {container} = render(
          <Dice
            {...defaultProps}
            values={[1, 2]}
            color={Color.White}
          />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should render correct number of dice images', () => {
      const {container} = render(<Dice {...defaultProps} values={[1, 2]} />);
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(2);
    });

    it('should render 4 dice images for doubles', () => {
      const {container} = render(
          <Dice
            {...defaultProps}
            values={[3, 3, 3, 3] as unknown as [number, number]}
          />
      );
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(4);
    });

    it('should mark used dice with "used" class', () => {
      const {container} = render(
          <Dice
            {...defaultProps}
            values={[3, 4]}
            used={[{value: 3, label: '1/4'}]}
          />
      );
      const images = container.querySelectorAll('img');
      const usedImages = container.querySelectorAll('img.used');
      expect(usedImages.length).toBe(1);
      expect(images.length).toBe(2);
    });

    it('should add pulsate class when pulsate prop is true', () => {
      const {container} = render(
          <Dice {...defaultProps} pulsate={true} />
      );
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('pulsate');
    });

    it('should have dice class on container', () => {
      const {container} = render(<Dice {...defaultProps} />);
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('dice');
    });
  });
});
