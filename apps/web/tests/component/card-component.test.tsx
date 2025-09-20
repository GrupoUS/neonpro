/**
 * Card Component Unit Tests
 * Testing updated Card UI components with healthcare accessibility compliance
 * Following RED-GREEN-REFACTOR methodology
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card';
import { cn } from 'src/lib/utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

// Test components
const TestCardHeader = ({ title = 'Test Title', description = 'Test Description' }) => (
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardHeader>
);

const TestCardContent = ({ children = 'Test Content' }) => <CardContent>{children}</CardContent>;

const TestCardFooter = ({ children = 'Test Footer' }) => <CardFooter>{children}</CardFooter>;

describe('Card Component - Unit Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Card Container', () => {
    it('should render card with proper structure', () => {
      // RED: Test expects proper card structure
      const { container } = render(
        <Card data-testid='test-card'>
          <div>Card Content</div>
        </Card>,
      );

      const card = screen.getByTestId('test-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('text-card-foreground');
      expect(card).toHaveClass('shadow');
    });

    it('should apply custom className', () => {
      // RED: Test expects custom className application
      const { container } = render(
        <Card className='custom-card test-card'>
          <div>Custom Card</div>
        </Card>,
      );

      const card = container.firstChild;
      expect(card).toHaveClass('custom-card');
      expect(card).toHaveClass('test-card');
      expect(card).toHaveClass('rounded-xl'); // Default classes should remain
    });

    it('should forward ref correctly', () => {
      // RED: Test expects ref forwarding
      const ref = vi.fn();

      render(
        <Card ref={ref}>
          <div>Card with Ref</div>
        </Card>,
      );

      expect(ref).toHaveBeenCalled();
    });

    it('should spread HTML attributes correctly', () => {
      // RED: Test expects HTML attribute spreading
      const { container } = render(
        <Card
          data-testid='spread-test'
          aria-label='Test Card'
          role='article'
          tabIndex={0}
        >
          <div>Spread Attributes</div>
        </Card>,
      );

      const card = screen.getByTestId('spread-test');
      expect(card).toHaveAttribute('aria-label', 'Test Card');
      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('should handle children content', () => {
      // RED: Test expects children content handling
      const { container } = render(
        <Card>
          <div data-testid='child-1'>Child 1</div>
          <div data-testid='child-2'>Child 2</div>
          <button data-testid='child-button'>Button</button>
        </Card>,
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-button')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('should render header with proper structure', () => {
      // RED: Test expects proper header structure
      const { container } = render(
        <Card>
          <CardHeader data-testid='test-header'>
            <CardTitle>Header Title</CardTitle>
            <CardDescription>Header Description</CardDescription>
          </CardHeader>
        </Card>,
      );

      const header = screen.getByTestId('test-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('space-y-1.5');
      expect(header).toHaveClass('p-6');
    });

    it('should apply custom className to header', () => {
      // RED: Test expects custom header className
      const { container } = render(
        <Card>
          <CardHeader className='custom-header'>
            <CardTitle>Custom Header</CardTitle>
          </CardHeader>
        </Card>,
      );

      const header = container.querySelector('.custom-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('p-6'); // Default classes should remain
    });

    it('should handle header without title or description', () => {
      // RED: Test expects header without title/description
      const { container } = render(
        <Card>
          <CardHeader data-testid='empty-header'>
            <div>Just content</div>
          </CardHeader>
        </Card>,
      );

      const header = screen.getByTestId('empty-header');
      expect(header).toBeInTheDocument();
      expect(screen.getByText('Just content')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('should render title with proper styling', () => {
      // RED: Test expects proper title styling
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle data-testid='test-title'>Test Title</CardTitle>
          </CardHeader>
        </Card>,
      );

      const title = screen.getByTestId('test-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('leading-none');
      expect(title).toHaveClass('tracking-tight');
      expect(title).toHaveTextContent('Test Title');
    });

    it('should handle long titles gracefully', () => {
      // RED: Test expects long title handling
      const longTitle =
        'This is a very long title that should wrap properly and maintain readability across multiple lines without breaking the layout or causing overflow issues';

      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle data-testid='long-title'>{longTitle}</CardTitle>
          </CardHeader>
        </Card>,
      );

      const title = screen.getByTestId('long-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent(longTitle);
    });

    it('should apply custom className to title', () => {
      // RED: Test expects custom title className
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle className='custom-title text-2xl'>Custom Title</CardTitle>
          </CardHeader>
        </Card>,
      );

      const title = container.querySelector('.custom-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('custom-title');
      expect(title).toHaveClass('text-2xl');
    });
  });

  describe('CardDescription', () => {
    it('should render description with proper styling', () => {
      // RED: Test expects proper description styling
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription data-testid='test-description'>
              Test Description Text
            </CardDescription>
          </CardHeader>
        </Card>,
      );

      const description = screen.getByTestId('test-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-muted-foreground');
      expect(description).toHaveTextContent('Test Description Text');
    });

    it('should handle multiline descriptions', () => {
      // RED: Test expects multiline description handling
      const multilineDescription =
        'First line of description\nSecond line of description\nThird line for testing';

      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription data-testid='multiline-description'>
              {multilineDescription}
            </CardDescription>
          </CardHeader>
        </Card>,
      );

      const description = screen.getByTestId('multiline-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(multilineDescription);
    });

    it('should apply custom className to description', () => {
      // RED: Test expects custom description className
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription className='custom-description text-base'>
              Custom Description
            </CardDescription>
          </CardHeader>
        </Card>,
      );

      const description = container.querySelector('.custom-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('custom-description');
      expect(description).toHaveClass('text-base');
    });
  });

  describe('CardContent', () => {
    it('should render content with proper structure', () => {
      // RED: Test expects proper content structure
      const { container } = render(
        <Card>
          <CardContent data-testid='test-content'>
            <p>Main content paragraph</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </CardContent>
        </Card>,
      );

      const content = screen.getByTestId('test-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('p-6');
      expect(content).toHaveClass('pt-0'); // No top padding when after header

      expect(screen.getByText('Main content paragraph')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
    });

    it('should apply custom className to content', () => {
      // RED: Test expects custom content className
      const { container } = render(
        <Card>
          <CardContent className='custom-content p-8'>
            Custom Content Area
          </CardContent>
        </Card>,
      );

      const content = container.querySelector('.custom-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('custom-content');
      expect(content).toHaveClass('p-8');
    });

    it('should handle complex content structures', () => {
      // RED: Test expects complex content structure handling
      const { container } = render(
        <Card>
          <CardContent data-testid='complex-content'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='stat-item'>
                <h4>Stat 1</h4>
                <p>Value 1</p>
              </div>
              <div className='stat-item'>
                <h4>Stat 2</h4>
                <p>Value 2</p>
              </div>
            </div>
            <button>Action Button</button>
          </CardContent>
        </Card>,
      );

      const content = screen.getByTestId('complex-content');
      expect(content).toBeInTheDocument();
      expect(screen.getByText('Stat 1')).toBeInTheDocument();
      expect(screen.getByText('Value 1')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('should render footer with proper structure', () => {
      // RED: Test expects proper footer structure
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
          <CardFooter data-testid='test-footer'>
            <button>Cancel</button>
            <button>Confirm</button>
          </CardFooter>
        </Card>,
      );

      const footer = screen.getByTestId('test-footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('p-6');
      expect(footer).toHaveClass('pt-0'); // No top padding when after content

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('should apply custom className to footer', () => {
      // RED: Test expects custom footer className
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
          <CardFooter className='custom-footer justify-between'>
            <span>Footer content</span>
            <button>Action</button>
          </CardFooter>
        </Card>,
      );

      const footer = container.querySelector('.custom-footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('custom-footer');
      expect(footer).toHaveClass('justify-between');
    });

    it('should handle footer with single action', () => {
      // RED: Test expects single action footer handling
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
          <CardFooter data-testid='single-action-footer'>
            <button>Single Action</button>
          </CardFooter>
        </Card>,
      );

      const footer = screen.getByTestId('single-action-footer');
      expect(footer).toBeInTheDocument();
      expect(screen.getByText('Single Action')).toBeInTheDocument();
    });
  });

  describe('Complete Card Structure', () => {
    it('should render complete card with all components', () => {
      // RED: Test expects complete card structure
      const { container } = render(
        <Card data-testid='complete-card'>
          <CardHeader>
            <CardTitle>Complete Card Title</CardTitle>
            <CardDescription>Complete card description text</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
            <div>Additional content elements</div>
          </CardContent>
          <CardFooter>
            <button variant='outline'>Cancel</button>
            <button>Submit</button>
          </CardFooter>
        </Card>,
      );

      const card = screen.getByTestId('complete-card');
      expect(card).toBeInTheDocument();

      expect(screen.getByText('Complete Card Title')).toBeInTheDocument();
      expect(screen.getByText('Complete card description text')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByText('Additional content elements')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('should handle card with minimal structure', () => {
      // RED: Test expects minimal card structure handling
      const { container } = render(
        <Card data-testid='minimal-card'>
          <CardContent>Simple content only</CardContent>
        </Card>,
      );

      const card = screen.getByTestId('minimal-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Simple content only')).toBeInTheDocument();
    });

    it('should handle card with only header', () => {
      // RED: Test expects header-only card handling
      const { container } = render(
        <Card data-testid='header-only-card'>
          <CardHeader>
            <CardTitle>Header Only</CardTitle>
            <CardDescription>No content</CardDescription>
          </CardHeader>
        </Card>,
      );

      const card = screen.getByTestId('header-only-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Header Only')).toBeInTheDocument();
      expect(screen.getByText('No content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility tests', async () => {
      // RED: Test expects accessibility compliance
      const { container } = render(
        <Card data-testid='accessible-card'>
          <CardHeader>
            <CardTitle>Accessible Card Title</CardTitle>
            <CardDescription>Accessible card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Accessible content with proper semantics</p>
          </CardContent>
          <CardFooter>
            <button aria-label='Cancel action'>Cancel</button>
            <button aria-label='Confirm action'>Confirm</button>
          </CardFooter>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support proper ARIA attributes', () => {
      // RED: Test expects ARIA attribute support
      const { container } = render(
        <Card
          data-testid='aria-card'
          role='article'
          aria-labelledby='card-title'
          aria-describedby='card-description'
        >
          <CardHeader>
            <CardTitle id='card-title'>Card with ARIA</CardTitle>
            <CardDescription id='card-description'>Description for screen readers</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content with proper ARIA relationships</p>
          </CardContent>
        </Card>,
      );

      const card = screen.getByTestId('aria-card');
      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
      expect(card).toHaveAttribute('aria-describedby', 'card-description');
    });

    it('should handle keyboard navigation', async () => {
      // RED: Test expects keyboard navigation support
      const { container } = render(
        <Card data-testid='keyboard-card'>
          <CardContent>
            <button data-testid='card-button-1' tabIndex={0}>
              Button 1
            </button>
            <button data-testid='card-button-2' tabIndex={0}>
              Button 2
            </button>
          </CardContent>
        </Card>,
      );

      const button1 = screen.getByTestId('card-button-1');
      const button2 = screen.getByTestId('card-button-2');

      // Test keyboard navigation
      button1.focus();
      expect(button1).toHaveFocus();

      await user.keyboard('{Tab}');
      expect(button2).toHaveFocus();

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(button1).toHaveFocus();
    });

    it('should provide proper focus management', async () => {
      // RED: Test expects focus management
      const onFocus = vi.fn();
      const onBlur = vi.fn();

      const { container } = render(
        <Card
          data-testid='focus-card'
          onFocus={onFocus}
          onBlur={onBlur}
          tabIndex={0}
        >
          <CardContent>Focusable card content</CardContent>
        </Card>,
      );

      const card = screen.getByTestId('focus-card');

      card.focus();
      expect(onFocus).toHaveBeenCalled();

      card.blur();
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Healthcare-Specific Features', () => {
    it('should handle patient information cards with privacy', () => {
      // RED: Test expects patient information privacy handling
      const { container } = render(
        <Card data-testid='patient-card' className='patient-info-card'>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Confidential patient data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='patient-data'>
              <p>Patient ID: PAT-****-****</p>
              <p>Age: ** years</p>
              <p>Last Visit: **-**-****</p>
            </div>
          </CardContent>
          <CardFooter>
            <button aria-label='View patient details'>View Details</button>
          </CardFooter>
        </Card>,
      );

      const card = screen.getByTestId('patient-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('patient-info-card');

      // Verify data is properly anonymized
      const cardHTML = container.innerHTML;
      expect(cardHTML).toContain('PAT-****-****');
      expect(cardHTML).toContain('** years');
      expect(cardHTML).toContain('**-**-****');
    });

    it('should support medical data visualization cards', () => {
      // RED: Test expects medical data visualization support
      const { container } = render(
        <Card data-testid='medical-data-card'>
          <CardHeader>
            <CardTitle>Treatment Statistics</CardTitle>
            <CardDescription>Monthly treatment overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='medical-stats'>
              <div className='stat-item'>
                <h4>Total Treatments</h4>
                <p>1,247</p>
              </div>
              <div className='stat-item'>
                <h4>Success Rate</h4>
                <p>94.2%</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <button>Export Report</button>
            <button>View Details</button>
          </CardFooter>
        </Card>,
      );

      const card = screen.getByTestId('medical-data-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Total Treatments')).toBeInTheDocument();
      expect(screen.getByText('1,247')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
      expect(screen.getByText('94.2%')).toBeInTheDocument();
    });

    it('should comply with healthcare accessibility standards', async () => {
      // RED: Test expects healthcare accessibility compliance
      const { container } = render(
        <Card
          data-testid='healthcare-accessible-card'
          role='region'
          aria-label='Patient appointment summary'
        >
          <CardHeader>
            <CardTitle>Appointment Summary</CardTitle>
            <CardDescription>Scheduled for tomorrow at 2:00 PM</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p>
                <strong>Doctor:</strong> Dr. Smith
              </p>
              <p>
                <strong>Department:</strong> Cardiology
              </p>
              <p>
                <strong>Duration:</strong> 30 minutes
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <button aria-label='Reschedule appointment'>Reschedule</button>
            <button aria-label='Cancel appointment'>Cancel</button>
          </CardFooter>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      const card = screen.getByTestId('healthcare-accessible-card');
      expect(card).toHaveAttribute('role', 'region');
      expect(card).toHaveAttribute('aria-label', 'Patient appointment summary');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing children gracefully', () => {
      // RED: Test expects missing children handling
      const { container } = render(
        <Card data-testid='empty-card'>
        </Card>,
      );

      const card = screen.getByTestId('empty-card');
      expect(card).toBeInTheDocument();
      expect(card.children.length).toBe(0);
    });

    it('should handle invalid child components', () => {
      // RED: Test expects invalid child component handling
      const InvalidComponent = () => <div>Invalid Component</div>;

      expect(() => {
        render(
          <Card>
            <InvalidComponent />
          </Card>,
        );
      }).not.toThrow();
    });

    it('should handle nested card structures', () => {
      // RED: Test expects nested card structure handling
      const { container } = render(
        <Card data-testid='outer-card'>
          <CardHeader>
            <CardTitle>Outer Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Card data-testid='inner-card'>
              <CardContent>Inner Card Content</CardContent>
            </Card>
          </CardContent>
        </Card>,
      );

      expect(screen.getByTestId('outer-card')).toBeInTheDocument();
      expect(screen.getByTestId('inner-card')).toBeInTheDocument();
      expect(screen.getByText('Inner Card Content')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple cards', () => {
      // RED: Test expects efficient multiple card rendering
      const startTime = performance.now();

      const { container } = render(
        <div data-testid='cards-container'>
          {Array(100).fill(null).map((_, i) => (
            <Card key={i} data-testid={`card-${i}`}>
              <CardHeader>
                <CardTitle>Card {i + 1}</CardTitle>
                <CardDescription>Description {i + 1}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Content for card {i + 1}</p>
              </CardContent>
            </Card>
          ))}
        </div>,
      );

      const endTime = performance.now();

      expect(screen.getByTestId('cards-container')).toBeInTheDocument();
      expect(screen.getByTestId('card-0')).toBeInTheDocument();
      expect(screen.getByTestId('card-99')).toBeInTheDocument();

      // Should render 100 cards quickly
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should minimize re-renders on prop changes', async () => {
      // RED: Test expects minimized re-renders
      const { rerender, container } = render(
        <Card data-testid='performance-card'>
          <CardContent>Initial Content</CardContent>
        </Card>,
      );

      const initialRenderCount = container.innerHTML;

      // Re-render with same props
      rerender(
        <Card data-testid='performance-card'>
          <CardContent>Initial Content</CardContent>
        </Card>,
      );

      expect(container.innerHTML).toBe(initialRenderCount);
    });
  });

  describe('Responsive Design', () => {
    it('should handle mobile viewports', () => {
      // RED: Test expects mobile viewport handling
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <Card data-testid='mobile-card' className='mobile-responsive'>
          <CardHeader>
            <CardTitle>Mobile Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Mobile optimized content</p>
          </CardContent>
        </Card>,
      );

      const card = screen.getByTestId('mobile-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('mobile-responsive');

      // Reset window width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should handle tablet viewports', () => {
      // RED: Test expects tablet viewport handling
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(
        <Card data-testid='tablet-card' className='tablet-responsive'>
          <CardHeader>
            <CardTitle>Tablet Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Tablet optimized content</p>
          </CardContent>
        </Card>,
      );

      const card = screen.getByTestId('tablet-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('tablet-responsive');

      // Reset window width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });
  });

  describe('Component Composition', () => {
    it('should work with custom card components', () => {
      // RED: Test expects custom card component integration
      const CustomPatientCard = ({ name, age, lastVisit }: any) => (
        <Card data-testid='custom-patient-card'>
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Patient Record</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Age: {age}</p>
            <p>Last Visit: {lastVisit}</p>
          </CardContent>
          <CardFooter>
            <button>Edit</button>
            <button>View History</button>
          </CardFooter>
        </Card>
      );

      const { container } = render(
        <CustomPatientCard
          name='John Doe'
          age={45}
          lastVisit='2024-01-15'
        />,
      );

      const card = screen.getByTestId('custom-patient-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Age: 45')).toBeInTheDocument();
      expect(screen.getByText('Last Visit: 2024-01-15')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('View History')).toBeInTheDocument();
    });

    it('should support conditional rendering in card components', () => {
      // RED: Test expects conditional rendering support
      const ConditionalCard = ({ showFooter = true }: any) => (
        <Card data-testid='conditional-card'>
          <CardHeader>
            <CardTitle>Conditional Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Main content</p>
          </CardContent>
          {showFooter && (
            <CardFooter>
              <button>Action</button>
            </CardFooter>
          )}
        </Card>
      );

      const { rerender } = render(<ConditionalCard showFooter={true} />);

      expect(screen.getByText('Action')).toBeInTheDocument();

      rerender(<ConditionalCard showFooter={false} />);

      expect(screen.queryByText('Action')).not.toBeInTheDocument();
    });
  });
});
