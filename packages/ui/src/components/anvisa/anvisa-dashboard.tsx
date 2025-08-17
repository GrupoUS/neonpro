// Placeholder imports
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Simple Alert component
const Alert = ({ children, className, ...props }: any) => (
  <div className={cn('rounded border p-4', className)} {...props}>
    {children}
  </div>
);

const AlertDescription = ({ children, className, ...props }: any) => (
  <div className={cn('text-sm', className)} {...props}>
    {children}
  </div>
);

// Simple Badge component
const Badge = ({ children, variant = 'default', className, ...props }: any) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs',
      className
    )}
    {...props}
  >
    {children}
  </span>
);

// Simple Button component
const Button = ({ children, variant = 'default', size = 'default', className, ...props }: any) => (
  <button className={cn('rounded px-4 py-2 font-medium', className)} {...props}>
    {children}
  </button>
);

// Simple Card components
const Card = ({ children, className, ...props }: any) => (
  <div className={cn('rounded-lg border shadow-sm', className)} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className, ...props }: any) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

const CardDescription = ({ children, className, ...props }: any) => (
  <p className={cn('text-gray-600 text-sm', className)} {...props}>
    {children}
  </p>
);

const CardHeader = ({ children, className, ...props }: any) => (
  <div className={cn('p-6 pb-0', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }: any) => (
  <h3 className={cn('font-semibold text-lg', className)} {...props}>
    {children}
  </h3>
);

// Simple Tabs components
const Tabs = ({ children, defaultValue, className, ...props }: any) => (
  <div className={cn('w-full', className)} {...props}>
    {children}
  </div>
);

const TabsContent = ({ children, value, className, ...props }: any) => (
  <div className={cn('mt-2', className)} {...props}>
    {children}
  </div>
);

const TabsList = ({ children, className, ...props }: any) => (
  <div
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const TabsTrigger = ({ children, value, className, ...props }: any) => (
  <button
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 font-medium text-sm',
      className
    )}
    {...props}
  >
    {children}
  </button>
);

// Mock utility function
const _formatDate = (date: string) => new Date(date).toLocaleDateString();

type AnvisaDashboardProps = {
  className?: string;
};

export function AnvisaDashboard({ className }: AnvisaDashboardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h1 className="font-bold text-3xl">ANVISA Compliance Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor compliance status with ANVISA regulations for medical devices and software.
        </p>
      </div>

      <Tabs className="space-y-4" defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Medical Devices</TabsTrigger>
          <TabsTrigger value="software">Software (SAMD)</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">Registered Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">12</div>
                <p className="text-muted-foreground text-xs">+2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">98%</div>
                <p className="text-muted-foreground text-xs">All requirements met</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">3</div>
                <p className="text-muted-foreground text-xs">Requires attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">Next Audit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">45d</div>
                <p className="text-muted-foreground text-xs">Days remaining</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest compliance activities and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Device Registration</Badge>
                  <span className="text-sm">Updated device specifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Documentation</Badge>
                  <span className="text-sm">Submitted technical documentation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Quality Assurance</Badge>
                  <span className="text-sm">Completed quality review</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Alerts</CardTitle>
                <CardDescription>Important notifications and deadlines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertDescription>
                    Device XYZ-123 requires documentation update by next month.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertDescription>Annual compliance report is due in 2 weeks.</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-4" value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Registered Medical Devices</CardTitle>
              <CardDescription>Overview of all registered devices with ANVISA</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Device registration details would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="software">
          <Card>
            <CardHeader>
              <CardTitle>Software as Medical Device (SAMD)</CardTitle>
              <CardDescription>SAMD classification and compliance status</CardDescription>
            </CardHeader>
            <CardContent>
              <p>SAMD compliance information would be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Generate and download compliance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Generate Report</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
