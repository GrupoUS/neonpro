import { expect, test } from '@playwright/test'

test.describe('Aesthetic Treatment Planning Flows @clinic @treatment', () => {
  test.beforeEach(async ({ page }) => {
    // Login as professional before each test
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'professional@clinic.com')
    await page.fill('input[type="password"]', 'securePassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard/professional')
  })

  test.describe('Treatment Planning Interface @professional', () => {
    test('should show treatment planning dashboard @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')

      await expect(page.locator('text=Treatment Planning')).toBeVisible()
      await expect(page.locator('text=Patient Assessment')).toBeVisible()
      await expect(page.locator('text=Aesthetic Goals')).toBeVisible()
      await expect(page.locator('text=Treatment Options')).toBeVisible()
      await expect(page.locator('text=Cost Estimation')).toBeVisible()
      await expect(page.locator('text=Before/After Photos')).toBeVisible()
    })

    test('should create new treatment plan @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Create New Plan')

      // Fill treatment plan form
      await page.fill('input[name="patientName"]', 'Jane Smith')
      await page.fill('input[name="treatmentType"]', 'Botox Treatment')
      await page.fill(
        'textarea[name="assessment"]',
        'Patient shows fine lines and wrinkles in forehead area',
      )
      await page.fill(
        'textarea[name="goals"]',
        'Reduce appearance of wrinkles, achieve natural look',
      )

      await page.click('button[type="submit"]')

      // Should show success message
      await expect(page.locator('text=Treatment plan created successfully')).toBeVisible()
    })

    test('should show AI-powered treatment recommendations @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')

      // Select patient
      await page.click('text=Select Patient')
      await page.click('text=Jane Smith')

      // Check for AI recommendations
      await expect(page.locator('text=AI Recommendations')).toBeVisible()
      await expect(page.locator('text=Recommended Treatments')).toBeVisible()
      await expect(page.locator('text=Success Probability')).toBeVisible()
      await expect(page.locator('text=Alternative Options')).toBeVisible()
    })
  })

  test.describe('Aesthetic Assessment @professional', () => {
    test('should conduct facial assessment @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=New Assessment')

      // Fill assessment form
      await page.selectOption('select[name="assessmentType"]', 'facial-analysis')
      await page.fill('input[name="patientAge"]', '35')
      await page.selectOption('select[name="skinType"]', 'normal')
      await page.selectOption('select[name="skinConcerns"]', 'wrinkles')

      await page.click('button[type="submit"]')

      // Should show assessment results
      await expect(page.locator('text=Assessment Results')).toBeVisible()
      await expect(page.locator('text=Skin Analysis')).toBeVisible()
      await expect(page.locator('text=Treatment Recommendations')).toBeVisible()
    })

    test('should upload and analyze progress photos @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Progress Photos')

      // Check photo upload interface
      await expect(page.locator('text=Upload Photos')).toBeVisible()
      await expect(page.locator('text=Before Photos')).toBeVisible()
      await expect(page.locator('text=After Photos')).toBeVisible()
      await expect(page.locator('text=LGPD Compliance Notice')).toBeVisible()

      // Test file upload
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles('./test-data/before-photo.jpg')

      // Should show uploaded photo
      await expect(page.locator('text=before-photo.jpg')).toBeVisible()
    })

    test('should use AI for facial analysis @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=AI Analysis')

      // Check AI analysis features
      await expect(page.locator('text=AI Facial Analysis')).toBeVisible()
      await expect(page.locator('text=Wrinkle Detection')).toBeVisible()
      await expect(page.locator('text=Skin Quality Assessment')).toBeVisible()
      await expect(page.locator('text=Treatment Simulation')).toBeVisible()
    })
  })

  test.describe('Treatment Options and Pricing @professional', () => {
    test('should show available aesthetic treatments @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Treatment Catalog')

      // Check treatment categories
      await expect(page.locator('text=Botox')).toBeVisible()
      await expect(page.locator('text=Dermal Fillers')).toBeVisible()
      await expect(page.locator('text=Chemical Peels')).toBeVisible()
      await expect(page.locator('text=Laser Treatments')).toBeVisible()
      await expect(page.locator('text=Skin Care')).toBeVisible()
    })

    test('should calculate treatment costs @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Cost Calculator')

      // Select treatment
      await page.selectOption('select[name="treatment"]', 'botox-forehead')
      await page.fill('input[name="units"]', '20')
      await page.selectOption('select[name="sessions"]', '1')

      // Check cost calculation
      await expect(page.locator('text=Cost Breakdown')).toBeVisible()
      await expect(page.locator('text=Treatment Cost')).toBeVisible()
      await expect(page.locator('text=Professional Fee')).toBeVisible()
      await expect(page.locator('text=Total Cost')).toBeVisible()
    })

    test('should handle package deals @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Treatment Packages')

      // Check package options
      await expect(page.locator('text=Anti-Aging Package')).toBeVisible()
      await expect(page.locator('text=Facial Harmony Package')).toBeVisible()
      await expect(page.locator('text=Premium Package')).toBeVisible()

      // Select package
      await page.click('text=Anti-Aging Package')

      // Should show package details
      await expect(page.locator('text=Package Includes')).toBeVisible()
      await expect(page.locator('text=Package Price')).toBeVisible()
      await expect(page.locator('text=Savings')).toBeVisible()
    })
  })

  test.describe('Treatment Timeline and Scheduling @professional', () => {
    test('should create treatment schedule @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Treatment Schedule')

      // Fill schedule form
      await page.fill('input[name="treatmentName"]', 'Botox Treatment')
      await page.fill('input[name="startDate"]', '2024-01-15')
      await page.fill('input[name="interval"]', '6')
      await page.selectOption('select[name="frequency"]', 'months')

      await page.click('button[type="submit"]')

      // Should show treatment calendar
      await expect(page.locator('text=Treatment Calendar')).toBeVisible()
      await expect(page.locator('text=Upcoming Sessions')).toBeVisible()
    })

    test('should handle recurring treatments @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Recurring Treatments')

      // Set up recurring treatment
      await page.selectOption('select[name="treatmentType"]', 'botox-maintenance')
      await page.fill('input[name="frequency"]', '6')
      await page.selectOption('select[name="period"]', 'months')
      await page.check('input[name="autoRemind"]')

      await page.click('button[type="submit"]')

      // Should show recurring schedule
      await expect(page.locator('text=Recurring Schedule')).toBeVisible()
      await expect(page.locator('text=Next Appointment')).toBeVisible()
    })
  })

  test.describe('Progress Tracking @professional', () => {
    test('should track treatment progress @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Progress Tracking')

      // Check progress tracking features
      await expect(page.locator('text=Progress Overview')).toBeVisible()
      await expect(page.locator('text=Treatment History')).toBeVisible()
      await expect(page.locator('text=Results Timeline')).toBeVisible()
      await expect(page.locator('text=Patient Satisfaction')).toBeVisible()
    })

    test('should show before/after comparison @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Before/After Comparison')

      // Check comparison features
      await expect(page.locator('text=Photo Comparison')).toBeVisible()
      await expect(page.locator('text=Progress Metrics')).toBeVisible()
      await expect(page.locator('text=AI Analysis')).toBeVisible()
    })

    test('should generate progress reports @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Progress Reports')

      // Generate report
      await page.click('text=Generate Report')

      // Should show report options
      await expect(page.locator('text=Report Type')).toBeVisible()
      await expect(page.locator('text=Date Range')).toBeVisible()
      await expect(page.locator('text=Include Photos')).toBeVisible()

      await page.click('button[type="submit"]')

      // Should show generated report
      await expect(page.locator('text=Progress Report')).toBeVisible()
    })
  })

  test.describe('Safety and Compliance @professional', () => {
    test('should show safety protocols @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Safety Protocols')

      // Check safety information
      await expect(page.locator('text=Safety Guidelines')).toBeVisible()
      await expect(page.locator('text=Contraindications')).toBeVisible()
      await expect(page.locator('text=Side Effects')).toBeVisible()
      await expect(page.locator('text=Emergency Procedures')).toBeVisible()
    })

    test('should handle contraindications @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Contraindication Check')

      // Fill medical history
      await page.check('input[name="pregnancy"]')
      await page.check('input[name="allergies"]')
      await page.fill('textarea[name="medications"]', 'Blood thinners')

      await page.click('button[type="submit"]')

      // Should show contraindication results
      await expect(page.locator('text=Contraindication Results')).toBeVisible()
      await expect(page.locator('text=Treatment Suitability')).toBeVisible()
    })

    test('should ensure LGPD compliance @desktop', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Privacy Settings')

      // Check compliance features
      await expect(page.locator('text=Data Protection')).toBeVisible()
      await expect(page.locator('text=Consent Management')).toBeVisible()
      await expect(page.locator('text=Photo Privacy')).toBeVisible()
      await expect(page.locator('text=Access Logs')).toBeVisible()
    })
  })

  test.describe('Mobile Treatment Planning @mobile', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('should work on mobile devices @mobile', async ({ page }) => {
      await page.click('text=Treatment Planning')

      // Check mobile responsive design
      await expect(page.locator('text=Treatment Planning')).toBeVisible()
      await expect(page.locator('text=Patient List')).toBeVisible()
      await expect(page.locator('text=Quick Actions')).toBeVisible()
    })

    test('should use mobile-friendly forms @mobile', async ({ page }) => {
      await page.click('text=Treatment Planning')
      await page.click('text=Quick Assessment')

      // Check mobile-optimized form
      await expect(page.locator('text=Quick Assessment')).toBeVisible()
      await expect(page.locator('text=Camera Capture')).toBeVisible()
      await expect(page.locator('text=Voice Notes')).toBeVisible()
    })
  })
})
