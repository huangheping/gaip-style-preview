:root { color-scheme: light; font-family: system-ui, sans-serif; color: #2f3640; background: #fff; }
* { box-sizing: border-box; }
body { margin: 0; }
.page { width: min(100%, 1200px); margin-inline: auto; padding: 24px; }
.page__header { margin-block-end: 24px; }
.page__header h1 { margin: 0; font-size: 24px; line-height: 1.4; }
.page :focus-visible { outline: 2px solid #025b52; outline-offset: 3px; }
@media (max-width: 600px) { .page { padding: 16px; } }
