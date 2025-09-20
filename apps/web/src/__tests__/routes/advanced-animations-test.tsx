import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@neonpro/ui';
import { UniversalButton } from '@neonpro/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui';
import { createFileRoute } from '@tanstack/react-router';
import { PauseCircle, PlayCircle, RotateCcw, Settings, Sparkles, Zap } from 'lucide-react';
import React, { useState } from 'react';

function AdvancedAnimationsTest() {
  // Test configuration state
  const [config, setConfig] = useState({
    // Hover Border Gradient settings
    hoverBorderEnabled: true,
    hoverBorderIntensity: 'normal' as 'subtle' | 'normal' | 'vibrant',
    hoverBorderDirection: 'radial' as
      | 'left-right'
      | 'top-bottom'
      | 'diagonal-tl-br'
      | 'diagonal-tr-bl'
      | 'radial',
    hoverBorderTheme: 'blue' as
      | 'gold'
      | 'silver'
      | 'copper'
      | 'blue'
      | 'purple'
      | 'green'
      | 'red',
    hoverBorderSpeed: 'normal' as 'slow' | 'normal' | 'fast',
    hoverBorderWidth: 2,

    // Shine Border settings
    shineBorderEnabled: true,
    shineBorderPattern: 'linear' as
      | 'linear'
      | 'orbital'
      | 'pulse'
      | 'wave'
      | 'spiral',
    shineBorderIntensity: 'normal' as 'subtle' | 'normal' | 'vibrant',
    shineBorderTheme: 'blue' as
      | 'gold'
      | 'silver'
      | 'copper'
      | 'blue'
      | 'purple'
      | 'green'
      | 'red',
    shineBorderSpeed: 'normal' as 'slow' | 'normal' | 'fast',
    shineBorderWidth: 2,
    shineBorderDuration: 2000,
    shineBorderAutoStart: true,
    shineBorderHoverOnly: false,
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 0,
    lastFrameTime: 0,
    animationCount: 0,
  });

  // Performance monitoring
  React.useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        setPerformanceMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime)),
          lastFrameTime: currentTime - lastTime,
        }));
        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measurePerformance);
    };

    animationFrameId = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Helper function to create animation props
  const createAnimationProps = () => ({
    hoverBorderGradient: config.hoverBorderEnabled
      ? {
        enabled: true,
        intensity: config.hoverBorderIntensity,
        direction: config.hoverBorderDirection,
        theme: config.hoverBorderTheme,
        speed: config.hoverBorderSpeed,
        borderWidth: config.hoverBorderWidth,
      }
      : undefined,
    shineBorder: config.shineBorderEnabled
      ? {
        enabled: true,
        pattern: config.shineBorderPattern,
        intensity: config.shineBorderIntensity,
        theme: config.shineBorderTheme,
        speed: config.shineBorderSpeed,
        borderWidth: config.shineBorderWidth,
        duration: config.shineBorderDuration,
        autoStart: config.shineBorderAutoStart,
        hoverOnly: config.shineBorderHoverOnly,
      }
      : undefined,
  });

  return (
    <div className='min-h-full h-full bg-background p-8'>
      <div className='mx-auto max-w-7xl space-y-8'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <h1 className='text-4xl font-bold tracking-tight'>
            Advanced Animation System Test
          </h1>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Comprehensive testing environment for hover border gradient and enhanced shine border
            animations. Featuring 60fps performance monitoring, GPU acceleration, and accessibility
            compliance.
          </p>

          {/* Performance Metrics */}
          <div className='flex justify-center gap-6 text-sm'>
            <Badge variant='outline' className='font-mono'>
              FPS: {performanceMetrics.fps}
            </Badge>
            <Badge variant='outline' className='font-mono'>
              Frame Time: {performanceMetrics.lastFrameTime.toFixed(1)}ms
            </Badge>
            <Badge
              variant={performanceMetrics.fps >= 60
                ? 'default'
                : performanceMetrics.fps >= 30
                ? 'secondary'
                : 'destructive'}
            >
              {performanceMetrics.fps >= 60
                ? 'Excellent'
                : performanceMetrics.fps >= 30
                ? 'Good'
                : 'Poor'} Performance
            </Badge>
          </div>
        </div>

        <Separator />

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Control Panel */}
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Settings className='h-5 w-5' />
                  Animation Controls
                </CardTitle>
                <CardDescription>
                  Adjust animation parameters and test different configurations
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Hover Border Gradient Controls */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Zap className='h-4 w-4 text-blue-500' />
                    <Label className='text-sm font-medium'>
                      Hover Border Gradient
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Switch
                      checked={config.hoverBorderEnabled}
                      onCheckedChange={checked =>
                        setConfig(prev => ({
                          ...prev,
                          hoverBorderEnabled: checked,
                        }))}
                    />
                    <Label>Enable Animation</Label>
                  </div>

                  {config.hoverBorderEnabled && (
                    <div className='space-y-3 pl-4 border-l-2 border-blue-500/20'>
                      <div>
                        <Label className='text-xs'>Intensity</Label>
                        <Select
                          value={config.hoverBorderIntensity}
                          onValueChange={(value: any) =>
                            setConfig(prev => ({
                              ...prev,
                              hoverBorderIntensity: value,
                            }))}
                        >
                          <SelectTrigger className='h-8'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='subtle'>Subtle</SelectItem>
                            <SelectItem value='normal'>Normal</SelectItem>
                            <SelectItem value='vibrant'>Vibrant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className='text-xs'>Direction</Label>
                        <Select
                          value={config.hoverBorderDirection}
                          onValueChange={(value: any) =>
                            setConfig(prev => ({
                              ...prev,
                              hoverBorderDirection: value,
                            }))}
                        >
                          <SelectTrigger className='h-8'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='radial'>Radial</SelectItem>
                            <SelectItem value='left-right'>
                              Left to Right
                            </SelectItem>
                            <SelectItem value='top-bottom'>
                              Top to Bottom
                            </SelectItem>
                            <SelectItem value='diagonal-tl-br'>
                              Diagonal TL-BR
                            </SelectItem>
                            <SelectItem value='diagonal-tr-bl'>
                              Diagonal TR-BL
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className='text-xs'>Theme</Label>
                        <Select
                          value={config.hoverBorderTheme}
                          onValueChange={(value: any) =>
                            setConfig(prev => ({
                              ...prev,
                              hoverBorderTheme: value,
                            }))}
                        >
                          <SelectTrigger className='h-8'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='gold'>Gold</SelectItem>
                            <SelectItem value='silver'>Silver</SelectItem>
                            <SelectItem value='copper'>Copper</SelectItem>
                            <SelectItem value='blue'>Blue</SelectItem>
                            <SelectItem value='purple'>Purple</SelectItem>
                            <SelectItem value='green'>Green</SelectItem>
                            <SelectItem value='red'>Red</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className='text-xs'>Speed</Label>
                        <Select
                          value={config.hoverBorderSpeed}
                          onValueChange={(value: any) =>
                            setConfig(prev => ({
                              ...prev,
                              hoverBorderSpeed: value,
                            }))}
                        >
                          <SelectTrigger className='h-8'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='slow'>Slow</SelectItem>
                            <SelectItem value='normal'>Normal</SelectItem>
                            <SelectItem value='fast'>Fast</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className='text-xs'>
                          Border Width: {config.hoverBorderWidth}px
                        </Label>
                        <Slider
                          value={[config.hoverBorderWidth]}
                          onValueChange={([value]) =>
                            setConfig(prev => ({
                              ...prev,
                              hoverBorderWidth: value,
                            }))}
                          max={5}
                          min={1}
                          step={1}
                          className='mt-2'
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Shine Border Controls */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Sparkles className='h-4 w-4 text-purple-500' />
                    <Label className='text-sm font-medium'>
                      Enhanced Shine Border
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Switch
                      checked={config.shineBorderEnabled}
                      onCheckedChange={checked =>
                        setConfig(prev => ({
                          ...prev,
                          shineBorderEnabled: checked,
                        }))}
                    />
                    <Label>Enable Animation</Label>
                  </div>

                  {config.shineBorderEnabled && (
                    <div className='space-y-3 pl-4 border-l-2 border-purple-500/20'>
                      <div>
                        <Label className='text-xs'>Pattern</Label>
                        <Select
                          value={config.shineBorderPattern}
                          onValueChange={(value: any) =>
                            setConfig(prev => ({
                              ...prev,
                              shineBorderPattern: value,
                            }))}
                        >
                          <SelectTrigger className='h-8'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='linear'>Linear</SelectItem>
                            <SelectItem value='orbital'>Orbital</SelectItem>
                            <SelectItem value='pulse'>Pulse</SelectItem>
                            <SelectItem value='wave'>Wave</SelectItem>
                            <SelectItem value='spiral'>Spiral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className='text-xs'>
                          Duration: {config.shineBorderDuration}ms
                        </Label>
                        <Slider
                          value={[config.shineBorderDuration]}
                          onValueChange={([value]) =>
                            setConfig(prev => ({
                              ...prev,
                              shineBorderDuration: value,
                            }))}
                          max={5000}
                          min={500}
                          step={100}
                          className='mt-2'
                        />
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Switch
                          checked={config.shineBorderAutoStart}
                          onCheckedChange={checked =>
                            setConfig(prev => ({
                              ...prev,
                              shineBorderAutoStart: checked,
                            }))}
                        />
                        <Label className='text-xs'>Auto Start</Label>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Switch
                          checked={config.shineBorderHoverOnly}
                          onCheckedChange={checked =>
                            setConfig(prev => ({
                              ...prev,
                              shineBorderHoverOnly: checked,
                            }))}
                        />
                        <Label className='text-xs'>Hover Only</Label>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Test Components Section */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Button Tests */}
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h2 className='text-2xl font-semibold'>
                  Universal Button Tests
                </h2>
                <p className='text-muted-foreground'>
                  Test various button variants with advanced animations
                </p>
              </div>

              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {/* Default Variant */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Default</Label>
                  <UniversalButton
                    animations={createAnimationProps()}
                    className='w-full'
                  >
                    <Zap className='h-4 w-4' />
                    Hover Me
                  </UniversalButton>
                </div>

                {/* Destructive Variant */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Destructive</Label>
                  <UniversalButton
                    variant='destructive'
                    animations={createAnimationProps()}
                    className='w-full'
                  >
                    <Sparkles className='h-4 w-4' />
                    Delete
                  </UniversalButton>
                </div>

                {/* Outline Variant */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Outline</Label>
                  <UniversalButton
                    variant='outline'
                    animations={createAnimationProps()}
                    className='w-full'
                  >
                    <Settings className='h-4 w-4' />
                    Configure
                  </UniversalButton>
                </div>

                {/* Secondary Variant */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Secondary</Label>
                  <UniversalButton
                    variant='secondary'
                    animations={createAnimationProps()}
                    className='w-full'
                  >
                    <PlayCircle className='h-4 w-4' />
                    Start
                  </UniversalButton>
                </div>

                {/* Ghost Variant */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Ghost</Label>
                  <UniversalButton
                    variant='ghost'
                    animations={createAnimationProps()}
                    className='w-full'
                  >
                    <PauseCircle className='h-4 w-4' />
                    Pause
                  </UniversalButton>
                </div>

                {/* Link Variant */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Link</Label>
                  <UniversalButton
                    variant='link'
                    animations={createAnimationProps()}
                    className='w-full'
                  >
                    Learn More
                  </UniversalButton>
                </div>
              </div>

              {/* Size Variants */}
              <div className='space-y-4'>
                <Label className='text-lg font-medium'>Size Variants</Label>
                <div className='flex flex-wrap items-center gap-4'>
                  <UniversalButton
                    size='sm'
                    animations={createAnimationProps()}
                  >
                    Small
                  </UniversalButton>
                  <UniversalButton animations={createAnimationProps()}>
                    Default
                  </UniversalButton>
                  <UniversalButton
                    size='lg'
                    animations={createAnimationProps()}
                  >
                    Large
                  </UniversalButton>
                  <UniversalButton
                    size='icon'
                    animations={createAnimationProps()}
                  >
                    <RotateCcw className='h-4 w-4' />
                  </UniversalButton>
                </div>
              </div>
            </div>

            <Separator />

            {/* Card Tests */}
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h2 className='text-2xl font-semibold'>Card Tests</h2>
                <p className='text-muted-foreground'>
                  Test cards with advanced border animations
                </p>
              </div>

              <div className='grid sm:grid-cols-2 gap-6'>
                {/* Basic Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Zap className='h-5 w-5 text-blue-500' />
                      Hover Border Gradient
                    </CardTitle>
                    <CardDescription>
                      This card demonstrates the hover border gradient animation inspired by
                      AceternityUI. Move your mouse over the card to see the effect.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='text-sm text-muted-foreground'>
                        Current Configuration:
                      </div>
                      <ul className='text-xs space-y-1 text-muted-foreground'>
                        <li>• Intensity: {config.hoverBorderIntensity}</li>
                        <li>• Direction: {config.hoverBorderDirection}</li>
                        <li>• Theme: {config.hoverBorderTheme}</li>
                        <li>• Speed: {config.hoverBorderSpeed}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Shine Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Sparkles className='h-5 w-5 text-purple-500' />
                      Enhanced Shine Border
                    </CardTitle>
                    <CardDescription>
                      This card showcases the enhanced shine border animation inspired by MagicUI.
                      Watch the animated border patterns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='text-sm text-muted-foreground'>
                        Current Configuration:
                      </div>
                      <ul className='text-xs space-y-1 text-muted-foreground'>
                        <li>• Pattern: {config.shineBorderPattern}</li>
                        <li>• Intensity: {config.shineBorderIntensity}</li>
                        <li>• Theme: {config.shineBorderTheme}</li>
                        <li>• Duration: {config.shineBorderDuration}ms</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Combined Effects Card */}
                <Card className='sm:col-span-2'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <div className='flex items-center gap-1'>
                        <Zap className='h-4 w-4 text-yellow-500' />
                        <Sparkles className='h-4 w-4 text-purple-500' />
                      </div>
                      Combined Effects Showcase
                    </CardTitle>
                    <CardDescription>
                      This card combines both animation types with premium settings for the ultimate
                      visual experience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid sm:grid-cols-2 gap-4'>
                      <div>
                        <Label className='text-sm font-medium text-yellow-600'>
                          Hover Border Gradient
                        </Label>
                        <ul className='text-xs space-y-1 text-muted-foreground mt-2'>
                          <li>• Intensity: Vibrant</li>
                          <li>• Direction: Radial</li>
                          <li>• Theme: Gold</li>
                          <li>• Speed: Fast</li>
                        </ul>
                      </div>
                      <div>
                        <Label className='text-sm font-medium text-purple-600'>
                          Enhanced Shine Border
                        </Label>
                        <ul className='text-xs space-y-1 text-muted-foreground mt-2'>
                          <li>• Pattern: Orbital</li>
                          <li>• Intensity: Vibrant</li>
                          <li>• Theme: Purple</li>
                          <li>• Trigger: Hover Only</li>
                        </ul>
                      </div>
                    </div>

                    <div className='mt-4 p-4 bg-muted/50 rounded-lg'>
                      <div className='text-sm font-medium mb-2'>
                        Performance Notes
                      </div>
                      <div className='text-xs text-muted-foreground space-y-1'>
                        <div>
                          • GPU-accelerated transforms ensure 60fps performance
                        </div>
                        <div>
                          • Respects prefers-reduced-motion accessibility setting
                        </div>
                        <div>
                          • Adaptive performance based on device capabilities
                        </div>
                        <div>• Optimized for cross-browser compatibility</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Performance Tips */}
            <div className='mt-8 p-6 bg-muted/50 rounded-lg'>
              <h3 className='text-lg font-medium mb-3'>
                Performance & Accessibility Features
              </h3>
              <div className='grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground'>
                <div className='space-y-2'>
                  <div className='font-medium text-foreground'>
                    Performance Optimizations
                  </div>
                  <ul className='space-y-1'>
                    <li>• GPU acceleration with translateZ(0)</li>
                    <li>• RequestAnimationFrame optimization</li>
                    <li>• Debounced mouse tracking</li>
                    <li>• Device capability detection</li>
                    <li>• Automatic performance scaling</li>
                  </ul>
                </div>
                <div className='space-y-2'>
                  <div className='font-medium text-foreground'>
                    Accessibility Compliance
                  </div>
                  <ul className='space-y-1'>
                    <li>• Respects prefers-reduced-motion</li>
                    <li>• Keyboard navigation support</li>
                    <li>• Focus management</li>
                    <li>• Screen reader compatibility</li>
                    <li>• High contrast mode support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/__tests/advanced-animations-test')({
  component: AdvancedAnimationsTest,
});
