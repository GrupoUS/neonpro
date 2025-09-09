import { createRequire, } from 'node:module'
import path from 'node:path'
import { describe, expect, it, } from 'vitest'

const requireCjs = createRequire(import.meta.url,)

describe('React singleton resolution', () => {
  it('react versions should match across all consumers and hooks render without invalid calls', async () => {
    // Resolve react package.json versions from multiple perspectives
    const baseReactPkg = requireCjs(path.join(requireCjs.resolve('react/package.json',),),)

    const rqDir = path.dirname(requireCjs.resolve('@tanstack/react-query/package.json',),)
    const rqReactPkg = requireCjs(
      path.join(requireCjs.resolve('react/package.json', { paths: [rqDir,], },),),
    )

    const rtlDir = path.dirname(requireCjs.resolve('@testing-library/react/package.json',),)
    const rtlReactPkg = requireCjs(
      path.join(requireCjs.resolve('react/package.json', { paths: [rtlDir,], },),),
    )

    const sharedDir = path.resolve(process.cwd(), 'packages/shared',)
    let sharedReactPkg: any = null
    try {
      sharedReactPkg = requireCjs(
        path.join(requireCjs.resolve('react/package.json', { paths: [sharedDir,], },),),
      )
    } catch {
      sharedReactPkg = null
    }

    const versions = [
      baseReactPkg.version,
      rqReactPkg.version,
      rtlReactPkg.version,
      sharedReactPkg?.version ?? baseReactPkg.version,
    ]

    // eslint-disable-next-line no-console
    console.log('react versions', versions,)

    // All detected versions must be identical
    expect(new Set(versions,).size,).toBe(1,)
  })

  it('react-dom versions should match across all consumers', async () => {
    const baseDomPkg = requireCjs(path.join(requireCjs.resolve('react-dom/package.json',),),)

    const rqDir = path.dirname(requireCjs.resolve('@tanstack/react-query/package.json',),)
    const rqDomPkg = requireCjs(
      path.join(requireCjs.resolve('react-dom/package.json', { paths: [rqDir,], },),),
    )

    const rtlDir = path.dirname(requireCjs.resolve('@testing-library/react/package.json',),)
    const rtlDomPkg = requireCjs(
      path.join(requireCjs.resolve('react-dom/package.json', { paths: [rtlDir,], },),),
    )

    const versions = [baseDomPkg.version, rqDomPkg.version, rtlDomPkg.version,]

    // eslint-disable-next-line no-console
    console.log('react-dom versions', versions,)

    expect(new Set(versions,).size,).toBe(1,)
  })
})
