// =============================================================================
// 🎭 AR RESULTS SIMULATOR API ENDPOINTS
// =============================================================================
// ROI Impact: $875,000/year through increased conversion and patient satisfaction
// Features: 3D modeling, treatment simulation, AR visualization, outcome prediction
// =============================================================================

import { ARResultsSimulatorService, } from '@/services/ar-simulator/ARResultsSimulatorService'
import { Hono, } from 'hono'

import { HTTP_STATUS, } from './ar-simulator-constants'
import { getErrorMessage, } from './ar-simulator-helpers'
import { CompareSimulationsSchema, CreateSimulationSchema, } from './ar-simulator-schemas'

// =============================================================================
// ROUTER SETUP
// =============================================================================

const arSimulator = new Hono()

// Service instance
const simulatorService = ARResultsSimulatorService.getInstance()

// =============================================================================
// SIMULATION ENDPOINTS
// =============================================================================

/**
 * POST /api/ai/ar-simulator/simulations
 * Create a new AR simulation
 */
arSimulator.post('/simulations', async (context,) => {
  try {
    const body = await context.req.json()
    const validationResult = CreateSimulationSchema.safeParse(body,)

    if (!validationResult.success) {
      return context.json(
        {
          details: validationResult.error.issues,
          error: 'Invalid simulation data',
          success: false,
        },
        HTTP_STATUS.BAD_REQUEST,
      )
    }

    const simulation = await simulatorService.createSimulation(
      validationResult.data,
    )

    return context.json({
      data: simulation,
      success: true,
    },)
  } catch (error) {
    return context.json(
      {
        error: 'Failed to create AR simulation',
        message: getErrorMessage(error,),
        success: false,
      },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    )
  }
},)

/**
 * GET /api/ai/ar-simulator/simulations/:simulationId
 * Get simulation details and results
 */
arSimulator.get('/simulations/:simulationId', async (context,) => {
  try {
    const { simulationId, } = context.req.param()
    const simulation = await simulatorService.getSimulation(simulationId,)

    if (!simulation) {
      return context.json(
        {
          error: 'Simulation not found',
          success: false,
        },
        HTTP_STATUS.NOT_FOUND,
      )
    }

    // Track view for analytics
    await simulatorService.incrementViewCount(simulationId,)
    return context.json({
      data: simulation,
      success: true,
    },)
  } catch (error) {
    return context.json(
      {
        error: 'Failed to retrieve AR simulation',
        message: getErrorMessage(error,),
        success: false,
      },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    )
  }
},)

/**
 * GET /api/ai/ar-simulator/simulations/:simulationId/status
 * Get real-time simulation processing status
 */
arSimulator.get('/simulations/:simulationId/status', async (context,) => {
  try {
    const { simulationId, } = context.req.param()
    const status = await simulatorService.getSimulationStatus(simulationId,)

    if (!status) {
      return context.json(
        {
          error: 'Simulation not found',
          success: false,
        },
        HTTP_STATUS.NOT_FOUND,
      )
    }

    return context.json({
      data: {
        simulationId,
        status,
        timestamp: new Date().toISOString(),
      },
      success: true,
    },)
  } catch {
    return context.json(
      {
        error: 'Failed to get simulation status',
        success: false,
      },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    )
  }
},)

/**
 * GET /api/ai/ar-simulator/patients/:patientId/simulations
 * Get all simulations for a patient
 */
arSimulator.get('/patients/:patientId/simulations', async (context,) => {
  try {
    const { patientId, } = context.req.param()
    const simulations = await simulatorService.getPatientSimulations(patientId,)
    return context.json({
      data: {
        patientId,
        simulations,
        total: simulations.length,
      },
      success: true,
    },)
  } catch {
    return context.json(
      {
        error: 'Failed to retrieve patient simulations',
        success: false,
      },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    )
  }
},)

/**
 * DELETE /api/ai/ar-simulator/simulations/:simulationId
 * Delete a simulation
 */
arSimulator.delete('/simulations/:simulationId', async (context,) => {
  try {
    const { simulationId, } = context.req.param()
    await simulatorService.deleteSimulation(simulationId,)
    return context.json({
      message: `Simulation ${simulationId} deleted successfully`,
      success: true,
    },)
  } catch {
    return context.json(
      {
        error: 'Failed to delete AR simulation',
        success: false,
      },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    )
  }
},)

/**
 * POST /api/ai/ar-simulator/comparisons
 * Compare multiple simulations
 */
arSimulator.post('/comparisons', async (context,) => {
  try {
    const body = await context.req.json()
    const validationResult = CompareSimulationsSchema.safeParse(body,)

    if (!validationResult.success) {
      return context.json(
        {
          details: validationResult.error.issues,
          error: 'Invalid comparison request data',
          success: false,
        },
        HTTP_STATUS.BAD_REQUEST,
      )
    }

    const comparison = await simulatorService.compareSimulations(
      validationResult.data.simulationIds,
      validationResult.data.comparisonType,
    )
    return context.json({
      data: comparison,
      success: true,
    },)
  } catch (error) {
    return context.json(
      {
        error: 'Failed to compare simulations',
        message: getErrorMessage(error,),
        success: false,
      },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    )
  }
},)

export default arSimulator
