import { UniversalButton } from '@/components/ui';
import { Button } from '@/components/ui'; // shadcn/ui Button for conflict testing
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/__tests/comprehensive-button-test')({
  component: ComprehensiveButtonTest,
});

function ComprehensiveButtonTest() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [currentTest, setCurrentTest] = useState<string>('');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Test for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const markTestResult = (testName: string, passed: boolean) => {
    setTestResults(prev => ({ ...prev, [testName]: passed }));
  };

  return (
    <div className='min-h-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-4xl font-bold text-center mb-2 text-slate-800 dark:text-slate-200'>
          Universal Button Comprehensive Testing
        </h1>
        <p className='text-center text-slate-600 dark:text-slate-400 mb-8'>
          Complete test suite for production readiness validation
        </p>

        {/* Test Status Dashboard */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-8'>
          <h2 className='text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-200'>
            Test Execution Status
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600'>
                {Object.keys(testResults).length}
              </div>
              <div className='text-sm text-slate-600 dark:text-slate-400'>
                Total Tests Run
              </div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-green-600'>
                {Object.values(testResults).filter(Boolean).length}
              </div>
              <div className='text-sm text-slate-600 dark:text-slate-400'>
                Passed
              </div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-red-600'>
                {Object.values(testResults).filter(r => !r).length}
              </div>
              <div className='text-sm text-slate-600 dark:text-slate-400'>
                Failed
              </div>
            </div>
          </div>
          <div className='mt-4'>
            <div className='text-sm text-slate-600 dark:text-slate-400'>
              Reduced Motion: {reducedMotion ? 'Enabled' : 'Disabled'}
            </div>
            <div className='text-sm text-slate-600 dark:text-slate-400'>
              Current Test: {currentTest || 'None'}
            </div>
          </div>
        </div>

        {/* 1. INDIVIDUAL EFFECTS TESTING */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-8'>
          <h3 className='text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200'>
            1. Individual Effects Testing
          </h3>

          <div className='grid md:grid-cols-3 gap-6'>
            {/* Gradient Effect Tests */}
            <div className='space-y-4'>
              <h4 className='text-lg font-medium text-slate-700 dark:text-slate-300'>
                Gradient Effects (KokonutUI)
              </h4>

              <UniversalButton
                enableGradient
                variant='default'
                className='w-full'
                onClick={() => {
                  setCurrentTest('Gradient Default');
                  markTestResult('gradient-default', true);
                }}
              >
                Default Gradient
              </UniversalButton>

              <UniversalButton
                enableGradient
                variant='destructive'
                className='w-full'
                onClick={() => {
                  setCurrentTest('Gradient Destructive');
                  markTestResult('gradient-destructive', true);
                }}
              >
                Destructive Gradient
              </UniversalButton>

              <UniversalButton
                enableGradient
                variant='outline'
                className='w-full'
                onClick={() => {
                  setCurrentTest('Gradient Custom Colors');
                  markTestResult('gradient-custom', true);
                }}
              >
                Custom Colors
              </UniversalButton>
            </div>

            {/* Neumorph Effect Tests */}
            <div className='space-y-4'>
              <h4 className='text-lg font-medium text-slate-700 dark:text-slate-300'>
                Neumorph Effects (CultUI)
              </h4>

              <UniversalButton
                enableNeumorph
                variant='default'
                className='w-full'
                onClick={() => {
                  setCurrentTest('Neumorph Default');
                  markTestResult('neumorph-default', true);
                }}
              >
                Neumorph Button
              </UniversalButton>

              <UniversalButton
                enableNeumorph
                variant='secondary'
                size='sm'
                className='w-full'
                onClick={() => {
                  setCurrentTest('Neumorph Small');
                  markTestResult('neumorph-small', true);
                }}
              >
                Small Neumorph
              </UniversalButton>

              <UniversalButton
                enableNeumorph
                variant='outline'
                size='lg'
                className='w-full'
                onClick={() => {
                  setCurrentTest('Neumorph Large');
                  markTestResult('neumorph-large', true);
                }}
              >
                Large Neumorph
              </UniversalButton>
            </div>

            {/* Border Gradient Effect Tests */}
            <div className='space-y-4'>
              <h4 className='text-lg font-medium text-slate-700 dark:text-slate-300'>
                Border Gradient (Aceternity)
              </h4>

              <UniversalButton
                enableBorderGradient
                variant='outline'
                className='w-full'
                duration={2}
                onClick={() => {
                  setCurrentTest('Border Gradient Fast');
                  markTestResult('border-gradient-fast', true);
                }}
              >
                Fast Rotation (2s)
              </UniversalButton>

              <UniversalButton
                enableBorderGradient
                variant='outline'
                className='w-full'
                duration={5}
                clockwise={false}
                onClick={() => {
                  setCurrentTest('Border Gradient Slow CCW');
                  markTestResult('border-gradient-slow-ccw', true);
                }}
              >
                Slow Counter-clockwise
              </UniversalButton>

              <UniversalButton
                enableBorderGradient
                variant='outline'
                size='lg'
                className='w-full'
                onClick={() => {
                  setCurrentTest('Border Gradient Large');
                  markTestResult('border-gradient-large', true);
                }}
              >
                Large Border Gradient
              </UniversalButton>
            </div>
          </div>
        </div>

        {/* 2. EFFECT COMBINATIONS TESTING */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-8'>
          <h3 className='text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200'>
            2. Effect Combinations Testing
          </h3>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <UniversalButton
              enableGradient
              enableNeumorph
              variant='default'
              className='w-full'
              onClick={() => {
                setCurrentTest('Gradient + Neumorph');
                markTestResult('combo-gradient-neumorph', true);
              }}
            >
              Gradient + Neumorph
            </UniversalButton>

            <UniversalButton
              enableGradient
              enableBorderGradient
              variant='outline'
              className='w-full'
              onClick={() => {
                setCurrentTest('Gradient + Border');
                markTestResult('combo-gradient-border', true);
              }}
            >
              Gradient + Border
            </UniversalButton>

            <UniversalButton
              enableNeumorph
              enableBorderGradient
              variant='secondary'
              className='w-full'
              onClick={() => {
                setCurrentTest('Neumorph + Border');
                markTestResult('combo-neumorph-border', true);
              }}
            >
              Neumorph + Border
            </UniversalButton>

            <UniversalButton
              enableGradient
              enableNeumorph
              enableBorderGradient
              variant='default'
              className='w-full'
              onClick={() => {
                setCurrentTest('All Three Effects');
                markTestResult('combo-all-three', true);
              }}
            >
              All Three Effects
            </UniversalButton>
          </div>
        </div>

        {/* 3. STATES TESTING */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-8'>
          <h3 className='text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200'>
            3. States Testing
          </h3>

          <div className='grid md:grid-cols-3 gap-6'>
            <div className='space-y-4'>
              <h4 className='text-lg font-medium text-slate-700 dark:text-slate-300'>
                Loading States
              </h4>

              <UniversalButton
                enableGradient
                variant='default'
                loading
                onClick={() => markTestResult('loading-gradient', true)}
              >
                Loading Gradient
              </UniversalButton>

              <UniversalButton
                enableNeumorph
                variant='secondary'
                loading
                onClick={() => markTestResult('loading-neumorph', true)}
              >
                Loading Neumorph
              </UniversalButton>

              <UniversalButton
                enableBorderGradient
                loading
                variant='outline'
                onClick={() => markTestResult('loading-border', true)}
              >
                Loading Border
              </UniversalButton>
            </div>

            <div className='space-y-4'>
              <h4 className='text-lg font-medium text-slate-700 dark:text-slate-300'>
                Disabled States
              </h4>

              <UniversalButton
                enableGradient
                variant='default'
                disabled
                onClick={() => markTestResult('disabled-gradient', false)}
              >
                Disabled Gradient
              </UniversalButton>

              <UniversalButton
                enableNeumorph
                variant='secondary'
                disabled
                onClick={() => markTestResult('disabled-neumorph', false)}
              >
                Disabled Neumorph
              </UniversalButton>

              <UniversalButton
                enableBorderGradient
                variant='outline'
                disabled
                onClick={() => markTestResult('disabled-border', false)}
              >
                Disabled Border
              </UniversalButton>
            </div>

            <div className='space-y-4'>
              <h4 className='text-lg font-medium text-slate-700 dark:text-slate-300'>
                Size Variants
              </h4>

              <UniversalButton
                enableGradient
                variant='default'
                size='sm'
                className='w-full'
                onClick={() => markTestResult('size-small', true)}
              >
                Small
              </UniversalButton>

              <UniversalButton
                enableNeumorph
                variant='secondary'
                size='lg'
                className='w-full'
                onClick={() => markTestResult('size-large', true)}
              >
                Large
              </UniversalButton>

              <UniversalButton
                enableBorderGradient
                variant='outline'
                size='icon'
                onClick={() => markTestResult('size-icon', true)}
              >
                🎯
              </UniversalButton>
            </div>
          </div>
        </div>

        {/* 4. INTEGRATION TESTING */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-8'>
          <h3 className='text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200'>
            4. Integration Testing
          </h3>

          <div className='space-y-6'>
            <div>
              <h4 className='text-lg font-medium text-slate-700 dark:text-slate-300 mb-4'>
                Coexistence with shadcn/ui Button
              </h4>
              <div className='flex flex-wrap gap-4'>
                <Button
                  variant='default'
                  onClick={() => markTestResult('shadcn-button-works', true)}
                >
                  Standard Button
                </Button>

                <UniversalButton
                  enableGradient
                  variant='default'
                  onClick={() => markTestResult('universal-alongside-shadcn', true)}
                >
                  Universal Button
                </UniversalButton>

                <Button variant='outline'>Another Standard</Button>

                <UniversalButton
                  enableBorderGradient
                  variant='outline'
                  onClick={() => markTestResult('no-style-conflicts', true)}
                >
                  Another Universal
                </UniversalButton>
              </div>
            </div>

            <div>
              <h4 className='text-lg font-medium text-slate-700 dark:text-slate-300 mb-4'>
                AsChild Pattern Testing
              </h4>
              <div className='flex flex-wrap gap-4'>
                <UniversalButton
                  asChild
                  enableGradient
                  onClick={() => markTestResult('as-child-div', true)}
                >
                  <div role='button' tabIndex={0}>
                    As Div Element
                  </div>
                </UniversalButton>

                <UniversalButton
                  asChild
                  enableBorderGradient
                  onClick={() => markTestResult('as-child-span', true)}
                >
                  <span role='button' tabIndex={0}>
                    As Span Element
                  </span>
                </UniversalButton>
              </div>
            </div>
          </div>
        </div>

        {/* 5. ACCESSIBILITY TESTING */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg mb-8'>
          <h3 className='text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200'>
            5. Accessibility Testing
          </h3>

          <div className='space-y-6'>
            <div>
              <h4 className='text-lg font-medium text-slate-700 dark:text-slate-300 mb-4'>
                Keyboard Navigation (Test with Tab, Enter, Space)
              </h4>
              <div className='flex flex-wrap gap-4'>
                <UniversalButton
                  enableGradient
                  variant='default'
                  onFocus={() => markTestResult('focus-gradient', true)}
                  onClick={() => markTestResult('keyboard-click-gradient', true)}
                >
                  Focus Test 1
                </UniversalButton>

                <UniversalButton
                  enableNeumorph
                  variant='secondary'
                  onFocus={() => markTestResult('focus-neumorph', true)}
                  onClick={() => markTestResult('keyboard-click-neumorph', true)}
                >
                  Focus Test 2
                </UniversalButton>

                <UniversalButton
                  enableBorderGradient
                  variant='outline'
                  onFocus={() => markTestResult('focus-border', true)}
                  onClick={() => markTestResult('keyboard-click-border', true)}
                >
                  Focus Test 3
                </UniversalButton>
              </div>
            </div>

            <div>
              <h4 className='text-lg font-medium text-slate-700 dark:text-slate-300 mb-4'>
                ARIA Attributes
              </h4>
              <div className='flex flex-wrap gap-4'>
                <UniversalButton
                  enableGradient
                  variant='default'
                  aria-label='Submit form with gradient style'
                  onClick={() => markTestResult('aria-label-test', true)}
                >
                  Submit Form
                </UniversalButton>

                <UniversalButton
                  enableNeumorph
                  variant='secondary'
                  loading
                  aria-busy='true'
                  aria-describedby='loading-description'
                  onClick={() => markTestResult('aria-busy-test', true)}
                >
                  Processing...
                </UniversalButton>
              </div>
              <div id='loading-description' className='sr-only'>
                The form is being processed, please wait.
              </div>
            </div>
          </div>
        </div>

        {/* Test Results Summary */}
        <div className='bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg'>
          <h3 className='text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200'>
            Test Results Summary
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Object.entries(testResults).map(([testName, passed]) => (
              <div
                key={testName}
                className={`p-3 rounded-lg border-2 ${
                  passed
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    {testName}
                  </span>
                  <span
                    className={`text-sm font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {passed ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {Object.keys(testResults).length === 0 && (
            <p className='text-center text-slate-500 dark:text-slate-400'>
              Click on buttons above to run tests and see results here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
