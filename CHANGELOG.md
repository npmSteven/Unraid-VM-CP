# Changelog

## [1.2.1](https://github.com/npmSteven/Unraid-VM-CP/compare/v1.2.0...v1.2.1) (2026-07-28)


### Bug Fixes

* auth guard pattern — function-based plugin, Docker perms, frontend source ([fa9a8e6](https://github.com/npmSteven/Unraid-VM-CP/commit/fa9a8e69b891c2cdef3cdd7a33f4fc60e2ae54f5))
* Dockerfile — replace pnpm with bun install, add optimizations ([fb1181a](https://github.com/npmSteven/Unraid-VM-CP/commit/fb1181ae60c41d7e54989863d963a34414f620b8))

## [1.2.0](https://github.com/npmSteven/Unraid-VM-CP/compare/v1.1.1...v1.2.0) (2026-07-28)


### Features

* migrate 6 VM actions from VMajax.php to GraphQL API ([1472dec](https://github.com/npmSteven/Unraid-VM-CP/commit/1472deca61d9ede4ee58b5989cbdd2e1956de6ab))
* migrate 6 VM actions to GraphQL API ([854bf86](https://github.com/npmSteven/Unraid-VM-CP/commit/854bf86ddfb43b59a1d7b1aaff571145d9dcf207))
* migrate backend to Bun — Elysia, Drizzle, bun:sqlite, bun test ([653065d](https://github.com/npmSteven/Unraid-VM-CP/commit/653065dbbba5fce9791c19314454be91662ef4e1))
* migrate backend to Bun — Elysia, Drizzle, bun:sqlite, bun test ([5e5ee74](https://github.com/npmSteven/Unraid-VM-CP/commit/5e5ee74fdc0eee8e23dc1742e094159dd110c968))

## [1.1.1](https://github.com/npmSteven/Unraid-VM-CP/compare/v1.1.0...v1.1.1) (2026-07-27)


### Bug Fixes

* pass release tag to build workflow to avoid invalid Docker tag ([a26e545](https://github.com/npmSteven/Unraid-VM-CP/commit/a26e54588329647c7025e01b9d82a6f5da1d0f2f)), closes [#7](https://github.com/npmSteven/Unraid-VM-CP/issues/7)

## [1.1.0](https://github.com/npmSteven/Unraid-VM-CP/compare/v1.0.0...v1.1.0) (2026-07-27)


### Features

* add reverse proxy support ([9edb3f6](https://github.com/npmSteven/Unraid-VM-CP/commit/9edb3f62d533a8432b0abdc221f8d9123b677a8c))
* add reverse proxy support ([b108328](https://github.com/npmSteven/Unraid-VM-CP/commit/b108328132666d2f47d683f00e47762039217616)), closes [#3](https://github.com/npmSteven/Unraid-VM-CP/issues/3)
* add UNRAID_PORT support for custom Unraid ports ([4048a17](https://github.com/npmSteven/Unraid-VM-CP/commit/4048a177a8eeeab7e03da788e3a5e00016c5ad08)), closes [#4](https://github.com/npmSteven/Unraid-VM-CP/issues/4)


### Bug Fixes

* add flat-format parsing for non-English Unraid VM responses ([e53432a](https://github.com/npmSteven/Unraid-VM-CP/commit/e53432a2c1e72b333fabf3e23d09d849f87ede26))
* add flat-format parsing for non-English Unraid VM responses ([9a195aa](https://github.com/npmSteven/Unraid-VM-CP/commit/9a195aab86d8f9f253fdaf7b43284416a029f439)), closes [#2](https://github.com/npmSteven/Unraid-VM-CP/issues/2)
