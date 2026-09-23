# decisions

No formal ADR files were found. The following decisions are documented inline and should be promoted to numbered ADRs if this product is maintained:

- OBO is required so Work IQ uses the signed-in user's identity: `app/README.md:12-20`.
- BFF and SPA are separated to keep the BFF secret off the internet: `app/README.md:35-55`.
- Citation text is kept separate from prose to avoid offset corruption: `app/README.md:22-27`.
- Bicep manages Azure control-plane resources; Python manages data-plane objects: `infra/README.md:15-40`.
- Fabric curated data is materialized as Delta tables rather than Spark views: `README.md:151-154`.
- Semantic ranking is required; local JSON fallback is retained for demos: `infra/README.md:145-148`.

### Open questions

- **Unknown:** which decisions are accepted versus historical notes.
- **Unknown:** decision owners and review dates.
