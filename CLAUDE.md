# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`restjsonapi` is a **library of TypeScript/React components**, not a standalone application. It has **no `package.json`, no `tsconfig.json`, and no build system** of its own — it's consumed as source by a host app (e.g. the parent `antdreactperseus` repo) which provides React, Ant Design, `umi-request`, `react-localization`, Keycloak, `js-file-download`, etc.

Consequences:
- There are no commands to run from inside this directory. Build, lint, and test are driven by the host app.
- Imports inside this submodule should remain relative (`../ts/...`, `../../services/api`) — no path aliases.
- New runtime dependencies must be added to the host app's `package.json`; this submodule cannot declare its own.

Upstream: <https://github.com/stanislawbartkowski/restjsonapi> (wiki documents the JSON contract).

## Big-picture architecture

The library renders **configuration-driven UI**: the host calls one of the top-level components with a small props bundle (typically `{ list, listdef, params, vars }`), and the component fetches a **definition** from the backend that describes the columns/fields/buttons to render, plus the **data** from a separate endpoint.

### Two parallel REST channels

`services/api.ts` is the single HTTP entry point. Every call injects auth/session/domain headers and supports a pluggable `urlModifier` / `headerModifier` (used by hosts to inject things like a tenant or active-record ID into every request).

- `restapilist(path, params)` — data (`GET /<prefix><path>`)
- `restapilistdef(resource)` — component definition (`GET /<prefix>compdef?resource=<resource>`)
- `restapiresource(resource)` — app config / localized strings / left menu (`GET /<prefix>resource?resource=<resource>`)
- `restapijs(resource)` — JS source returned as a string (`GET /<prefix>getjs?resource=<resource>`)
- `restaction(method, path, params, body)` — generic POST/PUT/DELETE for button actions

In production (gated by `readR("PROD")`), GET responses are cached with a 1-hour TTL via `umi-request`'s built-in cache. Definitions are always cacheable; data is cached only if the host registered the path via `isgetCached`.

### Definition → render pipeline

The orchestrator is `components/ts/readdefs.ts`. The flow for `<RestTable>` (and `<ModalForm>`, which uses the same code path):

1. `readdefs(props, setState)` calls `restapilistdef(listdef ?? list)`.
2. Inspects the response with `preseT()` → one of `TPreseEnum.{ColumnList, TForm, Steps}`. This is **the central dispatch**: ColumnList → tabular display, TForm → modal form, Steps → multi-step wizard.
3. For `TForm`, resolves dynamic content **before render**:
   - `beforedialog` REST call → initial vars for the form context
   - `restapivals` REST call → initial field values
   - `resolveRest()` walks the field tree and replaces `dynamiccollapse`, nested `tab`/`collapse`/`items`, and `checkbox`/`radio` items whose `items` is a REST descriptor — each becomes another REST call to populate options.
4. Optionally pulls a `header` (read-only details strip) via `restapishowdetils`.
5. Optionally fetches an inline JS string (`idef.js`) which is `eval`-rendered via `<InLine>` at mount.
6. Calls back with `{ status: READY, res, js, initvar }` and the component renders.

`RestTable` (`components/RestTable/index.tsx`) is a thin shell that calls `readdefs` twice — once for the main list, once for `listcarddef` if cards are enabled — then dispatches to `DrawTable` (table view), `Cards` (card view), or `ModalDialog` (group view) based on a cookie-persisted `VIEW`.

### Backend-supplied JavaScript

`ts/j.ts::callJSFunction` builds and executes string code via `new Function(...)`. This is used pervasively — `jsaction` fields, `hidden` predicates, custom click handlers, message templating — so a definition can carry executable logic. **Backend definitions are trusted code.** When modifying anything that touches `js`, `jsaction`, `dynamiccollapse`, or `restapivals`, preserve that contract; do not switch to a safer evaluator without coordinating with the backend team.

### Action / button system

Buttons declared in a definition are turned into `TAction` records. `components/ts/executeaction.ts` is the runtime: `createII` packages a button + form refs into an `IIButtonAction`, `executeB` dispatches it, and `clickButton` decides between popup dialog (`ispopupDialog` — true if the action has its own `list`/`listdef`), REST call, redirect, print, or file download. Errors come back as either notifications (`openNotification`) or per-field errors propagated into the form via `IIRefCall.setMode`.

### Bootstrap

`ts/init.tsx::init()` is the canonical startup sequence the host should call:

1. `setHost(serverURL)` (URL discovered via `getServerUrl()` from `services/readconf`)
2. `setSec(...)` + `initkeyclock()` — optional Keycloak auth
3. `readResource()` (`ts/readresource.ts`) — sequentially fetches `appdata`, optional `authlabel`, `defaults`, optional inline JS scripts, `strings` (sets language via `setStrings`), and `leftmenu`
4. Optional `customReadResource` hook for the host
5. `setMenuRoute(...)` to install the default redirect

A host can override `customReadResource` via `setCustomReadResource` to layer in its own startup work.

### Types

`ts/typing.ts` (app-level types: `RestTableParam`, `TRow`, `FormMessage`, `HTTPMETHOD`, modifier function signatures) and `components/ts/typing.ts` (component-level types: `ColumnList`, `TForm`, `TField`, `TAction`, `Status`, `TPreseEnum`) are the contracts to read first when working with anything in this library. Treat them as the source of truth for what backend JSON shapes are accepted.

### Localization

`ts/localize.ts` ships an embedded Polish (`pl`) string table and merges it with whatever the backend returns from `restapiresource("strings")`. The active language comes from `appdata.language`. Adding a new user-facing string requires updating both the embedded table (for safety when the backend resource is missing) and the backend resource.
