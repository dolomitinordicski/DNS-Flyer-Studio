# Flyer integrated acceptance

This suite runs the actual Flyer UI, repository services and area-shared image library against Firebase Auth, Firestore and Storage emulators and the exact candidate rules of Shared Data #234, commit 45be033975d6a9a8b118109d2230d4f758976e63. verify-upstream.mjs compares both checked-in rules files with that immutable upstream source.

Use the dedicated Vite config only for tests: all dnsCore imports resolve to a loopback-only demo-dns-identity connection. Production imports and configuration are unchanged. The CI checks that the demo connection is absent from the normal production bundle. Browser requests to remote assets/APIs are blocked. No production credentials are used.

Coverage: real email/password login, writer UI editing/autosave/manual save/logout/login/reload, writer upload and reader reload of the same area image library, read-only and write-only behavior, inactive/no grant/expired/future/malformed authorization, owner without grant, foreign-area denial, CRUD, explicit publish permissions and scoped reload, DNS Admin, PNG export and two isolated sessions. The synthetic organization/area records are only in the demo emulator.

Run on Node 22/Java 21 with @playwright/test 1.56.1, @firebase/rules-unit-testing 5.0.0 and firebase-tools 15.34.2, as specified in .github/workflows/acceptance.yml. The tests refuse other project IDs or emulator hosts.

This is a pre-merge candidate check, not a production smoke test or permission to deploy. Adding the tests does not change the status of existing Firestore rules or publish the Flyer app.
