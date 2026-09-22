# Mortgage renewal web contribution

This folder is a pack-owned shared web runtime contribution for the IQ Accelerator
monorepo. It is not a standalone Vite or Next.js application: imports such as
`@/components/iq/IqChat`, `@/lib/story/slide-kit`, and
`@/lib/fabric-semantic-model.server` are supplied by the upstream shared web
runtime when the pack is materialized into the accelerator.

The overlay intentionally contains only pack presentation, static aggregate
fixtures, semantic-model query boundaries, story defaults, and contract tests. It
does not copy the legacy deployment, BFF, cloud configuration, sensitive values,
or customer-level data.
