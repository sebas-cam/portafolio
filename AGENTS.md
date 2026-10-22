<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All copy lives in src/content/site.ts as {en,es} pairs; pages live under the /$lang route so both languages stay in parity.
- Reuse portfolio section renderers across Home and About so experience, education and stack cannot drift.
- Separate selected-product cards from legacy project slugs; retain published detail URLs without promoting incomplete case studies.
- Social metadata uses published asset URLs and localized portfolio titles; generated share images are project assets, not content-page illustrations.
