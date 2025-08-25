import { NanaRouter } from '@harlos/nana'

const router = new NanaRouter()

/**
 * GET /config
 * Reads config from `./config.json`.
 */
router.get('/config', async ctx => {})

/** PUT /config
 * Writes config to `./config.json`.
 */
router.put('/config', async ctx => {})

/**
 * GET /timer
 * Reads timer data from `./timer.json`.
 */
router.get('/timer', async ctx => {})

/**
 * PUT /timer
 * Writes timer data to `./timer.json`.
 */
router.put('/timer', async ctx => {})

/**
 * POST /wheel
 * Turn the wheel. (Claude, do this later.)
 */

export default router
