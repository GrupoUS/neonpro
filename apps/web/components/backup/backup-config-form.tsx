'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  Clock,
  Database,
  HardDrive,
  Info,
  Save,
  Settings,
  Shield,
  TestTube,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Validation schema
const backupConfigSchema = z.object({
  // Basic Configuration
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  enabled: z.boolean().default(true),

  // Backup Type & Source
  type: z.enum(['FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'DATABASE', 'FILES']),
  source_type: z.enum(['DATABASE', 'DIRECTORY', 'FILES']),
  source_config: z.object({
    database_url: z.string().optional(),
    directory_path: z.string().optional(),
    file_patterns: z.array(z.string()).optional(),
    exclude_patterns: z.array(z.string()).optional(),
  }),

  // Schedule Configuration
  schedule_frequency: z.enum([
    'HOURLY',
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'CUSTOM',
  ]),
  schedule_config: z.object({
    cron_expression: z.string().optional(),
    time_of_day: z.string().optional(),
    day_of_week: z.number().optional(),
    day_of_month: z.number().optional(),
    timezone: z.string().default('UTC'),
  }),

  // Storage Configuration
  storage_provider: z.enum(['LOCAL', 'S3', 'GCS', 'AZURE']),
  storage_config: z.object({
    // Local
    local_path: z.string().optional(),

    // AWS S3
    s3_bucket: z.string().optional(),
    s3_region: z.string().optional(),
    s3_access_key: z.string().optional(),
    s3_secret_key: z.string().optional(),

    // Google Cloud
    gcs_bucket: z.string().optional(),
    gcs_project_id: z.string().optional(),
    gcs_key_file: z.string().optional(),

    // Azure
    azure_container: z.string().optional(),
    azure_account: z.string().optional(),
    azure_key: z.string().optional(),
  }),

  // Retention Policy
  retention_policy: z.object({
    daily: z.number().min(1).max(365).default(7),
    weekly: z.number().min(0).max(52).default(4),
    monthly: z.number().min(0).max(12).default(3),
    yearly: z.number().min(0).max(10).default(1),
  }),

  // Compression & Encryption
  compression_enabled: z.boolean().default(true),
  compression_level: z.number().min(1).max(9).default(6),
  encryption_enabled: z.boolean().default(true),
  encryption_key: z.string().optional(),

  // Notifications
  notification_config: z.object({
    on_success: z.boolean().default(false),
    on_failure: z.boolean().default(true),
    email_recipients: z.array(z.string().email()).optional(),
    webhook_url: z.string().url().optional(),
  }),

  // Advanced Options
  parallel_uploads: z.number().min(1).max(10).default(3),
  chunk_size_mb: z.number().min(1).max(1024).default(64),
  verify_integrity: z.boolean().default(true),
  test_restore: z.boolean().default(false),
});

type BackupConfigFormData = z.infer<typeof backupConfigSchema>;

type BackupConfigFormProps = {
  initialData?: Partial<BackupConfigFormData>;
  onSubmit: (data: BackupConfigFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
};

const BackupConfigForm: React.FC<BackupConfigFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testConnection, setTestConnection] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<BackupConfigFormData>({
    resolver: zodResolver(backupConfigSchema),
    defaultValues: {
      enabled: true,
      type: 'FULL',
      source_type: 'DATABASE',
      schedule_frequency: 'DAILY',
      storage_provider: 'LOCAL',
      compression_enabled: true,
      compression_level: 6,
      encryption_enabled: true,
      parallel_uploads: 3,
      chunk_size_mb: 64,
      verify_integrity: true,
      test_restore: false,
      source_config: {},
      schedule_config: {
        timezone: 'UTC',
      },
      storage_config: {},
      retention_policy: {
        daily: 7,
        weekly: 4,
        monthly: 3,
        yearly: 1,
      },
      notification_config: {
        on_success: false,
        on_failure: true,
      },
      ...initialData,
    },
  });

  const watchedValues = form.watch();

  // Handle form submission
  const handleSubmit = async (data: BackupConfigFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (_error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test storage connection
  const handleTestConnection = async () => {
    setTestConnection('testing');
    try {
      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setTestConnection('success');
      setTimeout(() => setTestConnection('idle'), 3000);
    } catch (_error) {
      setTestConnection('error');
      setTimeout(() => setTestConnection('idle'), 3000);
    }
  };

  // Generate cron expression based on frequency
  const generateCronExpression = (frequency: string, config: any) => {
    switch (frequency) {
      case 'HOURLY':
        return '0 * * * *';
      case 'DAILY': {
        const hour = config.time_of_day
          ? new Date(`2000-01-01T${config.time_of_day}`).getHours()
          : 2;
        return `0 ${hour} * * *`;
      }
      case 'WEEKLY': {
        const weekHour = config.time_of_day
          ? new Date(`2000-01-01T${config.time_of_day}`).getHours()
          : 2;
        const dayOfWeek = config.day_of_week || 0;
        return `0 ${weekHour} * * ${dayOfWeek}`;
      }
      case 'MONTHLY': {
        const monthHour = config.time_of_day
          ? new Date(`2000-01-01T${config.time_of_day}`).getHours()
          : 2;
        const dayOfMonth = config.day_of_month || 1;
        return `0 ${monthHour} ${dayOfMonth} * *`;
      }
      default:
        return config.cron_expression || '0 2 * * *';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">
            {isEditing
              ? 'Edit Backup Configuration'
              : 'Create Backup Configuration'}
          </h2>
          <p className="text-muted-foreground">
            Configure your backup settings and schedule
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={form.handleSubmit(handleSubmit)}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <Tabs
            className="space-y-4"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="source">Source</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="retention">Retention</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Configuration */}
            <TabsContent className="space-y-4" value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Basic Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Configure the basic settings for your backup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Backup Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="My Database Backup"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A unique name for this backup configuration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Backup Type</FormLabel>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select backup type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FULL">Full Backup</SelectItem>
                              <SelectItem value="INCREMENTAL">
                                Incremental
                              </SelectItem>
                              <SelectItem value="DIFFERENTIAL">
                                Differential
                              </SelectItem>
                              <SelectItem value="DATABASE">
                                Database Only
                              </SelectItem>
                              <SelectItem value="FILES">Files Only</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Type of backup to perform
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this backup includes..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional description of this backup configuration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable Backup
                          </FormLabel>
                          <FormDescription>
                            Whether this backup configuration is active
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Source Configuration */}
            <TabsContent className="space-y-4" value="source">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Source Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Configure what data to backup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="source_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source Type</FormLabel>
                        <Select
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DATABASE">Database</SelectItem>
                            <SelectItem value="DIRECTORY">Directory</SelectItem>
                            <SelectItem value="FILES">
                              Specific Files
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          What type of data source to backup
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedValues.source_type === 'DATABASE' && (
                    <FormField
                      control={form.control}
                      name="source_config.database_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="postgresql://user:pass@host:port/db"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Connection string for the database
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchedValues.source_type === 'DIRECTORY' && (
                    <FormField
                      control={form.control}
                      name="source_config.directory_path"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Directory Path</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="/path/to/directory"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Path to the directory to backup
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Accordion collapsible type="single">
                    <AccordionItem value="patterns">
                      <AccordionTrigger>
                        File Patterns (Optional)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <FormLabel>Include Patterns</FormLabel>
                            <Textarea
                              className="mt-2"
                              placeholder="*.sql\n*.json\n*.txt"
                            />
                            <FormDescription>
                              File patterns to include (one per line)
                            </FormDescription>
                          </div>
                          <div>
                            <FormLabel>Exclude Patterns</FormLabel>
                            <Textarea
                              className="mt-2"
                              placeholder="*.log\n*.tmp\n*.cache"
                            />
                            <FormDescription>
                              File patterns to exclude (one per line)
                            </FormDescription>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Configuration */}
            <TabsContent className="space-y-4" value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Schedule Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Configure when backups should run
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="schedule_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HOURLY">Hourly</SelectItem>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="CUSTOM">
                              Custom (Cron)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedValues.schedule_frequency !== 'HOURLY' &&
                    watchedValues.schedule_frequency !== 'CUSTOM' && (
                      <FormField
                        control={form.control}
                        name="schedule_config.time_of_day"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time of Day</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormDescription>
                              What time to run the backup
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                  {watchedValues.schedule_frequency === 'WEEKLY' && (
                    <FormField
                      control={form.control}
                      name="schedule_config.day_of_week"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day of Week</FormLabel>
                          <Select
                            defaultValue={field.value?.toString()}
                            onValueChange={(value) =>
                              field.onChange(Number.parseInt(value, 10))
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Sunday</SelectItem>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchedValues.schedule_frequency === 'MONTHLY' && (
                    <FormField
                      control={form.control}
                      name="schedule_config.day_of_month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day of Month</FormLabel>
                          <FormControl>
                            <Input
                              max="31"
                              min="1"
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseInt(e.target.value, 10),
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Which day of the month (1-31)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchedValues.schedule_frequency === 'CUSTOM' && (
                    <FormField
                      control={form.control}
                      name="schedule_config.cron_expression"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cron Expression</FormLabel>
                          <FormControl>
                            <Input placeholder="0 2 * * *" {...field} />
                          </FormControl>
                          <FormDescription>
                            Custom cron expression (minute hour day month
                            weekday)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="schedule_config.timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">
                              Eastern Time
                            </SelectItem>
                            <SelectItem value="America/Chicago">
                              Central Time
                            </SelectItem>
                            <SelectItem value="America/Denver">
                              Mountain Time
                            </SelectItem>
                            <SelectItem value="America/Los_Angeles">
                              Pacific Time
                            </SelectItem>
                            <SelectItem value="Europe/London">
                              London
                            </SelectItem>
                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preview */}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Schedule Preview:</strong>{' '}
                      {generateCronExpression(
                        watchedValues.schedule_frequency,
                        watchedValues.schedule_config,
                      )}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Storage Configuration */}
            <TabsContent className="space-y-4" value="storage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HardDrive className="h-5 w-5" />
                    <span>Storage Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Configure where backups are stored
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="storage_provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Provider</FormLabel>
                        <Select
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select storage provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOCAL">Local Storage</SelectItem>
                            <SelectItem value="S3">Amazon S3</SelectItem>
                            <SelectItem value="GCS">
                              Google Cloud Storage
                            </SelectItem>
                            <SelectItem value="AZURE">
                              Azure Blob Storage
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Local Storage */}
                  {watchedValues.storage_provider === 'LOCAL' && (
                    <FormField
                      control={form.control}
                      name="storage_config.local_path"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local Path</FormLabel>
                          <FormControl>
                            <Input placeholder="/path/to/backups" {...field} />
                          </FormControl>
                          <FormDescription>
                            Directory where backups will be stored
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* AWS S3 */}
                  {watchedValues.storage_provider === 'S3' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="storage_config.s3_bucket"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>S3 Bucket</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="my-backup-bucket"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="storage_config.s3_region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Region</FormLabel>
                              <FormControl>
                                <Input placeholder="us-east-1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="storage_config.s3_access_key"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Key</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="AKIA..."
                                  type="password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="storage_config.s3_secret_key"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secret Key</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Secret key"
                                  type="password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Google Cloud Storage */}
                  {watchedValues.storage_provider === 'GCS' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="storage_config.gcs_bucket"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GCS Bucket</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="my-backup-bucket"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="storage_config.gcs_project_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project ID</FormLabel>
                              <FormControl>
                                <Input placeholder="my-project-id" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="storage_config.gcs_key_file"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Account Key File</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="/path/to/service-account.json"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Azure Blob Storage */}
                  {watchedValues.storage_provider === 'AZURE' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="storage_config.azure_container"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Container</FormLabel>
                              <FormControl>
                                <Input placeholder="backups" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="storage_config.azure_account"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Storage Account</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="mystorageaccount"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="storage_config.azure_key"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Key</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Storage account key"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Test Connection */}
                  <div className="flex items-center space-x-2">
                    <Button
                      disabled={testConnection === 'testing'}
                      onClick={handleTestConnection}
                      type="button"
                      variant="outline"
                    >
                      <TestTube className="mr-2 h-4 w-4" />
                      {testConnection === 'testing'
                        ? 'Testing...'
                        : 'Test Connection'}
                    </Button>
                    {testConnection === 'success' && (
                      <Badge className="bg-green-500" variant="default">
                        Connection successful
                      </Badge>
                    )}
                    {testConnection === 'error' && (
                      <Badge variant="destructive">Connection failed</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Retention Policy */}
            <TabsContent className="space-y-4" value="retention">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Retention Policy</span>
                  </CardTitle>
                  <CardDescription>
                    Configure how long to keep backups
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="retention_policy.daily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Backups</FormLabel>
                          <FormControl>
                            <Input
                              max="365"
                              min="1"
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseInt(e.target.value, 10),
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Keep daily backups for this many days
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="retention_policy.weekly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekly Backups</FormLabel>
                          <FormControl>
                            <Input
                              max="52"
                              min="0"
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseInt(e.target.value, 10),
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Keep weekly backups for this many weeks
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="retention_policy.monthly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Backups</FormLabel>
                          <FormControl>
                            <Input
                              max="12"
                              min="0"
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseInt(e.target.value, 10),
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Keep monthly backups for this many months
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="retention_policy.yearly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yearly Backups</FormLabel>
                          <FormControl>
                            <Input
                              max="10"
                              min="0"
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseInt(e.target.value, 10),
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Keep yearly backups for this many years
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Options */}
            <TabsContent className="space-y-4" value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Advanced Options</span>
                  </CardTitle>
                  <CardDescription>
                    Configure advanced backup settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Compression & Encryption */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">
                      Compression & Encryption
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="compression_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Enable Compression
                              </FormLabel>
                              <FormDescription>
                                Compress backups to save space
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="encryption_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Enable Encryption
                              </FormLabel>
                              <FormDescription>
                                Encrypt backups for security
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    {watchedValues.compression_enabled && (
                      <FormField
                        control={form.control}
                        name="compression_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Compression Level (1-9)</FormLabel>
                            <FormControl>
                              <Input
                                max="9"
                                min="1"
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number.parseInt(e.target.value, 10),
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Higher levels = better compression but slower
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {watchedValues.encryption_enabled && (
                      <FormField
                        control={form.control}
                        name="encryption_key"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Encryption Key</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter encryption key"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Strong encryption key for backup security
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Performance */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Performance</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parallel_uploads"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parallel Uploads</FormLabel>
                            <FormControl>
                              <Input
                                max="10"
                                min="1"
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number.parseInt(e.target.value, 10),
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Number of parallel upload threads
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="chunk_size_mb"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chunk Size (MB)</FormLabel>
                            <FormControl>
                              <Input
                                max="1024"
                                min="1"
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number.parseInt(e.target.value, 10),
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Size of upload chunks in megabytes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Verification */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Verification</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="verify_integrity"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Verify Integrity
                              </FormLabel>
                              <FormDescription>
                                Verify backup integrity after creation
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="test_restore"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Test Restore
                              </FormLabel>
                              <FormDescription>
                                Perform test restore to verify backup
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Notifications</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="notification_config.on_success"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Notify on Success
                              </FormLabel>
                              <FormDescription>
                                Send notification when backup succeeds
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notification_config.on_failure"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Notify on Failure
                              </FormLabel>
                              <FormDescription>
                                Send notification when backup fails
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default BackupConfigForm;
